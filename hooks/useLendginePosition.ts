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

export const useLendginePosition = <L extends Lendgine>(
  lendgine: HookArg<L>,
  address: HookArg<Address>,
  protocol: Protocol,
) => {
  const publicClient = usePublicClient();
  const environment = useEnvironment();

  const protocolConfig = environment.procotol[protocol]!;

  const queryKey = useQueryKey(
    lendgine && address
      ? [
          {
            get: position,
            args: {
              lendgine,
              address,
              liquidityManagerAddress: protocolConfig.liquidityManager,
            },
          },
        ]
      : undefined,
  );

  return useQuery({
    queryKey,
    queryFn: async () => {
      invariant(lendgine && address);
      return position(publicClient, {
        lendgine,
        address,
        liquidityManagerAddress: protocolConfig.liquidityManager,
      });
    },
    staleTime: Infinity,
    enabled: !!lendgine && !!address,
    refetchInterval: userRefectchInterval,
  });
};
