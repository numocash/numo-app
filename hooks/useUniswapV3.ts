import type { HookArg } from "./internal/types";
import { userRefectchInterval } from "./internal/utils";
import { useMostLiquidMarket } from "./useExternalExchange";
import { useEnvironment } from "@/contexts/environment";
import { scale } from "@/lib/constants";
import { invert, priceToFraction, sqrt } from "@/lib/price";

import { useQueryGenerator } from "./internal/useQueryGenerator";
import { Q96 } from "@/graphql/uniswapV3";
import {
  uniswapV3BalanceOf,
  uniswapV3Position,
  uniswapV3TokenOfOwnerByIndex,
} from "@/lib/reverseMirage/uniswapV3";
import { Market } from "@/lib/types/market";
import { sortTokens } from "@/lib/uniswap";
import { useQueries, useQuery } from "@tanstack/react-query";
import { sqrt as JSBIsqrt } from "@uniswap/sdk-core";
import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import {
  FeeAmount,
  Pool,
  TickMath,
  priceToClosestTick,
  tickToPrice,
} from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { useMemo } from "react";
import { getAddress } from "viem";
import { Address } from "wagmi";

export const usePositionManagerBalanceOf = (address: HookArg<Address>) => {
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();

  const balanceQuery = useQueryGenerator(uniswapV3BalanceOf);

  return useQuery({
    ...balanceQuery({ positionManagerAddress, address }),
    refetchInterval: userRefectchInterval,
  });
};

export const useTokenIDsByIndex = (
  address: HookArg<Address>,
  balance: HookArg<number>,
) => {
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();

  const tokenIDQuery = useQueryGenerator(uniswapV3TokenOfOwnerByIndex);

  return useQuery({
    ...tokenIDQuery({ positionManagerAddress, address, balance }),
    refetchInterval: userRefectchInterval,
  });
};

export const usePositionsFromTokenIDs = (
  pool: HookArg<Pool>,
  tokenIDs: HookArg<number[]>,
) => {
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();

  const positionQuery = useQueryGenerator(uniswapV3Position);

  return useQueries({
    queries:
      tokenIDs?.map((tid) => ({
        ...positionQuery({ positionManagerAddress, pool, tokenID: tid }),
        refetchInterval: userRefectchInterval,
      })) ?? [],
  });
};

export const useNumberOfPositions = (
  address: HookArg<Address>,
  market: Market,
) => {
  const balanceQuery = usePositionManagerBalanceOf(address);
  const tokenIDQuery = useTokenIDsByIndex(
    address,
    balanceQuery.data ?? undefined,
  );
  const dummyPool = new Pool(
    market.base,
    market.quote,
    FeeAmount.MEDIUM,
    Q96,
    0,
    0,
  );
  const positionsQuery = usePositionsFromTokenIDs(dummyPool, tokenIDQuery.data);

  return useMemo(() => {
    if (balanceQuery.data === 0)
      return { status: "success", amount: 0 } as const;
    if (
      balanceQuery.isLoading ||
      tokenIDQuery.isLoading ||
      positionsQuery.some((p) => p.isLoading)
    )
      return { status: "loading" } as const;

    if (
      !address ||
      !balanceQuery.data ||
      !tokenIDQuery.data ||
      !positionsQuery.some((p) => !p.data)
    )
      return { status: "error" } as const;
    return {
      status: "success",
      amount: filterUniswapPositions(
        positionsQuery.map((p) => p.data!),
        market,
      ).length,
    } as const;
  }, [
    address,
    market,
    tokenIDQuery.data,
    balanceQuery.data,
    balanceQuery.isLoading,
    tokenIDQuery.isLoading,
    positionsQuery,
  ]);
};

export const useUniswapPositionsValue = (
  address: HookArg<Address>,
  market: Market,
) => {
  const balanceQuery = usePositionManagerBalanceOf(address);
  const tokenIDQuery = useTokenIDsByIndex(
    address,
    balanceQuery.data ?? undefined,
  );

  const priceQuery = useMostLiquidMarket(market);

  const pool = useMemo(() => {
    if (!priceQuery.data?.price) return undefined;
    const [token0] = sortTokens([market.quote, market.base]);

    const closestTick = priceToClosestTick(
      market.quote.equals(token0)
        ? priceQuery.data.price
        : invert(priceQuery.data.price),
    );
    return new Pool(
      market.base,
      market.quote,
      FeeAmount.MEDIUM,
      TickMath.getSqrtRatioAtTick(closestTick),
      scale,
      closestTick,
    );
  }, [priceQuery]);

  const positionsQuery = usePositionsFromTokenIDs(pool, tokenIDQuery.data);

  return useMemo(() => {
    if (balanceQuery.data === 0)
      return {
        status: "success",
        value: CurrencyAmount.fromRawAmount(market.quote, 0),
      };
    if (
      balanceQuery.isLoading ||
      tokenIDQuery.isLoading ||
      positionsQuery.some((p) => p.isLoading)
    )
      return { status: "loading" } as const;
    if (
      !address ||
      !balanceQuery.data ||
      !tokenIDQuery.data ||
      !positionsQuery.some((p) => !p.data)
    )
      return { status: "error" } as const;

    const value = filterUniswapPositions(
      positionsQuery.map((p) => p.data!),
      market,
    ).reduce(
      (acc, cur) => acc.add(positionValue(cur, market)),
      CurrencyAmount.fromRawAmount(market.quote, 0),
    );
    return {
      status: "success",
      value,
    } as const;
  }, [
    address,
    market,
    balanceQuery.isLoading,
    balanceQuery.data,
    tokenIDQuery.data,
    tokenIDQuery.isLoading,
    positionsQuery,
  ]);
};

