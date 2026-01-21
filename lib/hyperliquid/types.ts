/**
 * HyperLiquid API 类型定义
 */

// ==================== 基础类型 ====================

export type Side = 'A' | 'B'; // A = Ask (Sell), B = Bid (Buy)
export type OrderSide = 'buy' | 'sell';
export type TIF = 'Gtc' | 'Ioc' | 'Alo';
export type OrderType = 'limit' | 'market';
export type MarginMode = 'cross' | 'isolated';

// ==================== 市场元数据 ====================

export interface PerpMeta {
  name: string;
  szDecimals: number; // 数量精度
  maxLeverage: number;
  onlyIsolated?: boolean;
}

export interface SpotMeta {
  tokens: SpotToken[];
  universe: SpotPair[];
}

export interface SpotToken {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
}

export interface SpotPair {
  name: string;
  tokens: [number, number]; // [base token index, quote token index]
  index: number;
  isCanonical: boolean;
}

export interface AssetCtx {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium?: string;
  oraclePx: string;
  markPx: string;
  midPx?: string;
  impactPxs?: [string, string]; // [bid impact, ask impact]
}

export interface MetaAndAssetCtxs {
  universe: PerpMeta[];
  assetCtxs: AssetCtx[];
}

// ==================== 订单簿 ====================

export interface L2BookLevel {
  px: string; // 价格
  sz: string; // 数量
  n: number;  // 订单数量
}

export interface L2Book {
  coin: string;
  levels: [L2BookLevel[], L2BookLevel[]]; // [bids, asks]
  time: number;
}

// ==================== K线数据 ====================

export interface Candle {
  t: number;  // 开盘时间 (毫秒)
  T: number;  // 收盘时间 (毫秒)
  s: string;  // 交易对
  i: string;  // 时间间隔
  o: string;  // 开盘价
  c: string;  // 收盘价
  h: string;  // 最高价
  l: string;  // 最低价
  v: string;  // 成交量
  n: number;  // 成交笔数
}

export interface CandleSnapshot {
  coin: string;
  interval: string;
  candles: Candle[];
}

// ==================== 交易记录 ====================

export interface Trade {
  coin: string;
  side: Side;
  px: string;
  sz: string;
  time: number;
  hash: string;
  tid: number; // trade id
}

export interface RecentTrades {
  coin: string;
  trades: Trade[];
}

// ==================== 用户账户状态 ====================

export interface Position {
  coin: string;
  szi: string;          // 持仓数量 (有符号, 正=多, 负=空)
  leverage: {
    type: 'cross' | 'isolated';
    value: number;
    rawUsd?: string;    // 逐仓保证金金额
  };
  entryPx: string;      // 入场价格
  positionValue: string; // 持仓价值
  unrealizedPnl: string; // 未实现盈亏
  returnOnEquity: string; // 收益率
  liquidationPx: string | null; // 强平价格
  marginUsed: string;    // 已用保证金
  maxLeverage: number;   // 最大杠杆
  cumFunding: {
    allTime: string;
    sinceOpen: string;
    sinceChange: string;
  };
}

export interface MarginSummary {
  accountValue: string;     // 账户净值
  totalNtlPos: string;      // 总持仓名义价值
  totalRawUsd: string;      // 总保证金
  totalMarginUsed: string;  // 已用保证金
  withdrawable: string;     // 可提取金额
}

export interface ClearinghouseState {
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  crossMaintenanceMarginUsed: string;
  assetPositions: {
    position: Position;
    type: 'oneWay';
  }[];
  time: number;
}

// ==================== 现货账户状态 ====================

export interface SpotBalance {
  coin: string;
  hold: string;    // 冻结数量
  total: string;   // 总数量
  entryNtl: string; // 入场名义价值
  token: number;    // token index
}

export interface SpotClearinghouseState {
  balances: SpotBalance[];
}

// ==================== 订单 ====================

export interface Order {
  coin: string;
  side: Side;
  limitPx: string;
  sz: string;
  oid: number;
  timestamp: number;
  origSz: string;
  cloid?: string;
  triggerCondition?: string;
  isTrigger?: boolean;
  triggerPx?: string;
  children?: Order[];
  isPositionTpsl?: boolean;
  reduceOnly?: boolean;
  orderType?: string;
  tif?: string;
}

export interface OpenOrders {
  coin: string;
  orders: Order[];
}

