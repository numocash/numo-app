import type { Lendgine } from "../lib/types/lendgine";
import type { HookArg } from "./internal/types";
import { useQueryKey } from "./internal/useQueryKey";
import { externalRefetchInterval } from "./internal/utils";
import { getLendgineInfo } from "@/lib/reverseMirage/lendgine";
import { useQuery } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { usePublicClient } from "wagmi";

export const useLendgines = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>,
) => {
  const publicClient = usePublicClient();

  const queryKey = useQueryKey(
    lendgines
      ? lendgines.map((l) => {
          return {
            get: getLendgineInfo,
            args: {
              lendgine: l,
            },
          };
        })
      : undefined,
  );

  return useQuery({
    queryFn: async () => {
      invariant(lendgines);

      return Promise.all(
        lendgines.map((l) => getLendgineInfo(publicClient, { lendgine: l })),
      );
    },
    queryKey,
    staleTime: Infinity,
    enabled: !!lendgines,
    refetchInterval: externalRefetchInterval,
  });
};
