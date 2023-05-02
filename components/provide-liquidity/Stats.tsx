import LoadingBox from "@/components/loadingBox";
import MainStats from "@/components/mainStats";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import { useLendgine } from "@/hooks/useLendgine";
import {
  usePositionValue,
  useTokensOwed,
  useTotalPositionValue,
} from "@/hooks/useValue";
import { calculateAccrual } from "@/lib/amounts";
import { calculateSupplyRate } from "@/lib/jumprate";
import { useProvideLiquidity } from "@/pages/provide-liquidity/[protocol]/[token0]/[token1]";
import { formatPercent } from "@/utils/format";
import { useMemo } from "react";

export default function Stats() {
  const { selectedLendgine, protocol } = useProvideLiquidity();

  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const userValueQuery = usePositionValue(selectedLendgine, protocol);
  const totalValueQuery = useTotalPositionValue(selectedLendgine, protocol);
  const tokensOwedQuery = useTokensOwed(selectedLendgine, protocol);

  const apr = useMemo(() => {
    if (!lendgineInfoQuery.data) return undefined;

    const accruedInfo = calculateAccrual(
      selectedLendgine,
      lendgineInfoQuery.data,
      protocol,
    );
    const supplyRate = calculateSupplyRate({
      lendgineInfo: accruedInfo,
      protocol,
    });
    // TODO: compute the interest premium
    return supplyRate;
  }, [lendgineInfoQuery.data, selectedLendgine, protocol]);

  return (
    <MainStats
      items={
        [
          {
            label: "Total deposited",
            item: totalValueQuery.value ? (
              <TokenAmountDisplay amount={totalValueQuery.value} showSymbol />
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-300" />
            ),
          },
          {
            label: "APR",
            item: apr ? (
              formatPercent(apr)
            ) : (
              <LoadingBox className="h-10 w-20 bg-gray-300" />
            ),
          },
          {
            label: "Balance",
            item:
              userValueQuery.status === "success" ? (
                <TokenAmountDisplay amount={userValueQuery.value} showSymbol />
              ) : (
                <LoadingBox className="h-10 w-20 bg-gray-300" />
              ),
          },
          {
            label: "Interest",
            item:
              tokensOwedQuery.status === "success" ? (
                <TokenAmountDisplay
                  amount={tokensOwedQuery.tokensOwed}
                  showSymbol
                />
              ) : (
                <LoadingBox className="h-10 w-20 bg-gray-300" />
              ),
          },
        ] as const
      }
    />
  );
}
