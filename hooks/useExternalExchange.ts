import { useEnvironment } from "../contexts/environment";
import type { UniswapV2Pool } from "../graphql/uniswapV2";
import type { UniswapV3Pool } from "../graphql/uniswapV3";
import { feeTiers } from "../graphql/uniswapV3";
import type { Market } from "../lib/types/market";
import { calcMedianPrice, sortTokens } from "../lib/uniswap";
import type { HookArg } from "./internal/types";
import { useQueryKey } from "./internal/useQueryKey";
import { externalRefetchInterval } from "./internal/utils";
import { balanceOf } from "@/lib/reverseMirage/token";
import { getUniswapV2Pair } from "@/lib/reverseMirage/uniswapV2";
import { getUniswapV3Pool } from "@/lib/reverseMirage/uniswapV3";
import { useQuery } from "@tanstack/react-query";
import { CurrencyAmount, Price } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import { chunk } from "lodash";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { objectKeys } from "ts-extras";
import {
  encodeAbiParameters,
  encodePacked,
  getCreate2Address,
  keccak256,
  parseAbiParameters,
} from "viem";
import { Address, usePublicClient } from "wagmi";

export const isV3 = (t: UniswapV2Pool | UniswapV3Pool): t is UniswapV3Pool =>
  t.version === "V3";

export const useMostLiquidMarket = (market: HookArg<Market>) => {
  const publicClient = usePublicClient();
  const environment = useEnvironment();

  const v2PriceQuery = useV2Price(market);
  const v3PriceQuery = useV3Price(market);

  const { v2Address, v3Addresses } = useMemo(() => {
    if (!market) return {};
    const [token0, token1] = sortTokens([market.base, market.quote]);

    const v2Address = getCreate2Address({
      from: environment.interface.uniswapV2.factoryAddress,
      bytecode: environment.interface.uniswapV2.pairInitCodeHash,
      salt: keccak256(
        encodePacked(
          ["address", "address"],
          [token0.address as Address, token1.address as Address],
        ),
      ),
    });

    const v3Addresses = objectKeys(FeeAmount).map((fee) =>
      getCreate2Address({
        from: environment.interface.uniswapV3.factoryAddress,
        bytecode: environment.interface.uniswapV3.pairInitCodeHash,
        salt: keccak256(
          encodeAbiParameters(
            parseAbiParameters("address tokenA, address tokenB, uint24 fee"),
            [
              token0.address as Address,
              token1.address as Address,
              FeeAmount[fee],
            ],
          ),
        ),
      }),
    );

    return { v2Address, v3Addresses };
  }, [
    environment.interface.uniswapV2.factoryAddress,
    environment.interface.uniswapV2.pairInitCodeHash,
    environment.interface.uniswapV3.factoryAddress,
    environment.interface.uniswapV3.pairInitCodeHash,
    market,
  ]);

  const queryKey = useQueryKey(
    v2Address && v3Addresses && market
      ? [v2Address, ...v3Addresses].flatMap((a) => [
          {
            get: balanceOf,
            args: { token: market.quote, address: a },
          },
          {
            get: balanceOf,
            args: { token: market.base, address: a },
          },
        ])
      : undefined,
  );

  const balancesQuery = useQuery({
    queryKey,
    queryFn: () => {
      invariant(v2Address && v3Addresses && market);

      return Promise.all(
        [v2Address, ...v3Addresses].flatMap((a) => [
          balanceOf(publicClient, { token: market.quote, address: a }),
          balanceOf(publicClient, { token: market.base, address: a }),
        ]),
      );
    },
    enabled: !!v2Address && !!v3Addresses && !!market,
    staleTime: Infinity,
    refetchInterval: 60_000,
  });

  return useMemo(() => {
    if (
      v2PriceQuery.isLoading ||
      v3PriceQuery.isLoading ||
      balancesQuery.isLoading
    )
      return { status: "loading" } as const;
    if (v2PriceQuery.isError || v3PriceQuery.isError || balancesQuery.isError)
      return { status: "error" } as const;
    invariant(market);

    // token0 / token1
    const medianPrice = calcMedianPrice(
      v3PriceQuery.data.concat(v2PriceQuery.data),
      market,
    );

    const tvls = chunk(balancesQuery.data, 2).map((b) => {
      if (!b) return undefined;
      return b[1]!.add(medianPrice.quote(b[0]!));
    });

    const maxTVLIndex = tvls.reduce(
      (acc, cur, i) =>
        cur?.greaterThan(acc.max) ? { index: i, max: cur } : acc,
      { index: 0, max: CurrencyAmount.fromRawAmount(market.quote, 0) },
    );

    if (maxTVLIndex.index === 0)
      return {
        status: "success",
        data: {
          price: v2PriceQuery.data,
          pool: { version: "V2" } as UniswapV2Pool,
        },
      } as const;
    else {
      return {
        status: "success",
        data: {
          price: v3PriceQuery.data[maxTVLIndex.index - 1]!,
          pool: {
            version: "V3",
            feeTier: objectKeys(feeTiers)[maxTVLIndex.index - 1],
          } as UniswapV3Pool,
        },
      } as const;
    }
  }, [
    balancesQuery.data,
    balancesQuery.isError,
    balancesQuery.isLoading,
    market,
    v2PriceQuery.data,
    v2PriceQuery.isError,
    v2PriceQuery.isLoading,
    v3PriceQuery.data,
    v3PriceQuery.isError,
    v3PriceQuery.isLoading,
  ]);
};

