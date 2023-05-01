import type { CurrencyAmount, Token } from "@uniswap/sdk-core";

import { formatDisplayWithSoftLimit } from "@/utils/format";

export default function TokenAmountDisplay({
  amount,
  showSymbol,
}: {
  amount: CurrencyAmount<Token>;
  showSymbol: boolean;
}) {
  return (
    <div className="p1 flex items-center">
      {formatDisplayWithSoftLimit(Number(amount.toFixed(6)), 4, 10)}
      {showSymbol && (
        <span>
          {"\u00A0"}
          {amount.currency.symbol}
        </span>
      )}
    </div>
  );
}
