import LoadingBox from "../loadingBox";
import MainStats from "../mainStats";
import TokenAmountDisplay from "../tokenAmountDisplay";
import { useMostLiquidMarket } from "@/hooks/useExternalExchange";
import { useLendgine } from "@/hooks/useLendgine";
import { calculateAccrual } from "@/lib/amounts";
import {
  calculateEstimatedBurnAmount,
  calculateEstimatedPairBurnAmount,
} from "@/lib/amounts";
import { calculateBorrowRate } from "@/lib/jumprate";
import { Lendgine } from "@/lib/types/lendgine";
import { formatPercent } from "@/utils/format";
import { useMemo } from "react";

export default function Stats({
  selectedLendgine,
}: { selectedLendgine: Lendgine | undefined }) {
  const lendgineInfoQuery = useLendgine(selectedLendgine);

  const priceQuery = useMostLiquidMarket(
    selectedLendgine
      ? { quote: selectedLendgine.token0, base: selectedLendgine.token1 }
      : undefined,
  );

  const { openInterest, borrowRate } = useMemo(() => {
    if (!selectedLendgine || !lendgineInfoQuery.data || !priceQuery.data)
      return {};

    const accruedInfo = calculateAccrual(
      selectedLendgine,
      lendgineInfoQuery.data,
      "pmmp",
    );
    const borrowRate = calculateBorrowRate({
      lendgineInfo: accruedInfo,
      protocol: "pmmp",
    });

    const { liquidity } = calculateEstimatedBurnAmount(
      selectedLendgine,
      lendgineInfoQuery.data,
      lendgineInfoQuery.data.totalSupply,
      "pmmp",
    );
    const { amount0, amount1 } = calculateEstimatedPairBurnAmount(
      selectedLendgine,
      lendgineInfoQuery.data,
      liquidity,
    );

    const openInterest = amount0.add(priceQuery.data.price.quote(amount1));

    return { openInterest, borrowRate } as const;
  }, [
    selectedLendgine,
    lendgineInfoQuery.data,
    lendgineInfoQuery.isLoading,
    priceQuery.data,
    priceQuery.status,
  ]);

  return (
    <MainStats
      items={
        [
          {
            label: "Open Interest",
            item: openInterest ? (
              <TokenAmountDisplay amount={openInterest} showSymbol />
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-300" />
            ),
          },
          {
            label: "Funding APR",
            item: borrowRate ? (
              formatPercent(borrowRate)
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-300" />
            ),
          },
          {
            label: "Leverage",
            item: "x²",
          },
        ] as const
      }
    />
  );
}
