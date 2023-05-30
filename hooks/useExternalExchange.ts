import { useEnvironment } from "../contexts/environment";
import type { UniswapV2Pool } from "../graphql/uniswapV2";
import { FeeAmount, UniswapV3Pool } from "../graphql/uniswapV3";
import type { Market } from "../lib/types/market";
import { calcMedianPrice, sortTokens } from "../lib/uniswap";
import type { HookArg } from "./internal/types";
import { useQueryGenerator } from "./internal/useQueryGenerator";
import { externalRefetchInterval } from "./internal/utils";
import { erc20BalanceOf } from "@/lib/reverseMirage/token";
import { uniswapV2GetPair } from "@/lib/reverseMirage/uniswapV2";
import { uniswapV3GetPool } from "@/lib/reverseMirage/uniswapV3";
import { Token } from "@/lib/types/currency";
import { UseQueryResult, useQueries, useQuery } from "@tanstack/react-query";
import { CurrencyAmount, Price } from "@uniswap/sdk-core";
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
import { Address } from "wagmi";

export const isV3 = (t: UniswapV2Pool | UniswapV3Pool): t is UniswapV3Pool =>
  t.version === "V3";

export const useMostLiquidMarket = (market: HookArg<Market>) => {
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

  const balanceQuery = useQueryGenerator(erc20BalanceOf);

  const balanceQueries = useQueries({
    queries:
      v2Address && v3Addresses
        ? [v2Address, ...v3Addresses].flatMap((a) => [
            {
              ...balanceQuery({
                token: market?.quote,
                address: a,
              }),
              refetchInterval: 60_000,
            },
            {
              ...balanceQuery({
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
      const balance0: UseQueryResult<CurrencyAmount<Token>> = bq[0]!;
      const balance1: UseQueryResult<CurrencyAmount<Token>> = bq[1]!;

      if (!balance0.data || !balance1.data) return undefined;
      return balance1.data.add(medianPrice.quote(balance0.data));
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
          price: v2PriceQuery.data!,
          pool: { version: "V2" } as UniswapV2Pool,
        },
      } as const;
    else {
      return {
        status: "success",
        data: {
          price: v3PriceQuery[maxTVLIndex.index - 1]!.data!,
          pool: {
            version: "V3",
            feeTier: objectKeys(FeeAmount)[maxTVLIndex.index - 1],
          } as UniswapV3Pool,
        },
      } as const;
    }
  }, [balanceQueries, market, v2PriceQuery, v3PriceQuery]);
};

const useV2Price = (market: HookArg<Market>) => {
  const environment = useEnvironment();

  const uniswapV2Query = useQueryGenerator(uniswapV2GetPair);
  const query = uniswapV2Query({
    tokenA: market?.quote,
    tokenB: market?.base,
    factoryAddress: environment.interface.uniswapV2.factoryAddress,
    bytecode: environment.interface.uniswapV2.pairInitCodeHash,
  });

  return useQuery({
    ...query,
    refetchInterval: externalRefetchInterval,
    select: (data) => {
      if (!market) return undefined;

      const pair = query.select(data);

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
  const environment = useEnvironment();

  const uniswapV3Query = useQueryGenerator(uniswapV3GetPool);

  return useQueries({
    queries: objectKeys(FeeAmount).map((f) => {
      const query = uniswapV3Query({
        tokenA: market?.quote,
        tokenB: market?.base,
        feeAmount: +f as keyof typeof FeeAmount,
        factoryAddress: environment.interface.uniswapV2.factoryAddress,
        bytecode: environment.interface.uniswapV2.pairInitCodeHash,
      });
      return {
        ...query,
        refetchInterval: externalRefetchInterval,
        select: (
          data: Awaited<
            ReturnType<ReturnType<typeof uniswapV3GetPool>["read"]>
          >,
        ) => {
          const pool = query.select(data);
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
      };
    }),
  });
};
