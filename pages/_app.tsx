import "@/styles/globals.css";
import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { arbitrum, celo, polygon } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import { DefaultToasterWrapper } from "@/src/components/beet";
import { SettingsProvider } from "@/src/contexts/settings";
import { EnvironmentProvider } from "@/src/contexts/useEnvironment";

const { chains, provider, webSocketProvider } = configureChains(
  [
    arbitrum,
    polygon,
    {
      ...celo,
      blockExplorers: {
        ...celo.blockExplorers,
        default: celo.blockExplorers.etherscan,
      },
    },
  ],
  [
    alchemyProvider({ apiKey: "UVgzpWCHx6zsVDO7qC8mtcA6jCl0vgV4" }),
    alchemyProvider({ apiKey: "UOYl0nPuXw_tVCxLnPnd6lSYtj4agcDO" }),
    publicProvider(),
  ]
);

export { chains };

export const toaster = new DefaultToasterWrapper();

const { connectors } = getDefaultWallets({
  appName: "Numoen",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: 3, retryDelay: (attempt) => attempt * 250 },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />

        <RainbowKitProvider coolMode chains={chains}>
          <EnvironmentProvider>
            <SettingsProvider>
              <Component {...pageProps} />
            </SettingsProvider>
          </EnvironmentProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
