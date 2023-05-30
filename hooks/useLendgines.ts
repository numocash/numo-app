import type { Lendgine } from "../lib/types/lendgine";
import type { HookArg } from "./internal/types";
import { useQueryGenerator } from "./internal/useQueryGenerator";
import { externalRefetchInterval } from "./internal/utils";
import { lendgineGetInfo } from "@/lib/reverseMirage/lendgine";
import { useQueries } from "@tanstack/react-query";

export const useLendgines = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>,
) => {
  const lendgineQuery = useQueryGenerator(lendgineGetInfo);

  return useQueries({
    queries: lendgines
      ? lendgines.map((l) => ({
          ...lendgineQuery({ lendgine: l }),
          refetchInterval: externalRefetchInterval,
        }))
      : [],
  });
};
