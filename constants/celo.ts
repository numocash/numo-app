import type { Config } from ".";
import { allTokens } from "@/hooks/useTokens";
import { chainID } from "@/lib/constants";
import { NativeCurrency } from "@/lib/types/currency";
import { getAddress } from "viem";

export const celoConfig = {
  interface: {
    uniswapV2: {
      subgraph: "https://api.thegraph.com/subgraphs/name/ubeswap/ubeswap",
      factoryAddress: "0x62d5b84bE28a183aBB507E125B384122D2C25fAE",
      pairInitCodeHash:
        "0xb3b8ff62960acea3a88039ebcf80699f15786f1b17cebd82802f7375827a339c",
    },
    uniswapV3: {
      subgraph:
        "https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo",
      factoryAddress: "0xAfE208a311B21f13EF87E33A90049fC17A7acDEc",
      pairInitCodeHash:
        "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54",
      positionManagerAddress: "0x3d79EdAaBC0EaB6F08ED885C05Fc0B014290D95A",
    },
    numoenSubgraph:
      "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-celo",
    native: new NativeCurrency(
      chainID.celo,
      18,
      "CELO",
      "Celo Native Asset",
      "https://assets.coingecko.com/coins/images/11090/small/InjXBNx9_400x400.jpg?1674707499",
    ),

    specialtyMarkets: [
      {
        base: allTokens[chainID.celo]!["CELO"]!,
        quote: allTokens[chainID.celo]!["cUSD"]!,
      },
    ],
  },
  procotol: {
    pmmp: {
      factory: getAddress("0x8396a792510a402681812ece6ad3ff19261928ba"),
      lendgineRouter: getAddress("0x6a931466f6C79724CB5E78EaB6E493b6AF189FF0"),
      liquidityManager: getAddress(
        "0x6b0c66824c39766f554F07481B66ca24A54A90E0",
      ),
    },
  },
} as const satisfies Config;
