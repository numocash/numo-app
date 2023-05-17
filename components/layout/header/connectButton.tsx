import Button from "@/components/core/button";
import { ConnectButton as ConnectButtonRainbow } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export default function ConnectButton() {
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
                    variant="connect"
                    className="h-10 rounded-xl px-1"
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
                    className="h-10 rounded-xl px-1"
                    onClick={openChainModal}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <>
                  <button onClick={openAccountModal} type="button">
                    <div className="flex h-10  flex-col rounded-xl bg-gray-700 px-4">
                      <p className="p2 flex h-full items-center text-white">
                        {account.displayName}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={openChainModal}
                    className="pl-1"
                    type="button"
                  >
                    <div className="flex h-10 flex-col items-center justify-center rounded-xl bg-gray-700 px-1.5">
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
}
