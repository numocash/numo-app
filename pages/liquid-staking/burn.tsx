import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import CenterSwitch from "@/components/CenterSwitch";
import AsyncButton from "@/components/core/asyncButton";
import CurrencyAmountSelection from "@/components/currencyAmountSelection";
import Slider from "@/components/slider";
import { useEnvironment } from "@/contexts/environment";
import { useBurnAmount } from "@/hooks/useAmounts";
import { useBalance } from "@/hooks/useBalance";
import { useBurn } from "@/hooks/useBurn";
import { Beet } from "@/utils/beet";

export default function Burn() {
  const { address } = useAccount();
  const environment = useEnvironment();

  const staking = environment.interface.liquidStaking!;
  const [withdrawPercent, setWithdrawPercent] = useState(20);

  const balanceQuery = useBalance(staking.lendgine.lendgine, address);

  const shares = useMemo(
    () =>
      balanceQuery.data
        ? balanceQuery.data.multiply(withdrawPercent).divide(100)
        : undefined,
    [balanceQuery.data, withdrawPercent]
  );
  const burnAmount = useBurnAmount(staking.lendgine, shares, "stpmmp");
  const burn = useBurn(staking.lendgine, shares, "stpmmp");

  const disableReason = useMemo(
    () =>
      withdrawPercent === 0
        ? "Slide to amount"
        : !balanceQuery.data ||
          burnAmount.status !== "success" ||
          burn.status !== "success"
        ? "Loading"
        : balanceQuery.data.equalTo(0)
        ? "Insufficient balance"
        : null,
    [balanceQuery.data, burn.status, burnAmount.status, withdrawPercent]
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col rounded-xl border-2 border-gray-200 bg-white">
        <div className=" flex h-20 w-full flex-col justify-center gap-2 px-6 py-2">
          <Slider
            input={withdrawPercent}
            onChange={(val) => setWithdrawPercent(val)}
          />
        </div>
        <div className=" w-full border-b-2 border-gray-200" />
        <CenterSwitch icon="arrow" />
        <CurrencyAmountSelection
          // className="justify-center"
          type="display"
          onChange={() => {
            return;
          }}
          selectedToken={staking.lendgine.token1}
          value={burnAmount.collateral?.toSignificant(6, {
            groupSeparator: ",",
          })}
          // inputDisabled={true}
        />
      </div>
      <AsyncButton
        variant="primary"
        className="p1 h-12"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(burn.data);
          await Beet(burn.data);
        }}
      >
        {disableReason ?? "Withdraw"}
      </AsyncButton>
    </div>
  );
}
