import { useProvideLiquidity } from ".";
import CenterSwitch from "@/components/CenterSwitch";
import AsyncButton from "@/components/core/asyncButton";
import CurrencyAmountDisplay from "@/components/currencyAmountDisplay";
import Slider from "@/components/slider";
import { useWithdrawAmount } from "@/hooks/useAmounts";
import { useLendgine } from "@/hooks/useLendgine";
import { useLendginePosition } from "@/hooks/useLendginePosition";
import { useWithdraw } from "@/hooks/useWithdraw";
import { Beet } from "@/utils/beet";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

export default function Withdraw() {
  const { address } = useAccount();
  const { selectedLendgine, protocol } = useProvideLiquidity();

  const [withdrawPercent, setWithdrawPercent] = useState(20);

  const lendgineInfoQuery = useLendgine(selectedLendgine);
  const positionQuery = useLendginePosition(
    selectedLendgine,
    address,
    protocol,
  );

  const size = useMemo(
    () =>
      positionQuery.data
        ? positionQuery.data.size.multiply(withdrawPercent).divide(100)
        : undefined,
    [positionQuery.data, withdrawPercent],
  );
  const withdrawAmount = useWithdrawAmount(
    selectedLendgine,
    size ? { size: size } : undefined,
    protocol,
  );
  const withdraw = useWithdraw(
    selectedLendgine,
    size ? { size: size } : undefined,
    protocol,
  );

  const disableReason = useMemo(
    () =>
      withdrawPercent === 0
        ? "Slide to amount"
        : !positionQuery.data || !size
        ? "Loading"
        : positionQuery.data.size.equalTo(0)
        ? "Insufficient balance"
        : size.equalTo(0)
        ? "Invalid amount"
        : withdrawAmount.status !== "success" ||
          withdraw.status !== "success" ||
          !lendgineInfoQuery.data
        ? "Loading"
        : withdrawAmount.liquidity.greaterThan(
            lendgineInfoQuery.data.totalLiquidity,
          )
        ? "Insufficent liquidity"
        : null,
    [
      lendgineInfoQuery.data,
      positionQuery.data,
      size,
      withdraw.status,
      withdrawAmount.liquidity,
      withdrawAmount.status,
      withdrawPercent,
    ],
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col rounded-xl border-2 border-gray-200 bg-white">
        <div className=" flex h-20 w-full flex-col justify-center gap-2 px-6 py-2">
          <Slider input={withdrawPercent} onChange={setWithdrawPercent} />
        </div>
        <div className=" w-full border-b-2 border-gray-200" />
        <CenterSwitch icon="arrow" />
        <CurrencyAmountDisplay
          // className="justify-center"
          amount={
            withdrawAmount.status === "success"
              ? withdrawAmount.amount0
              : CurrencyAmount.fromRawAmount(selectedLendgine.token0, 0)
          }
        />
        <div className=" w-full border-b-2 border-gray-200" />
        <CenterSwitch icon="plus" />
        <CurrencyAmountDisplay
          // className="justify-center"
          amount={
            withdrawAmount.status === "success"
              ? withdrawAmount.amount1
              : CurrencyAmount.fromRawAmount(selectedLendgine.token1, 0)
          }
          // inputDisabled={true}
        />
      </div>
      <AsyncButton
        variant="primary"
        className="h-12 items-center text-xl font-bold"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(withdraw.data);
          await Beet(withdraw.data);
        }}
      >
        {disableReason ?? "Withdraw"}
      </AsyncButton>
    </div>
  );
}
