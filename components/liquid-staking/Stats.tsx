import LoadingBox from "@/components/loadingBox";
import MainStats from "@/components/mainStats";
import TokenAmountDisplay from "@/components/tokenAmountDisplay";
import { useEnvironment } from "@/contexts/environment";
import { useLiquidStakingReturns } from "@/hooks/useLiquidStakingReturns";
import { useTotalValue, useValue } from "@/hooks/useValue";
import { formatPercent } from "@/utils/format";

export default function Stats() {
  const environment = useEnvironment();
  const staking = environment.interface.liquidStaking!;

  const userValueQuery = useValue(staking.lendgine, "stpmmp");
  const totalValueQuery = useTotalValue(staking.lendgine, "stpmmp");

  const longAPRQuery = useLiquidStakingReturns();

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
            item:
              longAPRQuery.status === "success" ? (
                formatPercent(longAPRQuery.data.totalAPR)
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
        ] as const
      }
    />
  );
}
