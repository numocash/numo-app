import { useConnectModal } from "@rainbow-me/rainbowkit";
import React from "react";
import { useAccount } from "wagmi";

import { Button } from "./Button";

interface IProps
  extends Omit<React.ComponentPropsWithRef<typeof Button>, "onClick"> {
  onClick: () => Promise<void> | void;
  connectWalletOverride?: string;
}

export const AsyncButton: React.FC<IProps> = ({
  onClick,
  children,
  disabled,
  connectWalletOverride,
  ...rest
}: IProps) => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return isConnected ? (
    <Button
      {...rest}
      disabled={disabled}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={async () => {
        await onClick();
      }}
    >
      {children}
    </Button>
  ) : (
    <Button {...rest} disabled={false} onClick={openConnectModal}>
      {connectWalletOverride ?? "Connect Wallet"}
    </Button>
  );
};
