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
    <Wrapper
      className={clsx("flex rounded-[50%] overflow-hidden", className)}
      size={size}
    >
      {invalid || !token?.logoURI ? (
        <Placeholder />
      ) : (
        <Image
          src={token.logoURI}
          onError={() => {
            setInvalid(true);
          }}
          alt={`Icon for token ${token.name ?? ""}`}
        />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{ size: number }>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`;

const Placeholder = styled.div`
  height: 100%;
  width: 100%;
  border: 1px dashed #ccc;
  border-radius: 100%;
`;
