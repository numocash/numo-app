import { Token } from "./currency";
import type { CurrencyAmount, Price } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

export type Lendgine = {
  token0: Token;
  token1: Token;

  lendgine: Token;

  bound: Price<Token, Token>;

  token0Exp: number;
  token1Exp: number;

  address: Address;
};

export type LendginePosition<L extends Lendgine> = {
  size: CurrencyAmount<L["lendgine"]>;
  rewardPerPositionPaid: Price<L["lendgine"], L["token1"]>;
  tokensOwed: CurrencyAmount<L["token1"]>;
};

export type LendgineInfo<L extends Lendgine> = {
  totalPositionSize: CurrencyAmount<L["lendgine"]>;
  totalLiquidityBorrowed: CurrencyAmount<L["lendgine"]>;
  rewardPerPositionStored: Price<L["lendgine"], L["token1"]>;
  lastUpdate: number;

  totalSupply: CurrencyAmount<L["lendgine"]>;

  reserve0: CurrencyAmount<L["token0"]>;
  reserve1: CurrencyAmount<L["token1"]>;
  totalLiquidity: CurrencyAmount<L["lendgine"]>;
};
