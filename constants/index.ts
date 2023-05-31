import type { Lendgine } from "../lib/types/lendgine";
import type { Market } from "../lib/types/market";
import type { chains } from "../pages/_app";
import { arbitrumConfig } from "./arbitrum";
import { celoConfig } from "./celo";
import { polygonConfig } from "./polygon";
import { NativeCurrency } from "@/lib/types/currency";
import type { Percent } from "@uniswap/sdk-core";
import type { Address } from "wagmi";

export type SupportedChainIDs = typeof chains[number]["id"];

export type NumoenBaseConfig = {
  factory: Address;
  lendgineRouter: Address;
  liquidityManager: Address;
};

export type Config = typeof config[keyof typeof config];

export type Protocol = keyof Config["procotol"];

type UniswapConfig = {
  subgraph: string;
  factoryAddress: Address;
  pairInitCodeHash: `0x${string}`;
};

type LiquidStakingConfig = {
  return: Percent;
  lendgine: Lendgine;
  color: `#${string}`;
};

export type NumoenInterfaceConfig = {
  uniswapV2: UniswapConfig;
  uniswapV3: UniswapConfig & { positionManagerAddress: Address };
  numoenSubgraph: string;
  native: NativeCurrency;
  liquidStaking?: LiquidStakingConfig;
  specialtyMarkets?: readonly Market[];
  hedgingMarkets?: readonly Market[];
};

export const config: {
  [chain in SupportedChainIDs]: {
    interface: NumoenInterfaceConfig;
    procotol: { pmmp: NumoenBaseConfig; stpmmp?: NumoenBaseConfig };
  };
} = {
  42161: arbitrumConfig,
  42220: celoConfig,
  137: polygonConfig,
};
