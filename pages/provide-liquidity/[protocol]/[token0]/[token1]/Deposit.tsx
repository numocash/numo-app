import { useCallback, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

import CenterSwitch from "@/components/CenterSwitch";
import AsyncButton from "@/components/core/asyncButton";
import CurrencyAmountSelection from "@/components/currencyAmountSelection";
import { useDepositAmount } from "@/hooks/useAmounts";
import { useBalance } from "@/hooks/useBalance";
import { useDeposit } from "@/hooks/useDeposit";
import { useLendgine } from "@/hooks/useLendgine";

import { Beet } from "@/utils/beet";
import { formatDisplayWithSoftLimit } from "@/utils/format";
import tryParseCurrencyAmount from "@/utils/tryParseCurrencyAmount";

import { useProvideLiquidity } from "../../../../hedge-uniswap/[token0]/[token1]";

export default function Deposit() {
  const { address } = useAccount();

  const { selectedLendgine, protocol } = useProvideLiquidity();
  const token0 = selectedLendgine.token0;
  const token1 = selectedLendgine.token1;

  const lendgineInfoQuery = useLendgine(selectedLendgine);

  const token0Query = useBalance(token0, address);
  const token1Query = useBalance(token1, address);

  const [token0String, setToken0String] = useState("");
  const [token1String, setToken1String] = useState("");

  const { amount0, amount1 } = useDepositAmount(
    selectedLendgine,
    tryParseCurrencyAmount(token0String, token0) ??
      tryParseCurrencyAmount(token1String, token1),
    protocol
  );
  const deposit = useDeposit(
    selectedLendgine,
    tryParseCurrencyAmount(token0String, token0) ??
      tryParseCurrencyAmount(token1String, token1),
    protocol
  );

  const onInput = useCallback(
    (value: string, field: "token0" | "token1") => {
      if (!lendgineInfoQuery.data) {
        field === "token0" ? setToken0String(value) : setToken1String(value);
        return;
      }

      field === "token0" ? setToken0String(value) : setToken1String(value);
      field === "token0" ? setToken1String("") : setToken0String("");
    },
    [lendgineInfoQuery.data]
  );

  const disableReason = useMemo(
    () =>
      token0String === "" && token1String === ""
        ? "Enter an amount"
        : !amount0 || !amount1
        ? "Loading"
        : amount0.equalTo(0) && amount1.equalTo(0)
        ? "Enter an amount"
        : !token0Query.data || !token1Query.data
        ? "Loading"
        : amount0.greaterThan(token0Query.data) ||
          amount1.greaterThan(token1Query.data)
        ? "Insufficient amount"
        : deposit.status !== "success"
        ? "Loading"
        : null,
    [
      amount0,
      amount1,
      deposit.status,
      token0Query.data,
      token0String,
      token1Query.data,
      token1String,
    ]
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col rounded-xl border-2 border-gray-200 bg-white">
        <CurrencyAmountSelection
          // className="p-2"
          type="display"
          selectedToken={token0}
          value={
            token0String === ""
              ? token1String === ""
                ? ""
                : formatDisplayWithSoftLimit(
                    Number(amount0?.toFixed(6) ?? 0),
                    4,
                    10
                  )
              : token0String
          }
          onChange={(val) => onInput(val, "token0")}
          // currentAmount={{ allowSelect: true, amount: token0Query.data }}
        />
        <div className=" w-full border-b-2 border-gray-200" />

        <CenterSwitch icon="plus" />
        <CurrencyAmountSelection
          // className="p-2"
          type="display"
          selectedToken={token1}
          value={
            token1String === ""
              ? token0String === ""
                ? ""
                : formatDisplayWithSoftLimit(
                    Number(amount1?.toFixed(6) ?? 0),
                    4,
                    10
                  )
              : token1String
          }
          onChange={(val) => onInput(val, "token1")}
          // currentAmount={{ allowSelect: true, amount: token1Query.data }}
        />
      </div>
      <AsyncButton
        variant="primary"
        className="h-12 items-center text-xl font-bold"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(deposit.data);
          await Beet(deposit.data);

          setToken0String("");
          setToken1String("");
        }}
      >
        {disableReason ?? "Deposit"}
      </AsyncButton>
    </div>
  );
}