export const useUniswapPositionsGamma = (
  address: HookArg<Address>,
  market: Market,
) => {
  const balanceQuery = usePositionManagerBalanceOf(address);
  const tokenIDQuery = useTokenIDsByIndex(
    address,
    balanceQuery.data ?? undefined,
  );

  const priceQuery = useMostLiquidMarket(market);

  const pool = useMemo(() => {
    if (!priceQuery.data?.price) return undefined;
    const [token0] = sortTokens([market.quote, market.base]);

    const closestTick = priceToClosestTick(
      market.quote.equals(token0)
        ? priceQuery.data.price
        : invert(priceQuery.data.price),
    );
    return new Pool(
      market.base,
      market.quote,
      FeeAmount.MEDIUM,
      TickMath.getSqrtRatioAtTick(closestTick),
      scale,
      closestTick,
    );
  }, [priceQuery]);
  const positionsQuery = usePositionsFromTokenIDs(pool, tokenIDQuery.data);

  return useMemo(() => {
    if (balanceQuery.data === 0)
      return { status: "success", gamma: new Fraction(0) };
    if (
      balanceQuery.isLoading ||
      tokenIDQuery.isLoading ||
      positionsQuery.some((p) => p.isLoading)
    )
      return { status: "loading" } as const;
    if (
      !address ||
      !balanceQuery.data ||
      !tokenIDQuery.data ||
      !positionsQuery.some((p) => !p.data)
    )
      return { status: "error" } as const;

    const gamma = filterUniswapPositions(
      positionsQuery.map((p) => p.data!),
      market,
    ).reduce(
      (acc, cur) => acc.add(positionGamma(cur, market)),
      new Fraction(0),
    );
    return {
      status: "success",
      gamma,
    } as const;
  }, [
    address,
    market,
    balanceQuery.isLoading,
    balanceQuery.data,
    tokenIDQuery.data,
    tokenIDQuery.isLoading,
    positionsQuery,
  ]);
};

const filterUniswapPositions = (
  positions: NonNullable<
    ReturnType<typeof usePositionsFromTokenIDs>[number]["data"]
  >[],
  market: Market,
) => {
  return positions.filter(
    (p) =>
      (getAddress(market.base.address) === getAddress(p.pool.token0.address) &&
        getAddress(market.quote.address) ===
          getAddress(p.pool.token1.address)) ||
      (getAddress(market.base.address) === getAddress(p.pool.token1.address) &&
        getAddress(market.quote.address) === getAddress(p.pool.token0.address)),
  );
};

const positionValue = (
  position: ReturnType<typeof filterUniswapPositions>[number],
  market: Market,
) => {
  return market.quote.equals(position.pool.token0)
    ? position.amount0.add(position.pool.token1Price.quote(position.amount1))
    : position.amount1.add(position.pool.token0Price.quote(position.amount0));
};

const positionGamma = (
  position: ReturnType<typeof filterUniswapPositions>[number],
  market: Market,
) => {
  const lowerPrice = tickToPrice(market.base, market.quote, position.tickLower);
  const upperPrice = tickToPrice(market.base, market.quote, position.tickUpper);

  const price = position.pool.token0.equals(market.quote)
    ? position.pool.token1Price
    : position.pool.token0Price;

  const priceFraction = priceToFraction(price);

  const g =
    price.greaterThan(upperPrice) || price.lessThan(lowerPrice)
      ? new Fraction(0)
      : sqrt(
          priceFraction.multiply(priceFraction).multiply(priceFraction),
        ).invert();

  // TODO: test to make sure liqudity is 18 decimals
  // liquidity is off by 10^6
  const decimalsAdjust =
    position.pool.token0.decimals - position.pool.token1.decimals;
  return g
    .multiply(position.liquidity)
    .multiply(
      JSBIsqrt(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimalsAdjust))),
    )
    .divide(scale);
};
