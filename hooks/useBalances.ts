import type { HookArg } from "./internal/types";
import { useQueryKey } from "./internal/useQueryKey";
import { userRefectchInterval } from "./internal/utils";
import { balanceOf } from "@/lib/reverseMirage/token";
import { useQuery } from "@tanstack/react-query";
import type { Token } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";
import { Address, usePublicClient } from "wagmi";

export const useBalances = <T extends Token>(
  tokens: HookArg<readonly T[]>,
  address: HookArg<Address>,
) => {
  const publicClient = usePublicClient();

  const queryKey = useQueryKey(
    tokens && address
      ? tokens.map((t) => {
          return {
            get: balanceOf,
            args: {
              token: t,
              address,
            },
          };
        })
      : undefined,
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      invariant(tokens && address);
      return Promise.all(
        tokens.map((t) => balanceOf(publicClient, { token: t, address })),
      );
    },
    staleTime: Infinity,
    enabled: !!tokens && !!address,
    refetchInterval: userRefectchInterval,
  });
};
