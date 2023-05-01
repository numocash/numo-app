import { priceToFraction } from "./price";
import type { Lendgine } from "./types/lendgine";
import type { WrappedTokenInfo } from "./types/wrappedTokenInfo";
import type { Price } from "@uniswap/sdk-core";
import { Fraction } from "@uniswap/sdk-core";

export const lvrCoef = (
  price: Price<WrappedTokenInfo, WrappedTokenInfo>,
  lendgine: Lendgine,
) => {
  if (price.greaterThan(lendgine.bound)) return new Fraction(0);
  const numerator = priceToFraction(price).multiply(priceToFraction(price));
  const denominator = priceToFraction(price)
    .multiply(priceToFraction(lendgine.bound))
    .multiply(2)
    .subtract(numerator);
  return numerator.divide(denominator);
};
