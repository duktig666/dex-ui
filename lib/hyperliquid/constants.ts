/**
 * HyperLiquid API 常量配置
 */

// API 端点
export const HYPERLIQUID_MAINNET_API = 'https://api.hyperliquid.xyz';
export const HYPERLIQUID_TESTNET_API = 'https://api.hyperliquid-testnet.xyz';

export const HYPERLIQUID_MAINNET_WS = 'wss://api.hyperliquid.xyz/ws';
export const HYPERLIQUID_TESTNET_WS = 'wss://api.hyperliquid-testnet.xyz/ws';

// 当前使用测试网
export const IS_TESTNET = true;
export const API_URL = IS_TESTNET ? HYPERLIQUID_TESTNET_API : HYPERLIQUID_MAINNET_API;
export const WS_URL = IS_TESTNET ? HYPERLIQUID_TESTNET_WS : HYPERLIQUID_MAINNET_WS;

// EIP-712 签名相关
export const EIP712_DOMAIN = {
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: IS_TESTNET ? 421614 : 42161, // Arbitrum Sepolia / Arbitrum One
  verifyingContract: '0x0000000000000000000000000000000000000000' as const,
};

// L1 Action 签名 Domain (用于交易类操作)
export const L1_ACTION_DOMAIN = {
  name: 'Exchange',
  version: '1',
  chainId: 1337, // Hyperliquid L1 chain ID
  verifyingContract: '0x0000000000000000000000000000000000000000' as const,
};

// BuildCode 配置
export const BUILDER_ADDRESS = '0xEfc3a654A44FACd6dA111f3114CDd65F16d9a681';
// Builder 费率 (basis points, 1 = 0.01%)
// 永续合约最高 10 (0.1%), 现货最高 100 (1%)
export const BUILDER_FEE_PERP = 1; // 0.01%
export const BUILDER_FEE_SPOT = 10; // 0.1%

// WebSocket 心跳间隔 (毫秒)
export const WS_PING_INTERVAL = 30000;

// K线时间间隔映射
export const CANDLE_INTERVALS = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '120': '2h',
  '240': '4h',
  '360': '6h',
  '480': '8h',
  '720': '12h',
  'D': '1d',
  '1D': '1d',
  'W': '1w',
  '1W': '1w',
  'M': '1M',
  '1M': '1M',
} as const;

// TradingView 时间间隔到 HyperLiquid 间隔的映射
export const TV_TO_HL_INTERVAL: Record<string, string> = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '120': '2h',
  '240': '4h',
  '360': '6h',
  '480': '8h',
  '720': '12h',
  '1D': '1d',
  'D': '1d',
  '1W': '1w',
  'W': '1w',
  '1M': '1M',
  'M': '1M',
};

// HyperLiquid 时间间隔到毫秒的映射
export const INTERVAL_TO_MS: Record<string, number> = {
  '1m': 60 * 1000,
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
};

// 订单类型
export const ORDER_TYPES = {
  LIMIT: 'Limit',
  MARKET: 'Market',
  STOP_MARKET: 'Stop Market',
  STOP_LIMIT: 'Stop Limit',
  TAKE_PROFIT_MARKET: 'Take Profit Market',
  TAKE_PROFIT_LIMIT: 'Take Profit Limit',
} as const;

// Time In Force 类型
export const TIF_TYPES = {
  GTC: 'Gtc', // Good Till Cancelled
  IOC: 'Ioc', // Immediate Or Cancel
  ALO: 'Alo', // Add Liquidity Only (Post Only)
} as const;

// 默认杠杆
export const DEFAULT_LEVERAGE = 10;
export const MAX_LEVERAGE = 100;
