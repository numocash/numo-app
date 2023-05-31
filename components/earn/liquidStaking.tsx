import EarnCard from "./earnCard";
import CurrencyIcon from "@/components/currencyIcon";
import LoadingSpinner from "@/components/loadingSpinner";
import { useEnvironment } from "@/contexts/environment";
import { useLiquidStakingReturns } from "@/hooks/useLiquidStakingReturns";
import { formatPercent } from "@/utils/format";
import { BsLightningChargeFill } from "react-icons/bs";

export default function LiquidStaking() {
  const environment = useEnvironment();
  const longAPRQuery = useLiquidStakingReturns();

  return (
    <EarnCard
      to="liquid-staking"
      className="items-center justify-between p-6"
      style={{
        backgroundImage: `linear-gradient(to top right, white, 85%, ${
          environment.interface.liquidStaking!.color
        })`,
      }}
    >
      <h2 className="text-center">Liquid Staking Boost</h2>
      <CurrencyIcon
        currency={environment.interface.liquidStaking!.lendgine.token1}
        size={48}
      />
      <span className="shaked flex items-center gap-1">
        <p className="p1  text-secondary">
          {longAPRQuery.status === "success" ? (
            formatPercent(longAPRQuery.data.totalAPR)
          ) : (
            <LoadingSpinner />
          )}
        </p>
        <BsLightningChargeFill className="fill-yellow-300 text-xl" />
      </span>
      <p className="p5 text-center">
        Boost your {environment.interface.liquidStaking?.lendgine.token1.symbol}{" "}
        yield by speculating on staking rewards
      </p>
    </EarnCard>
  );
}
