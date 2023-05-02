import AsyncButton from "@/components/core/asyncButton";
import CurrencyAmountSelection from "@/components/currencyAmountSelection";
import { useEnvironment } from "@/contexts/environment";
import { useMintAmount } from "@/hooks/useAmounts";
import { useBalance } from "@/hooks/useBalance";
import { useLendgine } from "@/hooks/useLendgine";
import { useMint } from "@/hooks/useMint";
import { Beet } from "@/utils/beet";
import tryParseCurrencyAmount from "@/utils/tryParseCurrencyAmount";
import { useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount } from "wagmi";

export default function Mint() {
  const { address } = useAccount();
  const environment = useEnvironment();

  const staking = environment.interface.liquidStaking!;
  const [input, setInput] = useState("");

  const balanceQuery = useBalance(staking.lendgine.token1, address);

  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(input, staking.lendgine.token1),
    [input, staking.lendgine.token1],
  );

  const lendgineInfoQuery = useLendgine(staking.lendgine);
  const mintAmounts = useMintAmount(staking.lendgine, parsedAmount, "stpmmp");
  const mint = useMint(staking.lendgine, parsedAmount, "stpmmp");

  const disableReason = useMemo(
    () =>
      input === ""
        ? "Enter an amount"
        : !parsedAmount
        ? "Invalid amount"
        : !balanceQuery.data
        ? "Loading"
        : parsedAmount.greaterThan(balanceQuery.data)
        ? "Insufficient balance"
        : mintAmounts.status !== "success" ||
          !lendgineInfoQuery.data ||
          !mint.data
        ? "Loading"
        : mintAmounts.liquidity.greaterThan(
            lendgineInfoQuery.data?.totalLiquidity,
          )
        ? "Insufficient liqudity"
        : null,
    [
      balanceQuery.data,
      input,
      lendgineInfoQuery.data,
      mint.data,
      mintAmounts.liquidity,
      mintAmounts.status,
      parsedAmount,
    ],
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="rounded-xl border-2 border-gray-200 bg-white">
        <CurrencyAmountSelection
          type="display"
          selectedToken={staking.lendgine.token1}
          value={input}
          onChange={setInput}
          amount={balanceQuery.data}
        />
      </div>

      <AsyncButton
        variant="primary"
        className="p1 h-12"
        disabled={!!disableReason}
        onClick={async () => {
          invariant(mint.data);
          await Beet(mint.data);
          setInput("");
        }}
      >
        {disableReason ?? "Deposit"}
      </AsyncButton>
    </div>
  );
}