const useV2Price = (market: HookArg<Market>) => {
  const publicClient = usePublicClient();
  const environment = useEnvironment();

  const queryKey = useQueryKey(
    market
      ? [
          {
            get: getUniswapV2Pair,
            args: {
              tokenA: market.quote,
              tokenB: market.base,
              factoryAddress: environment.interface.uniswapV2.factoryAddress,
              bytecode: environment.interface.uniswapV2.pairInitCodeHash,
            },
          },
        ]
      : undefined,
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      invariant(market);

      const pair = await getUniswapV2Pair(publicClient, {
        tokenA: market.quote,
        tokenB: market.base,
        factoryAddress: environment.interface.uniswapV2.factoryAddress,
        bytecode: environment.interface.uniswapV2.pairInitCodeHash,
      });

      const price = pair.token0.equals(market.quote)
        ? pair.token1Price
        : pair.token0Price;

      return new Price(
        market.base,
        market.quote,
        price.denominator,
        price.numerator,
      );
    },
    enabled: !!market,
    staleTime: Infinity,
    refetchInterval: externalRefetchInterval,
  });
};

const useV3Price = (market: HookArg<Market>) => {
  const publicClient = usePublicClient();
  const environment = useEnvironment();

  const queryKey = useQueryKey(
    market
      ? objectKeys(FeeAmount).map((f) => ({
          get: getUniswapV3Pool,
          args: {
            tokenA: market.quote,
            tokenB: market.base,
            feeAmount: FeeAmount[f],
            factoryAddress: environment.interface.uniswapV2.factoryAddress,
            bytecode: environment.interface.uniswapV2.pairInitCodeHash,
          },
        }))
      : undefined,
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      invariant(market);

      const pools = await Promise.all(
        objectKeys(FeeAmount).map((f) =>
          getUniswapV3Pool(publicClient, {
            tokenA: market.quote,
            tokenB: market.base,
            feeAmount: FeeAmount[f],
            factoryAddress: environment.interface.uniswapV2.factoryAddress,
            bytecode: environment.interface.uniswapV2.pairInitCodeHash,
          }),
        ),
      );

      return pools.map((p) => {
        const price = p.token0.equals(market.quote)
          ? p.token1Price
          : p.token0Price;

        return new Price(
          market.base,
          market.quote,
          price.denominator,
          price.numerator,
        );
      });
    },
    enabled: !!market,
    staleTime: Infinity,
    refetchInterval: externalRefetchInterval,
  });
};
