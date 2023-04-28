import { clsx } from "clsx";
import Image from "next/image";
import { useState } from "react";

import type { WrappedTokenInfo } from "@/src/lib/types/wrappedTokenInfo";

type Props = {
  token?: WrappedTokenInfo;
  size?: number;
  className?: string;
};

export const TokenIcon: React.FC<Props> = ({
  className,
  token,
  size = 28,
}: Props) => {
  const [invalid, setInvalid] = useState<boolean>(false);

  return (
    <div
      className={clsx(
        "flex overflow-hidden rounded-[50%]",
        className,
        `height-[${size}px] width-[${size}px]`
      )}
    >
      {invalid || !token?.logoURI ? (
        <div
          className="h-full w-full border border-dashed border-[#ccc]"
          style={{ borderRadius: "100%" }}
        />
      ) : (
        <Image
          src={token.logoURI}
          onError={() => {
            setInvalid(true);
          }}
          alt={`Icon for token ${token.name ?? ""}`}
        />
      )}
    </div>
  );
};
