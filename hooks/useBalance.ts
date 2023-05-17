import { useEnvironment } from "../contexts/environment";
import type { HookArg } from "./internal/types";
import { useQueryKey } from "./internal/useQueryKey";
import { userRefectchInterval } from "./internal/utils";
import { useIsWrappedNative } from "./useTokens";
import { balance, balanceOf } from "@/lib/reverseMirage/token";
import { useQuery } from "@tanstack/react-query";
import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import invariant from "tiny-invariant";
import { Address, usePublicClient } from "wagmi";

export const useBalance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>,
) => {
  const publicClient = usePublicClient();

  const environment = useEnvironment();
  const native = environment.interface.native;
  const isNative = useIsWrappedNative(token);

  const nativeQueryKey = useQueryKey(
    native && address
      ? [
          {
            get: balance,
            args: { token: native, address },
          },
        ]
      : undefined,
  );
  const queryKey = useQueryKey(
    token && address
      ? [{ get: balanceOf, args: { token, address } }]
      : undefined,
  );

  return useQuery({
    queryKey: isNative ? nativeQueryKey : queryKey,
    queryFn: async () => {
      invariant(token && address);

      const result = isNative
        ? await balance(publicClient, { token: native!, address })
        : await balanceOf(publicClient, { token, address });

      return CurrencyAmount.fromRawAmount(token, result.quotient);
    },
    staleTime: Infinity,
    refetchInterval: userRefectchInterval,
    enabled: !!token && !!address,
  });
};
