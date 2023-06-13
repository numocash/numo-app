import { priceToFraction } from "./price";
import type { Lendgine } from "./types/lendgine";
import type { Market } from "./types/market";
import type { WrappedTokenInfo } from "./types/wrappedTokenInfo";
import type { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

export const lendgineToMarket = (
  lendgine: Lendgine,
  wrappedNative: WrappedTokenInfo,
  specialtyMarkets?: readonly Market[],
): Market => {
  const specialtyMatches = specialtyMarkets?.find((m) =>
    isEqualToMarket(lendgine.token0, lendgine.token1, m),
  );

  if (specialtyMatches)
    return lendgine.token0.equals(specialtyMatches.base)
      ? { base: lendgine.token0, quote: lendgine.token1 }
      : { base: lendgine.token1, quote: lendgine.token0 };

  // wrapped native is the preferred quote token
  return lendgine.token0.equals(wrappedNative)
    ? { base: lendgine.token1, quote: lendgine.token0 }
    : { base: lendgine.token0, quote: lendgine.token1 };
};

export const marketToLendgines = (
  market: Market,
  allLendgines: readonly Lendgine[],
) => allLendgines.filter((l) => isEqualToMarket(l.token0, l.token1, market));

export const isValidLendgine = (
  lendgine: Lendgine,
  wrappedNative: WrappedTokenInfo,
  specialtyMarkets?: readonly Market[],
) =>
  isValidMarket(
    lendgineToMarket(lendgine, wrappedNative, specialtyMarkets),
    wrappedNative,
    specialtyMarkets,
  ) && isValidBound(priceToFraction(lendgine.bound));

export const isValidMarket = (
  market: Market,
  wrappedNative: WrappedTokenInfo,
  specialtyMarkets?: readonly Market[],
) =>
  !![market.base, market.quote].find((t) => t.equals(wrappedNative)) ||
  !!specialtyMarkets
    ?.map((m) => market.base.equals(m.base) && market.quote.equals(m.quote))
    .includes(true);

export const isValidBound = (bound: Fraction) => {
  const quotient = bound.greaterThan(1)
    ? bound.quotient
    : bound.invert().quotient;
  if (!JSBI.bitwiseAnd(quotient, JSBI.subtract(quotient, JSBI.BigInt(1))))
    return false;

  return true;
};

const isEqualToMarket = (
  token0: WrappedTokenInfo,
  token1: WrappedTokenInfo,
  market: Market,
) =>
  (market.base.equals(token0) && market.quote.equals(token1)) ||
  (market.base.equals(token1) && market.quote.equals(token0));

export const marketEqual = (marketA: Market, marketB: Market) =>
  marketA.quote.equals(marketB.quote) && marketA.base.equals(marketB.base);
