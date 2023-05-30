import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/environment";
import type { Lendgine } from "../lib/types/lendgine";
import type { HookArg } from "./internal/types";
import { useQueryGenerator } from "./internal/useQueryGenerator";
import { userRefectchInterval } from "./internal/utils";
import { liquidityManagerPosition } from "@/lib/reverseMirage/liquidityManager";
import { useQuery } from "@tanstack/react-query";
import { Address } from "wagmi";

export const useLendginePosition = <L extends Lendgine>(
  lendgine: HookArg<L>,
  address: HookArg<Address>,
  protocol: Protocol,
) => {
  const lendginePositionQuery = useQueryGenerator(liquidityManagerPosition);

  const environment = useEnvironment();
  const protocolConfig = environment.procotol[protocol]!;

  return useQuery({
    ...lendginePositionQuery({
      lendgine,
      address,
      liquidityManagerAddress: protocolConfig.liquidityManager,
    }),
    refetchInterval: userRefectchInterval,
  });
};
