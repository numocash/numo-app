import type { ReadConfig } from "./types";
import { useQueryClient } from "@tanstack/react-query";
import type { Abi, Address } from "abitype";
import { useCallback } from "react";

export const useInvalidateCall = () => {
  const queryClient = useQueryClient();

  return useCallback(
    <TAbi extends Abi, TFunctionName extends string>({
      abi,
      address,
      args,
      functionName,
    }: ReadConfig<TAbi, TFunctionName>) => {
      if (!!address && !!functionName && !!abi)
        return queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey;
            if (queryKey.length !== 1) return false;
            if (!("contracts" in (queryKey[0] as any))) return false;

            if (
              (
                queryKey as [
                  {
                    contracts: {
                      args: readonly unknown[] | undefined;
                      functionName: string | undefined;
                      address: Address | undefined;
                    }[];
                  },
                ]
              )[0].contracts.find((c) => {
                return (
                  c.functionName === functionName &&
                  c.args &&
                  args &&
                  c.args.every((a, i) =>
                    typeof a === "string" && typeof args[i] === "string"
                      ? a.toLowerCase() === (args[i] as string).toLowerCase()
                      : a === args[i],
                  ) &&
                  c.address &&
                  c.address.toLowerCase() === address.toLowerCase()
                );
              }) !== undefined
            ) {
              return true;
            }
            return false;
          },
        });
    },
    [queryClient],
  );
};
