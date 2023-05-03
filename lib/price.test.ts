import { priceMultiple } from "./price";
import { Lendgine } from "./types/lendgine";
import { WrappedTokenInfo } from "./types/wrappedTokenInfo";
import { Price, Token } from "@uniswap/sdk-core";
import { describe, expect, it } from "vitest";

const token0 = new WrappedTokenInfo({
  chainId: 1,
  address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
  decimals: 18,
  name: "token0",
  symbol: "token0",
});
const token1 = new WrappedTokenInfo({
  chainId: 1,
  address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
  decimals: 18,
  name: "token1",
  symbol: "token1",
});
const lendgineInner: Omit<Lendgine, "bound"> = {
  token0: token0,
  token1: token1,
  address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
  token0Exp: token0.decimals,
  token1Exp: token1.decimals,
  lendgine: new Token(1, "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2", 18),
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
