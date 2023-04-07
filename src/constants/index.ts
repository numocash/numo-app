import type { NativeCurrency, Percent } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

import type { chains } from "@/pages/_app";
import type { Lendgine } from "@/src/lib/types/lendgine";
import type { Market } from "@/src/lib/types/market";
import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { arbitrumConfig } from "./arbitrum";
import { celoConfig } from "./celo";
import { polygonConfig } from "./polygon";

export type SupportedChainIDs = (typeof chains)[number]["id"];

export type NumoenBaseConfig = {
  factory: Address;
  lendgineRouter: Address;
  liquidityManager: Address;
};

type UniswapConfig = {
  subgraph: string;
  factoryAddress: Address;
  pairInitCodeHash: `0x${string}`;
};

type LiquidStakingConfig = {
  base: NumoenBaseConfig;
  return: Percent;
  lendgine: Lendgine;
  color: `#${string}`;
};

// TODO: CELO doesn't need to be used as a native token
export type NumoenInterfaceConfig = {
  uniswapV2: UniswapConfig;
  uniswapV3: UniswapConfig;
  numoenSubgraph: string;
  wrappedNative: WrappedTokenInfo;
  native?: NativeCurrency;
  liquidStaking?: LiquidStakingConfig;
  specialtyMarkets?: readonly Market[];
};

export const config: {
  [chain in SupportedChainIDs]: {
    interface: NumoenInterfaceConfig;
    base: NumoenBaseConfig;
  };
} = {
  42161: arbitrumConfig,
  42220: celoConfig,
  137: polygonConfig,
};
