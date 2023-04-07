import type { Token } from "@uniswap/sdk-core";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo } from "react";
import type { Address } from "wagmi";

import type { HookArg } from "./internal/types";
import { useContractReads } from "./internal/useContractReads";
import { userRefectchInterval } from "./internal/utils";
import { getBalanceRead } from "./useBalance";

export const useBalances = <T extends Token>(
  tokens: HookArg<readonly T[]>,
  address: HookArg<Address>
) => {
  const contracts = useMemo(
    () =>
      address && tokens
        ? tokens.map((t) => getBalanceRead(t, address))
        : undefined,
    [address, tokens]
  );

  return useContractReads({
    contracts,
    allowFailure: false,
    staleTime: Infinity,
    enabled: !!tokens && !!address,
    select: (data) =>
      tokens
        ? data.map((d, i) =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            CurrencyAmount.fromRawAmount(tokens[i]!, d.toString())
          )
        : undefined,
    refetchInterval: userRefectchInterval,
  });
};
