import { useChain } from "../useChain";
import { getQueryKey } from "./useQueryKey";
import { lendgineMirage } from "@/lib/reverseMirage/lendgine";
import { liquidityManagerMirage } from "@/lib/reverseMirage/liquidityManager";
import { erc20Mirage } from "@/lib/reverseMirage/token";
import { uniswapV2Mirage } from "@/lib/reverseMirage/uniswapV2";
import { uniswapV3Mirage } from "@/lib/reverseMirage/uniswapV3";
import { useMemo } from "react";
import { objectKeys } from "ts-extras";
import { usePublicClient } from "wagmi";

const queries = {
  ...erc20Mirage,
  ...lendgineMirage,
  ...liquidityManagerMirage,
  ...uniswapV2Mirage,
  ...uniswapV3Mirage,
} as const;

export const useQueryFactory = () => {
  const publicClient = usePublicClient();
  const chainID = useChain();

  return useMemo(() => {
    const queryGen =
      <TArgs extends object, TRet extends unknown>(
        read: (_publicClient: typeof publicClient, args: TArgs) => TRet,
      ) =>
      (args: Partial<TArgs>) =>
        ({
          queryKey: getQueryKey(read, args, chainID),
          queryFn: () => read(publicClient, args as TArgs),
          enabled: !Object.keys(args).some(
            (key) => args[key as keyof Partial<TArgs>] === undefined,
          ),
          staleTime: Infinity,
        }) as const;

    const reverseMirage = objectKeys(queries).reduce(
      (acc, cur) => {
        const read = queries[cur];
        return {
          ...acc,
          // rome-ignore lint/suspicious/noExplicitAny: cuhhhhhhhh
          [cur]: queryGen(read as any),
        };
      },
      {} as {
        [query in keyof typeof queries]: ReturnType<
          typeof queryGen<
            Parameters<typeof queries[query]>[1],
            ReturnType<typeof queries[query]>
          >
        >;
      },
    );

    // TODO: add query context for refetch interval
    return {
      reverseMirage,
    };
  }, [chainID]);
};
