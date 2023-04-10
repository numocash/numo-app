import type { CurrencyAmount } from "@uniswap/sdk-core";
import type { CSSProperties } from "react";
import React from "react";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { TokenInfo } from "../TokenInfo";

const Balance = styled.div(() => [tw`text-base text-secondary`]);

const TokenOption = styled.div(() => [
  tw`flex items-center justify-between w-full`,
  tw`cursor-pointer`,
]);

const Wrapper = styled.div<{ disabled?: boolean }>(({ disabled }) => [
  tw`px-4 flex hover:(bg-white)`,
  disabled && tw`opacity-50 pointer-events-none`,
]);

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
    <Wrapper style={style} onClick={onClick} disabled={isSelected || !onClick}>
      <TokenOption>
        <TokenInfo iconSize={24} small token={token} />

        {!!amount && !amount.equalTo("0") && (
          <Balance>{amount.toSignificant(4, { groupSeparator: "," })}</Balance>
        )}
      </TokenOption>
    </Wrapper>
  );
};
