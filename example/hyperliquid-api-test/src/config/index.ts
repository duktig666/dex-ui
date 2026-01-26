/**
 * HyperLiquid 测试网配置
 */
export const CONFIG = {
  // API 端点
  REST_API: 'https://api.hyperliquid-testnet.xyz',
  WEBSOCKET: 'wss://api.hyperliquid-testnet.xyz/ws',

  // 链 ID (Arbitrum Sepolia)
  CHAIN_ID: 421614,

  // EIP-712 签名域
  DOMAIN: {
    name: 'HyperliquidSignTransaction',
    version: '1',
    chainId: 421614,
    verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  },

  // 测试常量
  TEST_USER: '0x0000000000000000000000000000000000000000',
  TEST_BUILDER: '0x0000000000000000000000000000000000000001',
} as const;

// hyperliquidChain 标识符
export const HYPERLIQUID_CHAIN = 'Testnet' as const;
