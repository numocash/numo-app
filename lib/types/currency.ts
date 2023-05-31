import { SupportedChainIDs } from "@/constants";
import { color } from "@/hooks/useTokens";
import { Token as UniswapToken } from "@uniswap/sdk-core";
import { NativeCurrency as UniswapNativeCurrency } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";

export { CurrencyAmount };

export class Token extends UniswapToken {
  public readonly logoURI?: string;

  public readonly color?: Record<
    | "muted"
    | "vibrant"
    | "lightMuted"
    | "lightVibrant"
    | "darkMuted"
    | "darkVibrant",
    color
  >;

  public constructor(
    chainId: number,
    address: string,
    decimals: number,
    symbol: string,
    name: string,
    logoURI?: string,
    color?: Record<
      | "muted"
      | "vibrant"
      | "lightMuted"
      | "lightVibrant"
      | "darkMuted"
      | "darkVibrant",
      color
    >,
  ) {
    super(chainId, address, decimals, symbol, name);

    this.logoURI = logoURI;
    this.color = color;
  }
}

export const WrappedNative: { [chainId in SupportedChainIDs]: Token } = {
  [42161]: new Token(
    42161,
    "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    18,
    "WETH",
    "Wrapped Ether",
    "/eth.png",
  ),
  [42220]: new Token(
    42220,
    "0x471EcE3750Da237f93B8E339c536989b8978a438",
    18,
    "CELO",
    "Celo Native Asset",
    "https://assets.coingecko.com/coins/images/11090/small/InjXBNx9_400x400.jpg?1674707499",
  ),
  [137]: new Token(
    137,
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    18,
    "WMATIC",
    "Wrapped Matic",
    "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
  ),
};

export class NativeCurrency extends UniswapNativeCurrency {
  public readonly logoURI?: string;

  public constructor(
    chainId: number,
    decimals: number,
    symbol: string,
    name: string,
    logoURI?: string,
  ) {
    super(chainId, decimals, symbol, name);

    this.logoURI = logoURI;
  }

  public get wrapped(): Token {
    const weth9 = WrappedNative[this.chainId as SupportedChainIDs];
    invariant(!!weth9, "WRAPPED");
    return weth9;
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }
}

export type Currency = Token | NativeCurrency;
