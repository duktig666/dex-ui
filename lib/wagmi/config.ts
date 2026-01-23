import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import {
  mainnet,
  arbitrum,
  base,
  arbitrumSepolia,
  type AppKitNetwork,
} from '@reown/appkit/networks';
import { CURRENT_NETWORK, IS_TESTNET } from '@/lib/hyperliquid/constants';

// Get projectId from environment or use default
export const projectId = '5091f2acd0f2b5fcafb96ba3eb9acbf1';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// Required chain based on HyperLiquid network
// Testnet: Arbitrum Sepolia (421614)
// Mainnet: Arbitrum One (42161)
export const REQUIRED_CHAIN_ID = CURRENT_NETWORK.chainId;
export const REQUIRED_CHAIN = IS_TESTNET ? arbitrumSepolia : arbitrum;

// Supported networks - include the required chain first
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = IS_TESTNET
  ? [arbitrumSepolia, mainnet, arbitrum, base]
  : [arbitrum, mainnet, base];

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
