import { utils } from "ethers";

import { chainID } from "../lib/constants";
import { WrappedTokenInfo } from "../lib/types/wrappedTokenInfo";

export const Stable = {
  1: new WrappedTokenInfo({
    chainId: 1,
    address: utils.getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    decimals: 6,
    symbol: "USDC",
    name: "USD Coin",
  }),
  [chainID.arbitrum]: new WrappedTokenInfo({
    chainId: chainID.arbitrum,
    address: utils.getAddress("0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"),
    decimals: 6,
    name: "USD Coin",
    symbol: "USDC",
  }),
  [chainID.celo]: new WrappedTokenInfo({
    chainId: chainID.celo,
    address: utils.getAddress("0x765DE816845861e75A25fCA122bb6898B8B1282a"),
    decimals: 18,
    name: "Celo Dollar",
    symbol: "cUSD",
  }),
} as const;

export const WrappedNative = {
  1: new WrappedTokenInfo({
    chainId: 1,
    address: utils.getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    decimals: 18,
    symbol: "ETH",
    name: "Ether",
  }),
  [chainID.polygon]: new WrappedTokenInfo({
    chainId: chainID.polygon,
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    decimals: 18,
    symbol: "MATIC",
    name: "Matic",
    logoURI:
      "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
  }),
  [chainID.arbitrum]: new WrappedTokenInfo({
    chainId: chainID.arbitrum,
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    decimals: 18,
    symbol: "ETH",
    name: "Ether",
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  }),
  [chainID.celo]: new WrappedTokenInfo({
    chainId: chainID.celo,
    address: utils.getAddress("0x471EcE3750Da237f93B8E339c536989b8978a438"),
    decimals: 18,
    name: "Celo native asset",
    symbol: "CELO",
  }),
} as const;
