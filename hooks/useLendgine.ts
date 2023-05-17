import type { Lendgine } from "../lib/types/lendgine";
import type { WrappedTokenInfo } from "../lib/types/wrappedTokenInfo";
import type { HookArg } from "./internal/types";
import { useQueryKey } from "./internal/useQueryKey";
import { externalRefetchInterval } from "./internal/utils";
import { useAllLendgines } from "./useAllLendgines";
import { getLendgineInfo } from "@/lib/reverseMirage/lendgine";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import invariant from "tiny-invariant";
import { usePublicClient } from "wagmi";

export const useLendginesForTokens = (
  tokens: HookArg<readonly [WrappedTokenInfo, WrappedTokenInfo]>,
) => {
  const lendginesQuery = useAllLendgines();

  return useMemo(() => {
    if (!tokens || lendginesQuery.status !== "success") return null;
    return lendginesQuery.lendgines.filter(
      (l) =>
        (l.token0.equals(tokens[0]) && l.token1.equals(tokens[1])) ||
        (l.token0.equals(tokens[1]) && l.token1.equals(tokens[0])),
    );
  }, [lendginesQuery.lendgines, lendginesQuery.status, tokens]);
};

export const useLendgine = <L extends Lendgine>(lendgine: HookArg<L>) => {
  const publicClient = usePublicClient();

  const queryKey = useQueryKey(
    lendgine
      ? [
          {
            get: getLendgineInfo,
            args: { lendgine },
          },
        ]
      : undefined,
  );

  return useQuery({
    queryFn: async () => {
      invariant(lendgine);
      return getLendgineInfo(publicClient, { lendgine });
    },
    queryKey,
    staleTime: Infinity,
    enabled: !!lendgine,
    refetchInterval: externalRefetchInterval,
  });
};
