import { useEnvironment } from "../contexts/environment";
import { dedupe } from "../utils/dedupe";
import type { HookArg } from "./internal/types";
import { useChain } from "./useChain";
import { Token } from "@/lib/types/currency";
import NumoenTokens from "@numoen/default-token-list";
import type { TokenInfo as UniswapTokenInfo } from "@uniswap/token-lists";
import { useCallback } from "react";
import { getAddress } from "viem";

export type color = `#${string}` | undefined;

export type TokenInfo = UniswapTokenInfo & {
  color?: Record<
    | "muted"
    | "vibrant"
    | "lightMuted"
    | "lightVibrant"
    | "darkMuted"
    | "darkVibrant",
    color
  >;
};

export const allTokens = NumoenTokens.tokens.reduce(
  (
    acc: Record<TokenInfo["chainId"], Record<TokenInfo["symbol"], Token>>,
    cur,
  ) => ({
    ...acc,
    [cur.chainId]: {
      ...acc[cur.chainId],
      [cur.symbol]: new Token(
        cur.chainId,
        cur.address,
        cur.decimals,
        cur.symbol,
        cur.name,
        cur.logoURI,
        cur.color as TokenInfo["color"],
      ),
    },
  }),
  {},
);

export const useTokens = () => {
  const chain = useChain();
  const environment = useEnvironment();

  const chainTokens = Object.values(allTokens[chain]!);

  return dedupe(
    chainTokens.filter((t) => t.chainId === chain),
    (t) => `${t.address}_${t.chainId}`,
  ).map((t) => {
    if (environment.interface.native.wrapped.equals(t)) {
      return new Token(
        t.chainId,
        t.address,
        t.decimals,
        environment.interface.native.symbol!,
        environment.interface.native.name!,
        t.logoURI,
        t.color,
      );
    }
    return t;
  });
};

export const useAddressToToken = (address: HookArg<string>) => {
  return useGetAddressToToken()(address);
};

export const useGetAddressToToken = () => {
  const tokens = useTokens();

  return useCallback(
    (address: HookArg<string>) => {
      if (!address) return null;
      return (
        tokens.find((t) => getAddress(t.address) === getAddress(address)) ??
        null
      );
    },
    [tokens],
  );
};

export const useIsWrappedNative = (token: HookArg<Token>) => {
  const environment = useEnvironment();

  if (!token) return undefined;

  return environment.interface.native.wrapped.equals(token);
};
