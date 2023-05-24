import { useChain } from "../useChain";
import { SupportedChainIDs } from "@/constants";
import { useMemo } from "react";

export const useQueryKey = <TArgs extends object>(
  // rome-ignore lint/suspicious/noExplicitAny: dont need
  get: (publicClient: any, args: TArgs) => any,
  args: Partial<TArgs>,
) => {
  const chainID = useChain();

  return useMemo(() => getQueryKey(get, args, chainID), [get, args, chainID]);
};

export const getQueryKey = <TArgs extends object>(
  // rome-ignore lint/suspicious/noExplicitAny: dont need
  get: (publicClient: any, args: TArgs) => any,
  args: Partial<TArgs>,
  chainID: SupportedChainIDs,
) => {
  return [
    {
      chainID,
      read: {
        name: get.name,
        args,
      },
    },
  ] as const;
};
