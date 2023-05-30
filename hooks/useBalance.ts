import type { HookArg } from "./internal/types";
import { useQueryGenerator } from "./internal/useQueryGenerator";
import { userRefectchInterval } from "./internal/utils";
import { erc20BalanceOf, nativeBalance } from "@/lib/reverseMirage/token";
import { Currency } from "@/lib/types/currency";
import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { Address } from "wagmi";

export const useBalance = <TCurrency extends Currency>(
  token: HookArg<TCurrency>,
  address: HookArg<Address>,
) => {
  const balanceQuery = useQueryGenerator(nativeBalance);
  const balanceOfQuery = useQueryGenerator(erc20BalanceOf);

  const query = useQuery({
    ...balanceOfQuery({ token: token?.isToken ? token : undefined, address }),
    refetchInterval: userRefectchInterval,
  });

  const nativeQuery = useQuery({
    ...balanceQuery({
      nativeCurrency: token?.isNative ? token : undefined,
      address,
    }),
    refetchInterval: userRefectchInterval,
  });

  return (token?.isNative ? nativeQuery : query) as UseQueryResult<
    CurrencyAmount<TCurrency>
  >;
};
