import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { utils } from "ethers";
import type { Address } from "wagmi";
import { erc20ABI } from "wagmi";

import type { HookArg, ReadConfig } from "./internal/types";
import { useContractRead } from "./internal/useContractRead";
import { userRefectchInterval } from "./internal/utils";

export const useAllowance = <T extends Token>(
  token: HookArg<T>,
  address: HookArg<Address>,
  spender: HookArg<Address>,
) => {
  const config =
    !!token && !!address && !!spender
      ? getAllowanceRead(token, address, spender)
      : {
          address: undefined,
          abi: undefined,
          functionName: undefined,
          args: undefined,
        };
  return useContractRead({
    ...config,
    staleTime: Infinity,
    enabled: !!token && !!address && !!spender,
    select: (data) => CurrencyAmount.fromRawAmount(token!, data.toString()),
    refetchInterval: userRefectchInterval,
  });
};

export const getAllowanceRead = <T extends Token>(
  token: T,
  address: Address,
  spender: Address,
) =>
  ({
    address: utils.getAddress(token.address),
    args: [address, spender],
    abi: erc20ABI,
    functionName: "allowance",
  }) as const satisfies ReadConfig<typeof erc20ABI, "allowance">;
