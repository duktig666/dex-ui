// ============================================================
// HyperLiquid WebSocket 类型定义
// ============================================================

import type { L2BookLevel, Trade, Candle, Fill, OpenOrder } from './info';

// ============================================================
// 连接配置
// ============================================================

/** 主网 WebSocket URL */
export const MAINNET_WS_URL = 'wss://api.hyperliquid.xyz/ws';

/** 测试网 WebSocket URL */
export const TESTNET_WS_URL = 'wss://api.hyperliquid-testnet.xyz/ws';

// ============================================================
// 订阅请求类型
// ============================================================

/** 所有中间价订阅 */
export interface AllMidsSubscription {
  type: 'allMids';
}

/** 订单簿订阅 */
export interface L2BookSubscription {
  type: 'l2Book';
  /** 交易对名称 */
  coin: string;
}

/** 成交订阅 */
export interface TradesSubscription {
  type: 'trades';
  /** 交易对名称 */
  coin: string;
}

/** K线订阅 */
export interface CandleSubscription {
  type: 'candle';
  /** 交易对名称 */
  coin: string;
  /** K线周期: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M" */
  interval: string;
}

/** 用户成交订阅 */
export interface UserFillsSubscription {
  type: 'userFills';
  /** 用户钱包地址 */
  user: string;
}

/** 用户资金费率订阅 */
export interface UserFundingsSubscription {
  type: 'userFundings';
  /** 用户钱包地址 */
  user: string;
}

/** 用户非资金费率更新订阅 */
export interface UserNonFundingLedgerUpdatesSubscription {
  type: 'userNonFundingLedgerUpdates';
  /** 用户钱包地址 */
  user: string;
}

/** 订单更新订阅 */
export interface OrderUpdatesSubscription {
  type: 'orderUpdates';
  /** 用户钱包地址 */
  user: string;
}

/** Web 数据订阅 (组合订阅) */
export interface WebData2Subscription {
  type: 'webData2';
  /** 用户钱包地址 */
  user: string;
}

/** 通知订阅 */
export interface NotificationSubscription {
  type: 'notification';
  /** 用户钱包地址 */
  user: string;
}

/** 活跃资产上下文订阅 */
export interface ActiveAssetCtxSubscription {
  type: 'activeAssetCtx';
  /** 交易对名称 */
  coin: string;
}

/** 活跃现货资产上下文订阅 */
export interface ActiveSpotAssetCtxSubscription {
  type: 'activeSpotAssetCtx';
  /** 交易对名称 */
  coin: string;
}

/** 订阅类型联合 */
export type Subscription =
  | AllMidsSubscription
  | L2BookSubscription
  | TradesSubscription
  | CandleSubscription
  | UserFillsSubscription
  | UserFundingsSubscription
  | UserNonFundingLedgerUpdatesSubscription
  | OrderUpdatesSubscription
  | WebData2Subscription
  | NotificationSubscription
  | ActiveAssetCtxSubscription
  | ActiveSpotAssetCtxSubscription;

// ============================================================
// WebSocket 消息类型 (客户端发送)
// ============================================================

/** 订阅消息 */
export interface SubscribeMessage {
  method: 'subscribe';
  subscription: Subscription;
}

/** 取消订阅消息 */
export interface UnsubscribeMessage {
  method: 'unsubscribe';
  subscription: Subscription;
}

/** POST 请求消息 (通过 WebSocket 发送 info 请求) */
export interface PostMessage {
  method: 'post';
  id: number;
  request: {
    type: string;
    [key: string]: unknown;
  };
}

/** 客户端消息类型 */
export type ClientMessage = SubscribeMessage | UnsubscribeMessage | PostMessage;

// ============================================================
// WebSocket 消息类型 (服务端推送)
// ============================================================

/** 订阅确认响应 */
export interface SubscriptionResponse {
  channel: 'subscriptionResponse';
  data: {
    method: 'subscribe' | 'unsubscribe';
    subscription: Subscription;
  };
}

/** POST 响应 */
export interface PostResponse {
  channel: 'post';
  data: {
    id: number;
    response: unknown;
  };
}

/** 错误响应 */
export interface ErrorMessage {
  channel: 'error';
  data: string;
}

/** Pong 响应 */
export interface PongMessage {
  channel: 'pong';
}

// ============================================================
// 数据推送类型
// ============================================================

/** 所有中间价推送数据 */
export interface AllMidsData {
  /** 所有交易对的中间价 → 行情列表: 当前价格 */
  mids: Record<string, string>;
}

/** 所有中间价推送 */
export interface AllMidsMessage {
  channel: 'allMids';
  data: AllMidsData;
}

/** 订单簿推送数据 */
export interface L2BookData {
  /** 交易对名称 */
  coin: string;
  /** 更新时间 (毫秒) */
  time: number;
  /** [买盘档位, 卖盘档位] */
  levels: [L2BookLevel[], L2BookLevel[]];
}

/** 订单簿推送 */
export interface L2BookMessage {
  channel: 'l2Book';
  data: L2BookData;
}

/** 成交推送 */
export interface TradesMessage {
  channel: 'trades';
  data: Trade[];
}

/** K线推送 */
export interface CandleMessage {
  channel: 'candle';
  data: Candle;
}

/** 用户成交推送 */
export interface UserFillsMessage {
  channel: 'userFills';
  data: Fill;
}

/** 用户资金费率推送数据 */
export interface UserFundingData {
  /** 结算时间 (毫秒) */
  time: number;
  /** 交易对名称 */
  coin: string;
  /** 资金费金额 (USDC) */
  usdc: string;
  /** 结算时持仓量 */
  szi: string;
  /** 资金费率 */
  fundingRate: string;
}

