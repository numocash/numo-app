import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/environment";
import type { Lendgine } from "../lib/types/lendgine";
import type { HookArg } from "./internal/types";
import { useQueryKey } from "./internal/useQueryKey";
import { userRefectchInterval } from "./internal/utils";
import { position } from "@/lib/reverseMirage/liquidityManager";
import { useQuery } from "@tanstack/react-query";
import invariant from "tiny-invariant";
import { Address, usePublicClient } from "wagmi";

export const useLendginesPositions = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>,
  address: HookArg<Address>,
  protocol: Protocol,
) => {
  const publicClient = usePublicClient();
  const environment = useEnvironment();

  const protocolConfig = environment.procotol[protocol]!;

  const queryKey = useQueryKey(
    address && lendgines
      ? lendgines.map((l) => {
          return {
            get: position,
            args: {
              lendgine: l,
              address,
              liquidityManagerAddress: protocolConfig.liquidityManager,
            },
          };
        })
      : [],
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      invariant(lendgines && address);

      return Promise.all(
        lendgines.map((l) =>
          position(publicClient, {
            lendgine: l,
            address,
            liquidityManagerAddress: protocolConfig.liquidityManager,
          }),
        ),
      );
    },
    staleTime: Infinity,
    enabled: !!lendgines && !!address,
    refetchInterval: userRefectchInterval,
  });
};
