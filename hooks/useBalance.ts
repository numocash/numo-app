import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { utils } from "ethers";
import type { Address } from "wagmi";
import { erc20ABI } from "wagmi";

import type { HookArg, ReadConfig } from "./internal/types";
import { useBalance as useNativeBalance } from "./internal/useBalance";
import { useContractRead } from "./internal/useContractRead";
import { userRefectchInterval } from "./internal/utils";
import { useIsWrappedNative } from "./useTokens";
import { useEnvironment } from "../contexts/environment";

export const useBalance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>
) => {
  const environment = useEnvironment();
  const native = environment.interface.native;

  const nativeBalance = useNativeBalance({
    address: address ?? undefined,
    enabled: !!address && !!native,
    staleTime: Infinity,
    select: (data) =>
      CurrencyAmount.fromRawAmount(
        environment.interface.wrappedNative,
        data.value.toString()
      ),
  });

  const config =
    !!token && !!address
      ? getBalanceRead(token, address)
      : {
          address: undefined,
          abi: undefined,
          functionName: undefined,
          args: undefined,
        };

  const balanceQuery = useContractRead({
    ...config,
    staleTime: Infinity,
    enabled: !!token && !!address,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    select: (data) => CurrencyAmount.fromRawAmount(token!, data.toString()),
    refetchInterval: userRefectchInterval,
  });

  if (useIsWrappedNative(token)) return nativeBalance;
  return balanceQuery;
};

export const getBalanceRead = <T extends Token>(token: T, address: Address) =>
  ({
    address: utils.getAddress(token.address),
    args: [address],
    abi: erc20ABI,
    functionName: "balanceOf",
  } as const satisfies ReadConfig<typeof erc20ABI, "balanceOf">);
