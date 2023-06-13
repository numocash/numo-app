import { PricePoint } from "./uniswapV2";
import {
  PriceHistoryDayV3Query,
  PriceHistoryHourV3Query,
} from "@/gql/uniswapV3/graphql";
import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

export const feeTiers = {
  100: "100",
  500: "500",
  3000: "3000",
  10000: "10000",
} as const;

export type UniswapV3Pool = {
  version: "V3";
  feeTier: typeof feeTiers[keyof typeof feeTiers];
};

export const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
export const Q192 = JSBI.exponentiate(Q96, JSBI.BigInt(2));

// returns null if the id used to query was not valid
export const parsePriceHistoryHourV3 = (
  priceHistoryHourV3Query: PriceHistoryHourV3Query,
): readonly PricePoint[] | null =>
  priceHistoryHourV3Query.pool
    ? priceHistoryHourV3Query.pool.poolHourData.map((d) => ({
        timestamp: d.periodStartUnix,
        price: new Fraction(
          Math.floor(parseFloat(d.token0Price) * 10 ** 9),
          10 ** 9,
        ),
      }))
    : null;

// returns null if the id used to query was not valid
export const parsePriceHistoryDayV3 = (
  priceHistoryDayV3Query: PriceHistoryDayV3Query,
): readonly PricePoint[] | null =>
  priceHistoryDayV3Query.pool
    ? priceHistoryDayV3Query.pool.poolDayData.map((d) => ({
        timestamp: d.date,
        price: new Fraction(
          Math.floor(parseFloat(d.token0Price) * 10 ** 9),
          10 ** 9,
        ),
      }))
    : null;
