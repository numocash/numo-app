import { ConnectButton as ConnectButtonRainbow } from "@rainbow-me/rainbowkit";

import Image from "next/image";

import { Button } from "../Button";

export const ConnectButton: React.FC = () => {
  return (
    <ConnectButtonRainbow.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    variant="inverse"
                    className="h-10 rounded-xl px-1 text-lg"
                    onClick={openConnectModal}
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    variant="danger"
                    className="h-10 rounded-xl px-1 text-lg"
                    onClick={openChainModal}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <>
                  <button onClick={openAccountModal}>
                    <div className="flex h-10  flex-col rounded-xl bg-[#4f4f4f] px-4">
                      <p className="flex h-full items-center font-bold text-white">
                        {account.displayName}
                      </p>
                    </div>
                  </button>
                  <button onClick={openChainModal}>
                    <div className="rounded-xl bg-[#4f4f4f] p-1.5">
                      <Image
                        alt={chain.name ?? "Chain icon"}
                        src={
                          chain.iconUrl ??
                          "https://assets.coingecko.com/coins/images/11090/small/InjXBNx9_400x400.jpg?1674707499"
                        }
                        className="rounded-full"
                        width={30}
                        height={30}
                      />
                    </div>
                  </button>
                </>
              );
            })()}
          </>
        );
      }}
    </ConnectButtonRainbow.Custom>
  );
};
