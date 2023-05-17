import TokenInfo from "./tokenInfo";
import { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";
import { formatDisplayWithSoftLimit } from "@/utils/format";
import { CurrencyAmount } from "@uniswap/sdk-core";

export default function CurrencyAmountSelection({
  amount,
  label,
}: {
  amount: CurrencyAmount<WrappedTokenInfo>;
  label?: string;
}) {
  return (
    <>
      <div className="w-full flex flex-col gap-1 items-center h-20 justify-center">
        <div className="flex w-full justify-between items-center px-6">
          <p className="p5">{label ?? ""}</p>
        </div>
        <div className="flex w-full items-center justify-between gap-1 px-6">
          <TokenInfo token={amount.currency} showName={false} />

          <p className="p1 text-2xl">
            {amount.equalTo(0) || amount.lessThan(0)
              ? "0"
              : formatDisplayWithSoftLimit(Number(amount.toFixed(6)), 4, 10)}
          </p>
        </div>
      </div>
    </>
  );
}
