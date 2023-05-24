import type { Lendgine } from "../lib/types/lendgine";
import type { HookArg } from "./internal/types";
import { useQueryFactory } from "./internal/useQueryFactory";
import { externalRefetchInterval } from "./internal/utils";
import { useQueries } from "@tanstack/react-query";

export const useLendgines = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>,
) => {
  const queries = useQueryFactory();

  return useQueries({
    queries: lendgines
      ? lendgines.map((l) => ({
          ...queries.reverseMirage.lendgineGetInfo({ lendgine: l }),
          refetchInterval: externalRefetchInterval,
        }))
      : [],
  });
};