export interface OrderStatus {
  resting?: {
    oid: number;
  };
  filled?: {
    oid: number;
    totalSz: string;
    avgPx: string;
  };
  error?: string;
  status?: 'open' | 'filled' | 'canceled' | 'triggered' | 'rejected' | 'marginCanceled';
}

// 历史订单（包含订单和状态）
export interface HistoricalOrder {
  order: Order;
  status: 'open' | 'filled' | 'canceled' | 'triggered' | 'rejected' | 'marginCanceled';
  statusTimestamp: number;
}

// ==================== 成交记录 ====================

export interface UserFill {
  coin: string;
  px: string;
  sz: string;
  side: Side;
  time: number;
  startPosition: string;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  tid: number;
  feeToken: string;
  builderFee?: string;
  liquidation?: boolean;
}

// ==================== 资金费率 ====================

export interface FundingHistory {
  coin: string;
  fundingRate: string;
  premium: string;
  time: number;
}

// ==================== 订单请求 ====================

export interface OrderRequest {
  a: number;        // asset index
  b: boolean;       // true = buy, false = sell
  p: string;        // price
  s: string;        // size
  r: boolean;       // reduce only
  t: OrderTrigger;  // order type/trigger
  c?: string;       // client order id (cloid)
}

export interface OrderTrigger {
  limit?: {
    tif: TIF;
  };
  trigger?: {
    isMarket: boolean;
    triggerPx: string;
    tpsl: 'tp' | 'sl';
  };
}

export interface OrderWire {
  a: number;
  b: boolean;
  p: string;
  s: string;
  r: boolean;
  t: OrderTrigger;
  c?: string;
  [key: string]: unknown;
}

export interface PlaceOrderAction {
  type: 'order';
  orders: OrderWire[];
  grouping: 'na' | 'normalTpsl' | 'positionTpsl';
  builder?: {
    b: string;  // builder address
    f: number;  // fee in tenths of a basis point
  };
  [key: string]: unknown;
}

export interface CancelOrderAction {
  type: 'cancel';
  cancels: Array<{
    a: number;  // asset index
    o: number;  // order id
  }>;
  [key: string]: unknown;
}

export interface CancelByCloidAction {
  type: 'cancelByCloid';
  cancels: Array<{
    asset: number;
    cloid: string;
  }>;
  [key: string]: unknown;
}

export interface ModifyOrderAction {
  type: 'modify';
  oid: number;
  order: OrderWire;
  [key: string]: unknown;
}

export interface BatchModifyAction {
  type: 'batchModify';
  modifies: Array<{
    oid: number;
    order: OrderWire;
  }>;
  [key: string]: unknown;
}

// ==================== Builder Fee ====================

export interface ApproveBuilderFeeAction {
  type: 'approveBuilderFee';
  hyperliquidChain: 'Mainnet' | 'Testnet';
  signatureChainId: string;
  maxFeeRate: string;
  builder: string;
  nonce: number;
  [key: string]: unknown;
}

export interface MaxBuilderFee {
  [builder: string]: number; // builder address -> max fee rate approved
}

// ==================== 杠杆设置 ====================

export interface UpdateLeverageAction {
  type: 'updateLeverage';
  asset: number;
  isCross: boolean;
  leverage: number;
  [key: string]: unknown;
}

export interface UpdateIsolatedMarginAction {
  type: 'updateIsolatedMargin';
  asset: number;
  isBuy: boolean;
  ntli: number; // notional to add (positive) or remove (negative)
  [key: string]: unknown;
}

// ==================== WebSocket 消息 ====================

export interface WsSubscription {
  type: string;
  [key: string]: unknown;
}

export interface WsL2BookSubscription extends WsSubscription {
  type: 'l2Book';
  coin: string;
}

export interface WsTradesSubscription extends WsSubscription {
  type: 'trades';
  coin: string;
}

export interface WsCandleSubscription extends WsSubscription {
  type: 'candle';
  coin: string;
  interval: string;
}

export interface WsAllMidsSubscription extends WsSubscription {
  type: 'allMids';
}

export interface WsUserEventsSubscription extends WsSubscription {
  type: 'userEvents';
  user: string;
}

export interface WsOrderUpdatesSubscription extends WsSubscription {
  type: 'orderUpdates';
  user: string;
}

export interface WsUserFillsSubscription extends WsSubscription {
  type: 'userFills';
  user: string;
}

export interface WsUserFundingsSubscription extends WsSubscription {
  type: 'userFundings';
  user: string;
}

export interface WsMessage {
  channel: string;
  data: unknown;
}

