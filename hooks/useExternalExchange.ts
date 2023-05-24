import { useEnvironment } from "../contexts/environment";
import type { UniswapV2Pool } from "../graphql/uniswapV2";
import { FeeAmount, UniswapV3Pool } from "../graphql/uniswapV3";
import type { Market } from "../lib/types/market";
import { calcMedianPrice, sortTokens } from "../lib/uniswap";
import type { HookArg } from "./internal/types";
import { useQueryFactory } from "./internal/useQueryFactory";
import { useQueryKey } from "./internal/useQueryKey";
import { externalRefetchInterval } from "./internal/utils";
import { useQueries, useQuery } from "@tanstack/react-query";
import { CurrencyAmount, Price } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
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
  const queries = useQueryFactory();
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
            [token0.address as Address, token1.address as Address, +fee],
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

  const balanceQueries = useQueries({
    queries:
      v2Address && v3Addresses
        ? [v2Address, ...v3Addresses].flatMap((a) => [
            {
              ...queries.reverseMirage.erc20BalanceOf({
                token: market?.quote,
                address: a,
              }),
              refetchInterval: 60_000,
            },
            {
              ...queries.reverseMirage.erc20BalanceOf({
                token: market?.base,
                address: a,
              }),
              refetchInterval: 60_000,
            },
          ])
        : [],
  });

  return useMemo(() => {
    if (
      v2PriceQuery.isLoading ||
      v3PriceQuery.some((v3p) => v3p.isLoading) ||
      balanceQueries.some((bq) => bq.isLoading)
    )
      return { status: "loading" } as const;
    if (v2PriceQuery.isError) return { status: "error" } as const;
    invariant(market);

    // token0 / token1
    const medianPrice = calcMedianPrice(
      v3PriceQuery.map((v3p) => v3p.data).concat(v2PriceQuery.data),
      market,
    );

    const tvls = chunk(balanceQueries, 2).map((bq) => {
      if (!bq || !bq[0]!.data || !bq[1]!.data) return undefined;
      return !bq[1]!.data.add(medianPrice.quote(bq[0]!.data));
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
            feeTier: objectKeys(FeeAmount)[maxTVLIndex.index - 1],
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
  const environment = useEnvironment();

  const queries = useQueryFactory();

  return useQuery({
    ...queries.reverseMirage.uniswapV2GetPair({
      tokenA: market?.quote,
      tokenB: market?.base,
      factoryAddress: environment.interface.uniswapV2.factoryAddress,
      bytecode: environment.interface.uniswapV2.pairInitCodeHash,
    }),
    refetchInterval: externalRefetchInterval,
    select: (pair) => {
      if (!market) return undefined;

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
  });
};

const useV3Price = (market: HookArg<Market>) => {
  const queries = useQueryFactory();
  const environment = useEnvironment();

  return useQueries({
    queries: objectKeys(FeeAmount).map((f) => ({
      ...queries.reverseMirage.uniswapV3GetPool({
        tokenA: market?.quote,
        tokenB: market?.base,
        feeAmount: +f as keyof typeof FeeAmount,
        factoryAddress: environment.interface.uniswapV2.factoryAddress,
        bytecode: environment.interface.uniswapV2.pairInitCodeHash,
      }),
      refetchInterval: externalRefetchInterval,
      select: (pool: Pool) => {
        if (!market) return undefined;

        const price = pool.token0.equals(market.quote)
          ? pool.token1Price
          : pool.token0Price;

        return new Price(
          market.base,
          market.quote,
          price.denominator,
          price.numerator,
        );
      },
    })),
  });
};
