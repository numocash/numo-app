import { Fraction } from "@uniswap/sdk-core";
import JSBI from "jsbi";

export const ONE_HUNDRED_PERCENT = new Fraction(1);

export const scale = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(18));

export const chainID = {
  mainnet: 1,
  goerli: 5,
  optimism: 10,
  optimismGoerli: 420,
  polygon: 137,
  polygonMumbai: 80_001,
  arbitrum: 42_161,
  arbitrumGoerli: 421_613,
  celo: 42_220,
  celoAlfajores: 44_787,
} as const;
