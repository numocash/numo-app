import { SupportedChainIDs } from "@/constants";

export const userRefectchInterval = 60 * 1_000;

export const externalRefetchInterval = 10_000;

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
