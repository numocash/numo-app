import type { CurrencyAmount } from "@uniswap/sdk-core";
import { clsx } from "clsx";
import type { CSSProperties } from "react";
import React from "react";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { TokenInfo } from "../TokenInfo";

interface Props {
  onClick?: () => void;
  token: WrappedTokenInfo;
  amount?: CurrencyAmount<WrappedTokenInfo>;
  style?: CSSProperties;
  isSelected?: boolean;
}

export const TokenItem: React.FC<Props> = ({
  onClick,
  token,
  amount,
  style,
  isSelected,
}) => {
  return (
    <div
      className={clsx(
        "px-4 flex hover:bg-white",
        isSelected || (!onClick && "opacity-50 pointer-events-none")
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full cursor-pointer">
        <TokenInfo iconSize={24} small token={token} />

        {!!amount && !amount.equalTo("0") && (
          <div className="text-base text-secondary">
            {amount.toSignificant(4, { groupSeparator: "," })}
          </div>
        )}
      </div>
    </div>
  );
};
