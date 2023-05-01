import type { WrappedTokenInfo } from "./wrappedTokenInfo";
import type { CurrencyAmount, Price, Token } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

export type Lendgine = {
  token0: WrappedTokenInfo;
  token1: WrappedTokenInfo;

  lendgine: Token;

  bound: Price<WrappedTokenInfo, WrappedTokenInfo>;

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
