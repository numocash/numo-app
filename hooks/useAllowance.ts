import type { HookArg } from "./internal/types";
import { useQueryFactory } from "./internal/useQueryFactory";
import { userRefectchInterval } from "./internal/utils";
import { useQuery } from "@tanstack/react-query";
import type { Token } from "@uniswap/sdk-core";
import { Address } from "wagmi";

export const useAllowance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>,
  spender: HookArg<Address>,
) => {
  const queries = useQueryFactory();

  return useQuery({
    ...queries.reverseMirage.erc20Allowance({ token, address, spender }),
    refetchInterval: userRefectchInterval,
  });
};
