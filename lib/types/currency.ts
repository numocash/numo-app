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
  [11155111]: new Token(
    11155111,
    "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    18,
    "WSEP",
    "Wrapped Sepolia Ether",
    "/eth.png",
  ),
  [5]: new Token(
    5,
    "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    18,
    "WETH",
    "Wrapped Goerli Ether",
    "/eth.png",
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
