import CurrencyAmountDisplay from "./currencyAmountDisplay";
import CurrencyInfo from "./currencyInfo";
import { Currency } from "@/lib/types/currency";
import { CurrencyAmount } from "@uniswap/sdk-core";

export default function CurrencyAmountRow({
  amount,
  label,
}: {
  amount: CurrencyAmount<Currency>;
  label?: string;
}) {
  return (
    <>
      <div className="w-full flex flex-col gap-1 items-center h-20 justify-center">
        <div className="flex w-full justify-between items-center px-6">
          <p className="p5">{label ?? ""}</p>
        </div>
        <div className="flex w-full items-center justify-between gap-1 px-6">
          <CurrencyInfo currency={amount.currency} showName={false} />

          <CurrencyAmountDisplay
            showSymbol={false}
            amount={amount}
            className="p1 text-2xl"
          />
        </div>
      </div>
    </>
  );
}
