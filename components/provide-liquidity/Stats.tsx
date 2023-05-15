import LoadingBox from "@/components/loadingBox";
import MainStats from "@/components/mainStats";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import { useCollect } from "@/hooks/useCollect";
import { useLendgine } from "@/hooks/useLendgine";
import { useLendginePosition } from "@/hooks/useLendginePosition";
import {
  useInterestPremium,
  usePositionValue,
  useTokensOwed,
  useTotalPositionValue,
} from "@/hooks/useValue";
import { calculateAccrual } from "@/lib/amounts";
import { calculateSupplyRate } from "@/lib/jumprate";
import { useProvideLiquidity } from "@/pages/provide-liquidity/[protocol]/[token0]/[token1]";
import { Beet } from "@/utils/beet";
import { formatPercent } from "@/utils/format";
import { useMemo } from "react";
import { useAccount } from "wagmi";

export default function Stats() {
  const { address } = useAccount();
  const { selectedLendgine, protocol } = useProvideLiquidity();

  const lendginePositionQuery = useLendginePosition(
    selectedLendgine,
    address,
    protocol,
  );
  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const userValueQuery = usePositionValue(selectedLendgine, protocol);
  const totalValueQuery = useTotalPositionValue(selectedLendgine, protocol);
  const tokensOwedQuery = useTokensOwed(selectedLendgine, protocol);
  const interestPremium = useInterestPremium(selectedLendgine);

  const collect = useCollect(
    selectedLendgine,
    lendginePositionQuery.data,
    protocol,
  );

  const apr = useMemo(() => {
    if (!lendgineInfoQuery.data || interestPremium.status !== "success")
      return undefined;

    const accruedInfo = calculateAccrual(
      selectedLendgine,
      lendgineInfoQuery.data,
      protocol,
    );
    const supplyRate = calculateSupplyRate({
      lendgineInfo: accruedInfo,
      protocol,
    });
    return supplyRate.multiply(interestPremium.value);
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
                <div className="flex flex-col gap-1 sm:items-center">
                  <TokenAmountDisplay
                    amount={tokensOwedQuery.tokensOwed}
                    showSymbol
                  />
                  {collect.status === "success" && (
                    <button
                      className="p4 text-brand"
                      onClick={async () => {
                        await Beet(collect.data);
                      }}
                      type="button"
                    >
                      Collect
                    </button>
                  )}
                </div>
              ) : (
                <LoadingBox className="h-10 w-20 bg-gray-300" />
              ),
          },
        ] as const
      }
    />
  );
}
