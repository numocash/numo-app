import type { Fraction, Percent, Price, Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";

import { priceToFraction } from "../lib/price";

export const ZERO = JSBI.BigInt(0);

export const FORMAT_PERCENT: Intl.NumberFormatOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  style: "percent",
};

export const FORMAT_PRICE: Intl.NumberFormatOptions = {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
};

export const fractionToFloat = (frac: Fraction): number => {
  if (JSBI.equal(frac.denominator, ZERO)) {
    return JSBI.greaterThan(frac.numerator, ZERO)
      ? Number.POSITIVE_INFINITY
      : JSBI.lessThan(frac.numerator, ZERO)
      ? Number.NEGATIVE_INFINITY
      : Number.NaN;
  }
  return parseFloat(frac.toFixed(10));
};

export const formatPercent = (percent: Percent): string => {
  return fractionToFloat(percent.asFraction).toLocaleString(
    undefined,
    FORMAT_PERCENT
  );
};

export const formatPrice = <TBase extends Token, TQuote extends Token>(
  price: Price<TBase, TQuote>
) => {
  return formatDisplayWithSoftLimit(
    fractionToFloat(priceToFraction(price)),
    4,
    6,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }
  );
};

export const formatPrecise = (percent: Percent): string => {
  return (fractionToFloat(percent.asFraction) * 100).toLocaleString(undefined, {
    maximumFractionDigits: 10,
  });
};

/**
 * @warning For end-user display purposes only. It loses precision and does rounding
 *
 * There is padding
 *
 * If (Whole number digits > softMaximumSignificantDigits)
 *   Rounds to whole number towards 0
 * Otherwise
 *   Defaults to token.decimals, but respects numberFormatOptions as an override
 *
 * Example for softMaximumSignificantDigits = 7 and token with 6 maxDigits
 *
 * 1234.87654321 => 1234.876 (7 significant figures)
 * 1234567.87654321 => 1234567 (rounded down)
 * 123456789.321 => 123456789
 * 1.87654321 => 1.876543
 */
export const formatDisplayWithSoftLimit = (
  float: number,
  maxDecimals: number,
  softMaximumSignificantDigits = 7,
  numberFormatOptions?: Intl.NumberFormatOptions,
  locale?: string
): string => {
  if (
    Number.isNaN(softMaximumSignificantDigits) ||
    softMaximumSignificantDigits <= 0
  ) {
    throw new Error("softMaximumSignificantDigits must be greater than 0");
  }

  // Round to integer if there are enough whole digits
  const dropDecimalsAfter = Math.pow(10, softMaximumSignificantDigits - 1);

  if (float >= dropDecimalsAfter) {
    // Round down to display integer amount
    const wholeNumberFormatOptions: Intl.NumberFormatOptions = Object.assign(
      {},
      numberFormatOptions,
      {
        maximumFractionDigits: 0,
      }
    );
    return Math.floor(float).toLocaleString(locale, wholeNumberFormatOptions);
  }

  // Round to maxDecimals if too small
  const sigDerivedDigitsOnRight =
    softMaximumSignificantDigits - Math.floor(Math.log10(float)) - 1;

  const digitsOnRight = Math.min(maxDecimals, sigDerivedDigitsOnRight);
  const flooredToPrecision =
    Math.floor(float * 10 ** digitsOnRight) / 10 ** digitsOnRight;

  const maxFormatOptions: Intl.NumberFormatOptions = Object.assign(
    {
      minimumFractionDigits: digitsOnRight,
      maximumFractionDigits: digitsOnRight,
    },
    numberFormatOptions
  );
  return flooredToPrecision.toLocaleString(locale, maxFormatOptions);
};
