// ============================================================
// HyperLiquid API 类型定义 - 统一导出
// ============================================================

// /info API 类型
export * from './info';

// /exchange API 类型
export * from './exchange';

// WebSocket 类型
export * from './websocket';

// ============================================================
// 常用类型别名
// ============================================================

import type {
  MetaAndAssetCtxsResponse,
  ClearinghouseStateResponse,
  SpotMetaAndAssetCtxsResponse,
  SpotClearinghouseStateResponse,
  L2BookResponse,
  UserFillsResponse,
  FrontendOpenOrdersResponse,
} from './info';

/** 永续市场数据 (元数据 + 实时上下文) */
export type PerpMarketData = MetaAndAssetCtxsResponse;

/** 现货市场数据 (元数据 + 实时上下文) */
export type SpotMarketData = SpotMetaAndAssetCtxsResponse;

/** 永续账户状态 */
export type PerpAccountState = ClearinghouseStateResponse;

/** 现货账户状态 */
export type SpotAccountState = SpotClearinghouseStateResponse;

/** 订单簿数据 */
export type OrderBook = L2BookResponse;

/** 用户成交列表 */
export type UserTrades = UserFillsResponse;

/** 用户挂单列表 */
export type UserOrders = FrontendOpenOrdersResponse;

// ============================================================
// API 端点常量
// ============================================================

/** API 端点配置 */
export const API_ENDPOINTS = {
  /** 主网 REST API */
  MAINNET_REST: 'https://api.hyperliquid.xyz',
  /** 测试网 REST API */
  TESTNET_REST: 'https://api.hyperliquid-testnet.xyz',
  /** 主网 WebSocket */
  MAINNET_WS: 'wss://api.hyperliquid.xyz/ws',
  /** 测试网 WebSocket */
  TESTNET_WS: 'wss://api.hyperliquid-testnet.xyz/ws',
} as const;

/** 请求端点 */
export const REQUEST_PATHS = {
  /** 查询端点 */
  INFO: '/info',
  /** 交易端点 */
  EXCHANGE: '/exchange',
} as const;

// ============================================================
// 资产 ID 计算工具
// ============================================================

/**
 * 计算永续合约的资产 ID
 * @param coinIndex meta.universe 中的索引
 * @returns 资产 ID (直接使用索引)
 *
 * @example
 * // BTC 在 meta.universe 中索引为 0
 * const btcAssetId = getPerpAssetId(0); // 返回 0
 */
export function getPerpAssetId(coinIndex: number): number {
  return coinIndex;
}

/**
 * 计算现货的资产 ID
 * @param marketIndex spotMeta.universe 中的索引
 * @returns 资产 ID (10000 + 索引)
 *
 * @example
 * // PURR/USDC 在 spotMeta.universe 中索引为 0
 * const purrAssetId = getSpotAssetId(0); // 返回 10000
 */
export function getSpotAssetId(marketIndex: number): number {
  return 10000 + marketIndex;
}

/**
 * 判断资产 ID 是否为现货
 * @param assetId 资产 ID
 * @returns 是否为现货
 */
export function isSpotAsset(assetId: number): boolean {
  return assetId >= 10000;
}

/**
 * 从资产 ID 获取索引
 * @param assetId 资产 ID
 * @returns 在 universe 中的索引
 */
export function getAssetIndex(assetId: number): number {
  return isSpotAsset(assetId) ? assetId - 10000 : assetId;
}

// ============================================================
// 数量精度工具
// ============================================================

/**
 * 根据 szDecimals 格式化数量
 * @param size 原始数量
 * @param szDecimals 精度小数位
 * @returns 格式化后的数量字符串
 *
 * @example
 * formatSize(0.12345, 4); // "0.1234"
 * formatSize(1.5, 2);     // "1.50"
 */
export function formatSize(size: number, szDecimals: number): string {
  return size.toFixed(szDecimals);
}

/**
 * 根据 szDecimals 向下取整数量
 * @param size 原始数量
 * @param szDecimals 精度小数位
 * @returns 取整后的数量
 *
 * @example
 * floorSize(0.12345, 4); // 0.1234
 * floorSize(1.999, 2);   // 1.99
 */
export function floorSize(size: number, szDecimals: number): number {
  const multiplier = Math.pow(10, szDecimals);
  return Math.floor(size * multiplier) / multiplier;
}

// ============================================================
// 价格计算工具
// ============================================================

/**
 * 计算 24 小时涨跌幅
 * @param currentPx 当前价格
 * @param prevDayPx 前日价格
 * @returns 涨跌幅百分比
 *
 * @example
 * calc24hChange("100", "95"); // 5.26...
 */
export function calc24hChange(currentPx: string, prevDayPx: string): number {
  const current = parseFloat(currentPx);
  const prev = parseFloat(prevDayPx);
  if (prev === 0) return 0;
  return ((current - prev) / prev) * 100;
}

/**
 * 格式化资金费率为百分比
 * @param funding 资金费率 (小数)
 * @returns 百分比字符串
 *
 * @example
 * formatFundingRate("0.0001"); // "0.01%"
 */
export function formatFundingRate(funding: string): string {
  const rate = parseFloat(funding) * 100;
  return `${rate.toFixed(4)}%`;
}

/**
 * 计算未实现盈亏
 * @param szi 持仓数量 (正=多，负=空)
 * @param entryPx 开仓价
 * @param markPx 标记价
 * @returns 未实现盈亏 (USD)
 */
export function calcUnrealizedPnl(szi: string, entryPx: string, markPx: string): number {
  const size = parseFloat(szi);
  const entry = parseFloat(entryPx);
  const mark = parseFloat(markPx);
  return size * (mark - entry);
}

/**
 * 计算收益率 (ROE)
 * @param unrealizedPnl 未实现盈亏
 * @param marginUsed 占用保证金
 * @returns 收益率百分比
 */
export function calcROE(unrealizedPnl: number, marginUsed: number): number {
  if (marginUsed === 0) return 0;
  return (unrealizedPnl / marginUsed) * 100;
}
