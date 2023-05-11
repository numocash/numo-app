import TokenInfo from "./tokenInfo";
import { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";
import { formatDisplayWithSoftLimit } from "@/utils/format";
import { CurrencyAmount } from "@uniswap/sdk-core";

export default function CurrencyAmountSelection({
  amount,
}: {
  amount: CurrencyAmount<WrappedTokenInfo>;
}) {
  return (
    <>
      <div className="flex h-20  w-full items-center justify-between gap-1 px-2 pl-4">
        <TokenInfo token={amount.currency} showName={false} />

        <p className="p1 text-2xl">
          {amount.equalTo(0) || amount.lessThan(0)
            ? "0"
            : formatDisplayWithSoftLimit(Number(amount.toFixed(6)), 4, 10)}
        </p>
      </div>
    </>
  );
}