/** 用户资金费率推送 */
export interface UserFundingsMessage {
  channel: 'userFundings';
  data: UserFundingData;
}

/** 订单更新类型 */
export type OrderUpdateStatus =
  | 'open'
  | 'filled'
  | 'canceled'
  | 'triggered'
  | 'rejected'
  | 'marginCanceled';

/** 订单更新数据 */
export interface OrderUpdateData {
  /** 订单信息 */
  order: OpenOrder & {
    /** 订单类型 */
    orderType: string;
    /** 有效期 */
    tif: string;
    /** 是否仅减仓 */
    reduceOnly: boolean;
    /** 触发条件 (条件单) */
    triggerCondition?: string;
    /** 触发价格 (条件单) */
    triggerPx?: string;
  };
  /** 订单状态 → 订单状态: 实时更新 */
  status: OrderUpdateStatus;
  /** 状态更新时间 */
  statusTimestamp: number;
}

/** 订单更新推送 */
export interface OrderUpdatesMessage {
  channel: 'orderUpdates';
  data: OrderUpdateData[];
}

/** 通知类型 */
export type NotificationType =
  | 'fill'
  | 'liquidation'
  | 'funding'
  | 'deposit'
  | 'withdraw'
  | 'transfer';

/** 通知数据 */
export interface NotificationData {
  /** 通知类型 */
  notification: NotificationType;
  /** 通知详情 */
  data: unknown;
}

/** 通知推送 */
export interface NotificationMessage {
  channel: 'notification';
  data: NotificationData;
}

/** 活跃资产上下文数据 */
export interface ActiveAssetCtxData {
  /** 交易对名称 */
  coin: string;
  /** 实时上下文 */
  ctx: {
    /** 资金费率 */
    funding: string;
    /** 未平仓量 */
    openInterest: string;
    /** 前日价格 */
    prevDayPx: string;
    /** 24h成交额 */
    dayNtlVlm: string;
    /** 溢价率 */
    premium: string;
    /** 预言机价格 */
    oraclePx: string;
    /** 标记价格 */
    markPx: string;
    /** 中间价 */
    midPx: string;
  };
}

/** 活跃资产上下文推送 */
export interface ActiveAssetCtxMessage {
  channel: 'activeAssetCtx';
  data: ActiveAssetCtxData;
}

/** 活跃现货资产上下文数据 */
export interface ActiveSpotAssetCtxData {
  /** 交易对名称 */
  coin: string;
  /** 实时上下文 */
  ctx: {
    /** 前日价格 */
    prevDayPx: string;
    /** 24h成交额 */
    dayNtlVlm: string;
    /** 标记价格 */
    markPx: string;
    /** 中间价 */
    midPx: string;
    /** 流通供应量 */
    circulatingSupply: string;
  };
}

/** 活跃现货资产上下文推送 */
export interface ActiveSpotAssetCtxMessage {
  channel: 'activeSpotAssetCtx';
  data: ActiveSpotAssetCtxData;
}

// ============================================================
// WebData2 组合数据类型
// ============================================================

/** WebData2 推送数据 */
export interface WebData2Data {
  /** 账户清算状态 */
  clearinghouseState?: {
    marginSummary: {
      accountValue: string;
      totalNtlPos: string;
      totalRawUsd: string;
      totalMarginUsed: string;
    };
    crossMarginSummary: {
      accountValue: string;
      totalNtlPos: string;
      totalRawUsd: string;
      totalMarginUsed: string;
    };
    withdrawable: string;
    assetPositions: Array<{
      type: 'oneWay';
      position: {
        coin: string;
        szi: string;
        entryPx: string;
        leverage: { type: 'cross' | 'isolated'; value: number };
        positionValue: string;
        liquidationPx: string | null;
        unrealizedPnl: string;
        returnOnEquity: string;
        marginUsed: string;
      };
    }>;
    time: number;
  };
  /** 现货账户状态 */
  spotState?: {
    balances: Array<{
      coin: string;
      token: number;
      hold: string;
      total: string;
      entryNtl: string;
    }>;
  };
  /** 挂单列表 */
  openOrders?: Array<{
    coin: string;
    oid: number;
    cloid?: string;
    side: 'B' | 'A';
    limitPx: string;
    sz: string;
    origSz: string;
    timestamp: number;
    orderType: string;
    tif: string;
    reduceOnly: boolean;
    triggerCondition?: string;
    triggerPx?: string;
  }>;
  /** 最近成交 */
  fills?: Fill[];
  /** 服务器时间 */
  serverTime?: number;
}

/** WebData2 推送 */
export interface WebData2Message {
  channel: 'webData2';
  data: WebData2Data;
}

// ============================================================
// 服务端消息联合类型
// ============================================================

/** 服务端推送消息 */
export type ServerMessage =
  | SubscriptionResponse
  | PostResponse
  | ErrorMessage
  | PongMessage
  | AllMidsMessage
  | L2BookMessage
  | TradesMessage
  | CandleMessage
  | UserFillsMessage
  | UserFundingsMessage
  | OrderUpdatesMessage
  | NotificationMessage
  | ActiveAssetCtxMessage
  | ActiveSpotAssetCtxMessage
  | WebData2Message;

// ============================================================
// 心跳配置
// ============================================================

/** 心跳配置 */
export interface HeartbeatConfig {
  /** 心跳间隔 (毫秒), 推荐 15000 (15秒) */
  interval: number;
  /** 超时时间 (毫秒), 推荐 30000 (30秒) */
  timeout: number;
}

/** 默认心跳配置 */
export const DEFAULT_HEARTBEAT: HeartbeatConfig = {
  interval: 15000, // 15秒发送一次 ping
  timeout: 30000, // 30秒无响应视为断开
};

/** 发送 Ping 消息 */
export const PING_MESSAGE = { method: 'ping' };
