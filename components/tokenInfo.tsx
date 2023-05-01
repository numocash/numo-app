import { clsx } from "clsx";

import type { WrappedTokenInfo } from "@/lib/types/wrappedTokenInfo";

import TokenIcon from "./tokenIcon";

export default function TokenInfo({
  token,
  showName,
  size,
}: {
  token: WrappedTokenInfo;
  showName: boolean;
  size?: number;
}) {
  return (
    <div
      className={clsx(
        "flex items-center",
        showName ? "space-x-4" : "space-x-2",
      )}
    >
      <TokenIcon tokenInfo={token} size={size ?? showName ? 44 : 32} />
      <div className="">
        <p className="p1">{showName ? token.name : token.symbol}</p>
        {showName && <p className="p3">{token.symbol}</p>}
      </div>
    </div>
  );
}
