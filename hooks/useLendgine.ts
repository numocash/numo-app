import type { Lendgine } from "../lib/types/lendgine";
import type { WrappedTokenInfo } from "../lib/types/wrappedTokenInfo";
import type { HookArg } from "./internal/types";
import { useQueryFactory } from "./internal/useQueryFactory";
import { externalRefetchInterval } from "./internal/utils";
import { useAllLendgines } from "./useAllLendgines";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

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
  const queries = useQueryFactory();

  return useQuery({
    ...queries.reverseMirage.lendgineGetInfo({ lendgine }),
    refetchInterval: externalRefetchInterval,
  });
};
