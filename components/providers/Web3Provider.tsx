"use client";

import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, type State } from "wagmi";
import { createAppKit } from "@reown/appkit/react";
import { config, projectId, networks, wagmiAdapter } from "@/lib/wagmi/config";

// Create query client
const queryClient = new QueryClient();

// App metadata
const metadata = {
  name: "Hermes DEX",
  description: "Hermes Decentralized Exchange - Trade Perpetuals and Spot",
  url: "https://hermes.trade",
  icons: ["https://hermes.trade/favicon.ico"],
};

// Create AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#0ecb81",
    "--w3m-border-radius-master": "2px",
  },
});

interface Web3ProviderProps {
  children: ReactNode;
  initialState?: State;
}

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
