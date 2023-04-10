import type { CurrencyAmount, Percent } from "@uniswap/sdk-core";

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
    <TokenAmountWrapper className={className}>
      {showIcon && (
        <TokenIcon
          size={20}
          css={css`
            margin-right: 4px;
          `}
          token={amount.currency}
        />
      )}

      {formatDisplayWithSoftLimit(Number(amount.toFixed(6)), 4, 10)}

      {showSymbol && (
        <span>
          {"\u00A0"}
          {amount.currency.symbol}
        </span>
      )}
      {percent && <PercentFmt>({formatPercent(percent)})</PercentFmt>}
      {suffix && <span>{suffix}</span>}
    </TokenAmountWrapper>
  );
};

const PercentFmt = styled.span`
  margin-left: 4px;
`;

const TokenAmountWrapper = styled.div`
  display: flex;
  align-items: center;
`;
