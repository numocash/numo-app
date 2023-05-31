import { priceMultiple } from "./price";
import { Token } from "./types/currency";
import { Lendgine } from "./types/lendgine";
import { Price } from "@uniswap/sdk-core";
import { describe, expect, it } from "vitest";

const token0 = new Token(
  1,
  "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
  18,
  "token0",
  "token0",
);
const token1 = new Token(
  1,
  "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
  18,
  "token1",
  "token1",
);
const lendgineInner: Omit<Lendgine, "bound"> = {
  token0: token0,
  token1: token1,
  address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
  token0Exp: token0.decimals,
  token1Exp: token1.decimals,
  lendgine: new Token(
    1,
    "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
    18,
    "NRD",
    "Numoen replicating dertivative",
  ),
};

describe("priceMultiple", () => {
  it("multiple is 2", () => {
    const lendgine: Lendgine = {
      ...lendgineInner,
      bound: new Price(token1, token0, 1, 2),
    };

    expect(priceMultiple(lendgine, new Price(token1, token0, 1, 1))).toEqual(2);
  });

  it("multiple is 1.75", () => {
    const lendgine: Lendgine = {
      ...lendgineInner,
      bound: new Price(token1, token0, 1, 2),
    };

    expect(priceMultiple(lendgine, new Price(token1, token0, 7, 8))).toEqual(2);
  });

  it("multiple is 1.25", () => {
    const lendgine: Lendgine = {
      ...lendgineInner,
      bound: new Price(token1, token0, 1, 2),
    };

    expect(priceMultiple(lendgine, new Price(token1, token0, 5, 8))).toEqual(1);
  });
});
