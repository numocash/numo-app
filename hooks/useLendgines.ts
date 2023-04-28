import { CurrencyAmount, Fraction } from "@uniswap/sdk-core";
import type { BigNumber } from "ethers";
import { chunk } from "lodash";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import type { HookArg } from "./internal/types";
import { useContractReads } from "./internal/useContractReads";
import { externalRefetchInterval } from "./internal/utils";
import { getLendgineRead } from "./useLendgine";
import { scale } from "../lib/constants";
import { fractionToPrice } from "../lib/price";
import type { Lendgine } from "../lib/types/lendgine";
import type { Tuple } from "../utils/readonlyTuple";

export const useLendgines = <L extends Lendgine>(
  lendgines: HookArg<readonly L[]>
) => {
  const contracts = useMemo(
    () =>
      lendgines
        ? lendgines.flatMap((lendgine) => getLendgineRead(lendgine))
        : undefined,
    [lendgines]
  );

  return useContractReads({
    contracts,
    allowFailure: false,
    staleTime: Infinity,
    enabled: !!lendgines,
    select: (data) => {
      if (!lendgines) return undefined;

      return chunk(data, 8).map((c, i) => {
        const lendgineInfo = c as Tuple<BigNumber, 8>;
        const lendgine = lendgines?.[i];
        invariant(lendgine);

        return {
          totalPositionSize: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[0].toString()
          ),
          totalLiquidityBorrowed: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[1].toString()
          ),
          rewardPerPositionStored: fractionToPrice(
            new Fraction(lendgineInfo[2].toString(), scale),
            lendgine.lendgine,
            lendgine.token1
          ),
          lastUpdate: +lendgineInfo[3].toString(),
          totalSupply: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[4].toString()
          ),
          reserve0: CurrencyAmount.fromRawAmount(
            lendgine.token0,
            lendgineInfo[5].toString()
          ),
          reserve1: CurrencyAmount.fromRawAmount(
            lendgine.token1,
            lendgineInfo[6].toString()
          ),
          totalLiquidity: CurrencyAmount.fromRawAmount(
            lendgine.lendgine,
            lendgineInfo[7].toString()
          ),
        };
      });
    },
    refetchInterval: externalRefetchInterval,
  });
};
