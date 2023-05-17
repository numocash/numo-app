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
