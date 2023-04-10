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
                    className="h-10 px-1 text-lg rounded-xl"
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
                    className="h-10 px-1 text-lg rounded-xl"
                    onClick={openChainModal}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <>
                  <button onClick={openAccountModal}>
                    <div className="px-4 h-10  rounded-xl flex flex-col bg-[#4f4f4f]">
                      <p className="flex items-center h-full font-bold text-white">
                        {account.displayName}
                      </p>
                    </div>
                  </button>
                  <button onClick={openChainModal}>
                    <div className="p-1.5 rounded-xl bg-[#4f4f4f]">
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
