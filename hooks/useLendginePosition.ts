import type { Protocol } from "../constants";
import { useEnvironment } from "../contexts/environment";
import type { Lendgine } from "../lib/types/lendgine";
import type { HookArg } from "./internal/types";
import { useQueryFactory } from "./internal/useQueryFactory";
import { userRefectchInterval } from "./internal/utils";
import { useQuery } from "@tanstack/react-query";
import { Address } from "wagmi";

export const useLendginePosition = <L extends Lendgine>(
  lendgine: HookArg<L>,
  address: HookArg<Address>,
  protocol: Protocol,
) => {
  const queries = useQueryFactory();

  const environment = useEnvironment();
  const protocolConfig = environment.procotol[protocol]!;

  return useQuery({
    ...queries.reverseMirage.liquidityManagerPosition({
      lendgine,
      address,
      liquidityManagerAddress: protocolConfig.liquidityManager,
    }),
    refetchInterval: userRefectchInterval,
  });
};
