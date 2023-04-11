import { clsx } from "clsx";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

import { TokenIcon } from "./TokenIcon";

type IProps<T extends WrappedTokenInfo> = {
  token: T;
  iconSize?: number;
  className?: string;
  small?: boolean;
  showName?: boolean;
};

export const TokenInfo = <T extends WrappedTokenInfo>({
  token,
  iconSize = 30,
  className,
  small = false,
  showName = true,
}: IProps<T>) => {
  return (
    <div className={clsx("flex items-center space-x-4", className)}>
      <TokenIcon size={iconSize} token={token} />
      <div className={clsx(small ? "space-y-0" : "space-y-1")}>
        <div className="flex items-center">
          <div
            className={clsx(
              "text-xl font-semibold leading-none text-default",
              small && "text-base"
            )}
          >
            {token.symbol}
          </div>
        </div>
        {showName && (
          <div
            className={clsx(
              "text-lg text-secondary",
              small && "text-sm leading-none"
            )}
          >
            {token.name}
          </div>
        )}
      </div>
    </div>
  );
};
