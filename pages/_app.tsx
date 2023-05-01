import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, getDefaultWallets } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { WagmiConfig, configureChains, createClient } from "wagmi";
import { arbitrum, celo, polygon } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

import Layout from "@/components/layout";
import { EnvironmentProvider } from "@/contexts/environment";
import { SettingsProvider } from "@/contexts/settings";
import { DefaultToasterWrapper } from "@/utils/beet";
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
); // TODO: use websockets provider

export const toaster = new DefaultToasterWrapper();

export { chains };

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
              <Layout>
                <Component {...pageProps} />
                <Analytics />
              </Layout>
            </SettingsProvider>
          </EnvironmentProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}
