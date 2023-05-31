import type { Config } from ".";
import { chainID } from "../lib/constants";
import { allTokens } from "@/hooks/useTokens";
import { NativeCurrency, Token } from "@/lib/types/currency";
import { Percent, Price } from "@uniswap/sdk-core";
import { getAddress } from "viem";

const stMATIC = new Token(
  chainID.polygon,
  "0x3A58a54C066FdC0f2D55FC9C89F0415C92eBf3C4",
  18,
  "stMATIC",
  "Staked Matic",
  "https://assets.coingecko.com/coins/images/24185/small/stMATIC.png?1646789287",
);

export const Matic = new NativeCurrency(
  137,
  18,
  "MATIC",
  "Matic",
  "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
);

const WMATIC = allTokens[chainID.polygon]!["WMATIC"]!;
const WETH = allTokens[chainID.polygon]!["WETH"]!;
const USDC = allTokens[chainID.polygon]!["USDC"]!;

export const polygonConfig = {
  interface: {
    uniswapV2: {
      subgraph: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06",
      factoryAddress: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
      pairInitCodeHash:
        "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
    },
    uniswapV3: {
      subgraph:
        "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
      factoryAddress: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      pairInitCodeHash:
        "0xe34f199b19b2b4f47f68442619d555527d244f78a3297ea89325f843f87b8b54",
      positionManagerAddress: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    },
    liquidStaking: {
      return: new Percent(42, 1000),
      lendgine: {
        token0: WMATIC,
        token0Exp: WMATIC.decimals,
        token1: stMATIC,
        token1Exp: stMATIC.decimals,
        bound: new Price(stMATIC, WMATIC, 10, 16),
        address: "0x0A435BC2488c85A7C87fA3dac0CD4fA538DDe4Ce",
        lendgine: new Token(
          137,
          "0x0A435BC2488c85A7C87fA3dac0CD4fA538DDe4Ce",
          18,
          "NRD",
          "Numoen Replicating Derivative",
        ),
      },
      color: "#a457ff",
    },
    numoenSubgraph:
      "https://api.thegraph.com/subgraphs/name/kyscott18/numoen-polygon",
    native: Matic,
    specialtyMarkets: [
      {
        base: WMATIC,
        quote: WETH,
      },
      { base: USDC, quote: allTokens[chainID.polygon]!["USDT"]! },
      { base: WETH, quote: USDC },
      { base: allTokens[chainID.polygon]!["WBTC"]!, quote: USDC },
      { base: allTokens[chainID.polygon]!["BOB"]!, quote: USDC },
      { base: allTokens[chainID.polygon]!["GHST"]!, quote: USDC },
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
    stpmmp: {
      factory: "0x58db4e36755699188ff21E68A11308fDEb8792b5",
      liquidityManager: "0xe964F66B143E2C4752F3F4d37bfc9e74dE4e6eEB",
      lendgineRouter: "0xC63292042D983C2196ab52F4101043F128EcEF67",
    },
  },
} as const satisfies Config;
