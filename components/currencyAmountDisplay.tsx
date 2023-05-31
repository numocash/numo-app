import type { Currency } from "@/lib/types/currency";
import { formatDisplayWithSoftLimit } from "@/utils/format";
import type { CurrencyAmount } from "@uniswap/sdk-core";
import { clsx } from "clsx";

export default function CurrencyAmountDisplay({
  amount,
  showSymbol,
  className,
}: {
  amount: CurrencyAmount<Currency>;
  showSymbol: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center", className)}>
      {amount.equalTo(0)
        ? "0"
        : formatDisplayWithSoftLimit(Number(amount.toFixed(6)), 4, 10)}
      {showSymbol && (
        <span>
          {"\u00A0"}
          {amount.currency.symbol}
        </span>
      )}
    </div>
  );
}
