import type { HookArg } from "./internal/types";
import { useQueryKey } from "./internal/useQueryKey";
import { userRefectchInterval } from "./internal/utils";
import { useMostLiquidMarket } from "./useExternalExchange";
import { useEnvironment } from "@/contexts/environment";
import { feeTiers } from "@/graphql/uniswapV3";
import { scale } from "@/lib/constants";
import { invert, priceToFraction, sqrt } from "@/lib/price";
import {
  balanceOf,
  position,
  tokenOfOwnerByIndex,
} from "@/lib/reverseMirage/uniswapV3";
import { Market } from "@/lib/types/market";
import { useQuery } from "@tanstack/react-query";
import { sqrt as JSBIsqrt } from "@uniswap/sdk-core";
import { CurrencyAmount, Fraction, Price } from "@uniswap/sdk-core";
import {
  FeeAmount,
  Pool,
  Position,
  TickMath,
  priceToClosestTick,
  tickToPrice,
} from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { Address, usePublicClient } from "wagmi";

export const usePositionManagerBalanceOf = (address: HookArg<Address>) => {
  const publicClient = usePublicClient();
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();

  const queryKey = useQueryKey(
    address
      ? [
          {
            get: balanceOf,
            args: { address, positionManagerAddress },
          },
        ]
      : undefined,
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      invariant(address);

      return balanceOf(publicClient, { address, positionManagerAddress });
    },
    staleTime: Infinity,
    enabled: !!address,
    refetchInterval: userRefectchInterval,
  });
};

export const useTokenIDsByIndex = (
  address: HookArg<Address>,
  balance: HookArg<number>,
) => {
  const publicClient = usePublicClient();
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();

  const queryKey = useQueryKey(
    address && balance
      ? [
          {
            get: tokenOfOwnerByIndex,
            args: { address, positionManagerAddress, balance },
          },
        ]
      : undefined,
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      invariant(address && balance);

      return tokenOfOwnerByIndex(publicClient, {
        address,
        positionManagerAddress,
        balance,
      });
    },
    staleTime: Infinity,
    enabled: !!address && !!balance,
    refetchInterval: userRefectchInterval,
  });
};

