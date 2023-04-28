import { Fraction } from "@uniswap/sdk-core";

import type {
  PriceHistoryDayV2Query,
  PriceHistoryHourV2Query,
} from "../gql/uniswapV2/graphql";

export type UniswapV2Pool = {
  version: "V2";
};

export type PricePoint = { timestamp: number; price: Fraction };

export const parsePriceHelper = (price: number) =>
  new Fraction(Math.floor(price * 10 ** 9), 10 ** 9);

// returns null if the id used to query was not valid
export const parsePriceHistoryHourV2 = (
  priceHistoryHourV2Query: PriceHistoryHourV2Query
): readonly PricePoint[] | null =>
  priceHistoryHourV2Query.pair
    ? priceHistoryHourV2Query.pair.hourData.map((d) => ({
        timestamp: d.date,
        price: new Fraction(
          Math.floor(parseFloat(d.reserve0) * 10 ** 9),
          Math.floor(parseFloat(d.reserve1) * 10 ** 9)
        ),
      }))
    : null;

export const parsePriceHistoryDayV2 = (
  priceHistoryDayV2Query: PriceHistoryDayV2Query
): readonly PricePoint[] | null =>
  priceHistoryDayV2Query.pair
    ? priceHistoryDayV2Query.pair.dayData.map((d) => ({
        timestamp: d.date,
        price: new Fraction(
          Math.floor(parseFloat(d.reserve0) * 10 ** 9),
          Math.floor(parseFloat(d.reserve1) * 10 ** 9)
        ),
      }))
    : null;
