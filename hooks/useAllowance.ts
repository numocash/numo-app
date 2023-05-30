import type { HookArg } from "./internal/types";
import { useQueryGenerator } from "./internal/useQueryGenerator";
import { userRefectchInterval } from "./internal/utils";
import { Token } from "@/lib/types/currency";

import { erc20Allowance } from "@/lib/reverseMirage/token";
import { useQuery } from "@tanstack/react-query";
import { Address } from "wagmi";

export const useAllowance = (
  token: HookArg<Token>,
  address: HookArg<Address>,
  spender: HookArg<Address>,
) => {
  const allowanceQuery = useQueryGenerator(erc20Allowance);

  return useQuery({
    ...allowanceQuery({ token, address, spender }),
    refetchInterval: userRefectchInterval,
  });
};