export const usePositionsFromTokenIDs = (
  pool: HookArg<Pool>,
  tokenIDs: HookArg<number[]>,
) => {
  const publicClient = usePublicClient();
  const {
    interface: { uniswapV3: { positionManagerAddress } },
  } = useEnvironment();

  const queryKey = useQueryKey(
    tokenIDs && pool
      ? tokenIDs.map((t) => ({
          get: position,
          args: { tokenID: t, positionManagerAddress, pool },
        }))
      : undefined,
  );

  return useQuery({
    queryKey,
    queryFn: () => {
      invariant(tokenIDs && pool);

      return Promise.all(
        tokenIDs.map((t) =>
          position(publicClient, { tokenID: t, positionManagerAddress, pool }),
        ),
      );
    },
    staleTime: Infinity,
    enabled: !!tokenIDs && !!pool,
    refetchInterval: userRefectchInterval,
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
  const positionsQuery = usePositionsFromTokenIDs(tokenIDQuery.data);

  return useMemo(() => {
    if (balanceQuery.data === 0)
      return { status: "success", amount: 0 } as const;
    if (
      balanceQuery.isLoading ||
      tokenIDQuery.isLoading ||
      positionsQuery.isLoading
    )
      return { status: "loading" } as const;

    if (
      !address ||
      !balanceQuery.data ||
      !tokenIDQuery.data ||
      !positionsQuery.data
    )
      return { status: "error" } as const;
    return {
      status: "success",
      amount: filterUniswapPositions(positionsQuery.data, market).length,
    } as const;
  }, [
    address,
    market,
    tokenIDQuery.data,
    balanceQuery.data,
    balanceQuery.isLoading,
    tokenIDQuery.isLoading,
    positionsQuery.isLoading,
    positionsQuery.data,
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
  const positionsQuery = usePositionsFromTokenIDs(tokenIDQuery.data);
  const priceQuery = useMostLiquidMarket(market);

  return useMemo(() => {
    if (balanceQuery.data === 0)
      return {
        status: "success",
        value: CurrencyAmount.fromRawAmount(market.quote, 0),
      };
    if (
      balanceQuery.isLoading ||
      tokenIDQuery.isLoading ||
      positionsQuery.isLoading ||
      priceQuery.status === "loading"
    )
      return { status: "loading" } as const;
    if (
      !address ||
      !balanceQuery.data ||
      !tokenIDQuery.data ||
      !positionsQuery.data ||
      priceQuery.status === "error"
    )
      return { status: "error" } as const;

    const value = filterUniswapPositions(positionsQuery.data, market).reduce(
      (acc, cur) => acc.add(positionValue(cur, market, priceQuery.data.price)),
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
    positionsQuery.isLoading,
    positionsQuery.data,
    priceQuery.status,
    priceQuery.data,
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
  const positionsQuery = usePositionsFromTokenIDs(tokenIDQuery.data);
  const priceQuery = useMostLiquidMarket(market);

  return useMemo(() => {
    if (balanceQuery.data === 0)
      return { status: "success", gamma: new Fraction(0) };
    if (
      balanceQuery.isLoading ||
      tokenIDQuery.isLoading ||
      positionsQuery.isLoading ||
      priceQuery.status === "loading"
    )
      return { status: "loading" } as const;
    if (
      !address ||
      !balanceQuery.data ||
      !tokenIDQuery.data ||
      !positionsQuery.data ||
      priceQuery.status === "error"
    )
      return { status: "error" } as const;

    const gamma = filterUniswapPositions(positionsQuery.data, market).reduce(
      (acc, cur) => acc.add(positionGamma(cur, market, priceQuery.data.price)),
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
    positionsQuery.isLoading,
    positionsQuery.data,
    priceQuery.status,
    priceQuery.data,
  ]);
};

const filterUniswapPositions = (
  positions: NonNullable<ReturnType<typeof usePositionsFromTokenIDs>["data"]>,
  market: Market,
) => {
  return positions
    .filter(
      (p) =>
        (utils.getAddress(market.base.address) === utils.getAddress(p.token0) &&
          utils.getAddress(market.quote.address) ===
            utils.getAddress(p.token1)) ||
        (utils.getAddress(market.base.address) === utils.getAddress(p.token1) &&
          utils.getAddress(market.quote.address) ===
            utils.getAddress(p.token0)),
    )
    .map((p) => ({
      feeTier: p.fee.toString() as typeof feeTiers[keyof typeof feeTiers],
      token0:
        utils.getAddress(market.base.address) === utils.getAddress(p.token0)
          ? market.base
          : market.quote,
      token1:
        utils.getAddress(market.base.address) === utils.getAddress(p.token0)
          ? market.quote
          : market.base,
      tickLower: p.tickLower,
      tickUpper: p.tickUpper,
      liquidity: JSBI.BigInt(p.liquidity.toString()),
    }));
};

const positionValue = (
  position: ReturnType<typeof filterUniswapPositions>[number],
  market: Market,
  price: Price<Market["quote"], Market["base"]>,
) => {
  // convert price to current tick
  const closestTick = priceToClosestTick(
    market.quote.equals(position.token0) ? price : invert(price),
  );
  const pool = new Pool(
    position.token0,
    position.token1,
    +position.feeTier,
    TickMath.getSqrtRatioAtTick(closestTick),
    position.liquidity,
    closestTick,
  );
  const uniswapPosition = new Position({
    pool,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
  });

  const amount0 = CurrencyAmount.fromRawAmount(
    position.token0,
    uniswapPosition.amount0.quotient,
  );
  const amount1 = CurrencyAmount.fromRawAmount(
    position.token1,
    uniswapPosition.amount1.quotient,
  );

  return market.quote.equals(position.token0)
    ? amount0.add(price.quote(amount1))
    : amount1.add(price.quote(amount0));
};

const positionGamma = (
  position: ReturnType<typeof filterUniswapPositions>[number],
  market: Market,
  price: Price<Market["quote"], Market["base"]>,
) => {
  const lowerPrice = tickToPrice(market.base, market.quote, position.tickLower);
  const upperPrice = tickToPrice(market.base, market.quote, position.tickUpper);

  const priceFraction = priceToFraction(price);

  const g =
    price.greaterThan(upperPrice) || price.lessThan(lowerPrice)
      ? new Fraction(0)
      : sqrt(
          priceFraction.multiply(priceFraction).multiply(priceFraction),
        ).invert();

  // TODO: test to make sure liqudity is 18 decimals
  // liquidity is off by 10^6
  const decimalsAdjust = position.token0.decimals - position.token1.decimals;
  return g
    .multiply(position.liquidity)
    .multiply(
      JSBIsqrt(JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimalsAdjust))),
    )
    .divide(scale);
};
