import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, arbitrum, base } from "@reown/appkit/networks";

// Get projectId from environment or use default
export const projectId = "5091f2acd0f2b5fcafb96ba3eb9acbf1";

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Supported networks
export const networks = [mainnet, arbitrum, base];

// Wagmi Adapter configuration
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