export interface WsL2BookData {
  coin: string;
  levels: [L2BookLevel[], L2BookLevel[]];
  time: number;
}

export interface WsTradeData {
  coin: string;
  side: Side;
  px: string;
  sz: string;
  time: number;
  hash: string;
  tid: number;
}

export type WsCandleData = Candle;

export interface WsAllMidsData {
  mids: Record<string, string>;
}

export type WsUserFillData = UserFill;

export interface WsOrderUpdateData {
  order: Order;
  status: string;
  statusTimestamp: number;
}

// ==================== API 响应 ====================

export interface InfoResponse<T> {
  data: T;
}

export interface ExchangeResponse {
  status: 'ok' | 'err';
  response?: {
    type: string;
    data?: {
      statuses: OrderStatus[];
    };
  };
}

// ==================== 辅助类型 ====================

export interface AssetInfo {
  name: string;
  assetId: number;
  szDecimals: number;
  maxLeverage: number;
  markPx: string;
  midPx: string;
  oraclePx: string;
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium?: string;
}

export interface FormattedPosition {
  coin: string;
  size: number;
  side: 'long' | 'short';
  leverage: number;
  marginMode: MarginMode;
  entryPrice: number;
  markPrice: number;
  liquidationPrice: number | null;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  marginUsed: number;
  notionalValue: number;
}

export interface FormattedOrder {
  coin: string;
  oid: number;
  cloid?: string;
  side: OrderSide;
  type: string;
  price: number;
  size: number;
  filled: number;
  remaining: number;
  reduceOnly: boolean;
  timestamp: number;
  status: string;
  triggerPrice?: number;
  tpsl?: 'tp' | 'sl';
}

// ==================== TWAP 订单 ====================

export interface TwapOrderParams {
  coin: string;
  isBuy: boolean;
  sz: string;            // 总数量
  reduceOnly: boolean;
  minutes: number;       // 执行时长（分钟）
  randomize: boolean;    // 是否随机化执行间隔
}

export interface TwapOrderWire {
  a: number;              // asset index
  b: boolean;             // true = buy, false = sell
  s: string;              // size
  r: boolean;             // reduce only
  m: number;              // duration in minutes
  t: boolean;             // randomize (true = randomize intervals)
}

export interface PlaceTwapOrderAction {
  type: 'twapOrder';
  twap: TwapOrderWire;
  [key: string]: unknown;
}

export interface CancelTwapOrderAction {
  type: 'twapCancel';
  a: number;              // asset index
  t: number;              // twap id
  [key: string]: unknown;
}

export interface TwapOrder {
  twapId: number;
  coin: string;
  side: Side;
  sz: string;
  filledSz: string;
  minutes: number;
  randomize: boolean;
  reduceOnly: boolean;
  startTime: number;
  state: {
    running?: {
      twapId: number;
    };
    terminated?: {
      reason: string;
    };
  };
}

export interface TwapOrderResponse {
  status: 'ok' | 'err';
  response?: {
    type: 'twapOrder';
    data: {
      status: {
        running?: {
          twapId: number;
        };
        error?: string;
      };
    };
  };
}

export interface TwapCancelResponse {
  status: 'ok' | 'err';
  response?: {
    type: 'twapCancel';
    data: {
      status: 'success' | string;
    };
  };
}

export interface FormattedTwapOrder {
  twapId: number;
  coin: string;
  side: OrderSide;
  totalSize: number;
  filledSize: number;
  remainingSize: number;
  progress: number;       // 0-100 百分比
  durationMinutes: number;
  randomize: boolean;
  reduceOnly: boolean;
  startTime: number;
  estimatedEndTime: number;
  status: 'running' | 'terminated' | 'completed';
  terminationReason?: string;
}

// ==================== Trailing Stop 订单 (前端管理) ====================

export interface TrailingStopOrder {
  id: string;                    // 唯一标识
  coin: string;
  side: OrderSide;               // 触发方向: buy (做多止损/做空止盈), sell (做多止盈/做空止损)
  size: string;                  // 数量
  trailValue: string;            // 回撤值 (可以是百分比或固定价差)
  trailType: 'percent' | 'price'; // 回撤类型
  triggerPrice: string | null;   // 当前触发价格 (动态更新)
  highestPrice: string | null;   // 追踪的最高价 (sell方向)
  lowestPrice: string | null;    // 追踪的最低价 (buy方向)
  createdAt: number;
  status: 'active' | 'triggered' | 'cancelled';
  reduceOnly: boolean;
}
