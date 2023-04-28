import type { CurrencyAmount, Percent } from "@uniswap/sdk-core";

import { clsx } from "clsx";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";
import { formatDisplayWithSoftLimit, formatPercent } from "@/src/utils/format";

import { TokenIcon } from "./TokenIcon";

export type IProps<T extends WrappedTokenInfo> = {
  amount: CurrencyAmount<T>;
  isMonoNumber?: boolean;
  showIcon?: boolean;
  percent?: Percent;
  className?: string;
  showSymbol?: boolean;
  suffix?: string;
};

export const TokenAmountDisplay = <T extends WrappedTokenInfo>({
  amount,
  showIcon = false,
  showSymbol = true,
  percent,
  className,
  suffix = "",
}: IProps<T>) => {
  return (
    <div className={clsx("align-center flex", className)}>
      {showIcon && (
        <TokenIcon size={20} className="mr-1" token={amount.currency} />
      )}

      {formatDisplayWithSoftLimit(Number(amount.toFixed(6)), 4, 10)}

      {showSymbol && (
        <span>
          {"\u00A0"}
          {amount.currency.symbol}
        </span>
      )}
      {percent && <span className={"ml-1"}>({formatPercent(percent)})</span>}
      {suffix && <span>{suffix}</span>}
    </div>
  );
};
