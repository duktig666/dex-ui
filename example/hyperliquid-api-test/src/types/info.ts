// ============================================================
// HyperLiquid /info API 类型定义
// ============================================================

// ============================================================
// 请求类型
// ============================================================

/** /info API 请求类型联合 */
export type InfoRequest =
  | MetaRequest
  | MetaAndAssetCtxsRequest
  | L2BookRequest
  | CandleSnapshotRequest
  | RecentTradesRequest
  | AllMidsRequest
  | ClearinghouseStateRequest
  | OpenOrdersRequest
  | FrontendOpenOrdersRequest
  | SpotMetaRequest
  | SpotMetaAndAssetCtxsRequest
  | SpotClearinghouseStateRequest
  | TokenDetailsRequest
  | HistoricalOrdersRequest
  | UserFillsRequest
  | UserFillsByTimeRequest
  | UserFundingRequest
  | UserNonFundingLedgerUpdatesRequest
  | MaxBuilderFeeRequest
  | UserRateLimitRequest
  | OrderStatusRequest
  | ReferralRequest
  | SubAccountsRequest
  | VaultDetailsRequest
  | UserVaultEquitiesRequest
  | PredictedFundingsRequest
  | FundingHistoryRequest;

/** 永续元数据请求 */
export interface MetaRequest {
  type: 'meta';
}

/** 永续元数据 + 实时上下文请求 */
export interface MetaAndAssetCtxsRequest {
  type: 'metaAndAssetCtxs';
}

/** 订单簿请求 */
export interface L2BookRequest {
  type: 'l2Book';
  coin: string;
  nSigFigs?: number;
  mantissa?: number;
}

/** K线快照请求 */
export interface CandleSnapshotRequest {
  type: 'candleSnapshot';
  req: {
    coin: string;
    interval: string;
    startTime: number;
    endTime: number;
  };
}

/** 最近成交请求 */
export interface RecentTradesRequest {
  type: 'recentTrades';
  coin: string;
}

/** 所有中间价请求 */
export interface AllMidsRequest {
  type: 'allMids';
}

/** 用户永续账户状态请求 */
export interface ClearinghouseStateRequest {
  type: 'clearinghouseState';
  user: string;
}

/** 用户当前挂单请求 */
export interface OpenOrdersRequest {
  type: 'openOrders';
  user: string;
}

/** 用户前端挂单详情请求 */
export interface FrontendOpenOrdersRequest {
  type: 'frontendOpenOrders';
  user: string;
}

/** 现货元数据请求 */
export interface SpotMetaRequest {
  type: 'spotMeta';
}

/** 现货元数据 + 实时上下文请求 */
export interface SpotMetaAndAssetCtxsRequest {
  type: 'spotMetaAndAssetCtxs';
}

/** 用户现货账户状态请求 */
export interface SpotClearinghouseStateRequest {
  type: 'spotClearinghouseState';
  user: string;
}

/** 代币详情请求 */
export interface TokenDetailsRequest {
  type: 'tokenDetails';
  tokenId: string;
}

/** 历史订单请求 */
export interface HistoricalOrdersRequest {
  type: 'historicalOrders';
  user: string;
}

/** 用户成交记录请求 */
export interface UserFillsRequest {
  type: 'userFills';
  user: string;
  aggregateByTime?: boolean;
}

/** 用户指定时间范围成交记录请求 */
export interface UserFillsByTimeRequest {
  type: 'userFillsByTime';
  user: string;
  startTime: number;
  endTime?: number;
  aggregateByTime?: boolean;
}

/** 用户资金费率历史请求 */
export interface UserFundingRequest {
  type: 'userFunding';
  user: string;
  startTime?: number;
  endTime?: number;
}

/** 用户非资金费率账本更新请求 */
export interface UserNonFundingLedgerUpdatesRequest {
  type: 'userNonFundingLedgerUpdates';
  user: string;
  startTime?: number;
  endTime?: number;
}

/** Builder 授权状态请求 */
export interface MaxBuilderFeeRequest {
  type: 'maxBuilderFee';
  user: string;
  builder: string;
}

/** 用户频率限制请求 */
export interface UserRateLimitRequest {
  type: 'userRateLimit';
  user: string;
}

/** 订单状态请求 */
export interface OrderStatusRequest {
  type: 'orderStatus';
  user: string;
  oid: number;
}

/** 推荐状态请求 */
export interface ReferralRequest {
  type: 'referral';
  user: string;
}

/** 子账户列表请求 */
export interface SubAccountsRequest {
  type: 'subAccounts';
  user: string;
}

/** Vault 详情请求 */
export interface VaultDetailsRequest {
  type: 'vaultDetails';
  vaultAddress: string;
}

/** 用户 Vault 权益请求 */
export interface UserVaultEquitiesRequest {
  type: 'userVaultEquities';
  user: string;
}

/** 预测资金费率请求 */
export interface PredictedFundingsRequest {
  type: 'predictedFundings';
}

/** 历史资金费率请求 */
export interface FundingHistoryRequest {
  type: 'fundingHistory';
  coin: string;
  startTime: number;
  endTime?: number;
}

// ============================================================
// 响应类型 - 永续合约
// ============================================================

/** 永续合约资产 */
export interface PerpAsset {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated?: boolean;
}

/** 永续合约实时上下文 */
export interface AssetCtx {
  funding: string;
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string;
  impactPxs?: [string, string];
}

/** meta 响应 */
export interface MetaResponse {
  universe: PerpAsset[];
}

/** metaAndAssetCtxs 响应 */
export type MetaAndAssetCtxsResponse = [{ universe: PerpAsset[] }, AssetCtx[]];

// ============================================================
// 响应类型 - 订单簿
// ============================================================

/** 订单簿价格档位 */
export interface L2BookLevel {
  px: string;
  sz: string;
  n: number;
}

/** 订单簿响应 */
export interface L2BookResponse {
  coin: string;
  time: number;
  levels: [L2BookLevel[], L2BookLevel[]];
}

// ============================================================
// 响应类型 - K线
// ============================================================

/** K线数据 */
export interface Candle {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}

/** candleSnapshot 响应 */
export type CandleSnapshotResponse = Candle[];

// ============================================================
// 响应类型 - 成交
// ============================================================

/** 成交记录 */
export interface Trade {
  coin: string;
  side: 'B' | 'A';
  px: string;
  sz: string;
  time: number;
  hash: string;
  tid: number;
  users: [string, string];
}

/** recentTrades 响应 */
export type RecentTradesResponse = Trade[];

/** allMids 响应 */
export type AllMidsResponse = Record<string, string>;

// ============================================================
// 响应类型 - 用户账户
// ============================================================

/** 账户保证金概要 */
export interface MarginSummary {
  accountValue: string;
  totalNtlPos: string;
  totalRawUsd: string;
  totalMarginUsed: string;
}

/** 杠杆配置 */
export interface Leverage {
  type: 'cross' | 'isolated';
  value: number;
  rawUsd?: string;
}

/** 累计资金费 */
export interface CumFunding {
  allTime: string;
  sinceOpen: string;
  sinceChange: string;
}

/** 单个持仓信息 */
export interface Position {
  coin: string;
  szi: string;
  entryPx: string;
  leverage: Leverage;
  positionValue: string;
  liquidationPx: string | null;
  unrealizedPnl: string;
  returnOnEquity: string;
  marginUsed: string;
  maxLeverage: number;
  cumFunding: CumFunding;
}

/** 资产持仓包装 */
export interface AssetPosition {
  type: 'oneWay';
  position: Position;
}

/** clearinghouseState 响应 */
export interface ClearinghouseStateResponse {
  marginSummary: MarginSummary;
  crossMarginSummary: MarginSummary;
  withdrawable: string;
  assetPositions: AssetPosition[];
  time: number;
}

// ============================================================
// 响应类型 - 订单
// ============================================================

/** 基础挂单信息 */
export interface OpenOrder {
  coin: string;
  oid: number;
  cloid?: string;
  side: 'B' | 'A';
  limitPx: string;
  sz: string;
  origSz: string;
  timestamp: number;
}

/** openOrders 响应 */
export type OpenOrdersResponse = OpenOrder[];

/** 订单类型 */
export type OrderType =
  | 'Limit'
  | 'Stop Market'
  | 'Stop Limit'
  | 'Take Profit Market'
  | 'Take Profit Limit';

/** 有效期类型 */
export type TimeInForce = 'Gtc' | 'Ioc' | 'Alo';

/** 触发条件 */
export type TriggerCondition = 'gt' | 'lt';

/** 前端挂单详情 */
export interface FrontendOpenOrder extends OpenOrder {
  orderType: OrderType;
  tif: TimeInForce;
  reduceOnly: boolean;
  triggerPx?: string;
  triggerCondition?: TriggerCondition;
  children?: FrontendOpenOrder[];
}

/** frontendOpenOrders 响应 */
export type FrontendOpenOrdersResponse = FrontendOpenOrder[];

// ============================================================
// 响应类型 - 现货
// ============================================================

/** 现货代币 */
export interface SpotToken {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  evmContract?: string | null;
  fullName?: string | null;
}

/** 现货交易对 */
export interface SpotMarket {
  name: string;
  tokens: [number, number];
  index: number;
  isCanonical: boolean;
}

/** spotMeta 响应 */
export interface SpotMetaResponse {
  tokens: SpotToken[];
  universe: SpotMarket[];
}

/** 现货资产实时上下文 */
export interface SpotAssetCtx {
  prevDayPx: string;
  dayNtlVlm: string;
  markPx: string;
  midPx: string;
  circulatingSupply: string;
}

/** spotMetaAndAssetCtxs 响应 */
export type SpotMetaAndAssetCtxsResponse = [SpotMetaResponse, SpotAssetCtx[]];

/** 现货余额 */
export interface SpotBalance {
  coin: string;
  token: number;
  hold: string;
  total: string;
  entryNtl: string;
}

/** spotClearinghouseState 响应 */
export interface SpotClearinghouseStateResponse {
  balances: SpotBalance[];
}

/** tokenDetails 响应 */
export interface TokenDetailsResponse {
  name: string;
  maxSupply: string;
  totalSupply: string;
  circulatingSupply: string;
  szDecimals: number;
  weiDecimals: number;
  midPx: string;
  markPx: string;
  prevDayPx: string;
  genesis?: unknown;
  deployer?: string | null;
  deployGas?: string | null;
  deployTime?: number | null;
  seededUsdc?: string | null;
}

// ============================================================
// 响应类型 - 历史记录
// ============================================================

/** 订单状态 */
export type OrderStatusType = 'filled' | 'canceled' | 'rejected';

/** 历史订单 */
export interface HistoricalOrder {
  coin: string;
  oid: number;
  cloid?: string;
  side: 'B' | 'A';
  limitPx: string;
  sz: string;
  origSz: string;
  timestamp: number;
  orderType: OrderType;
  tif: TimeInForce;
  status: OrderStatusType;
  closedPnl: string;
}

/** historicalOrders 响应 */
export type HistoricalOrdersResponse = HistoricalOrder[];

/** 开平方向 */
export type FillDir = 'Open Long' | 'Open Short' | 'Close Long' | 'Close Short';

/** 成交记录 */
export interface Fill {
  coin: string;
  px: string;
  sz: string;
  side: 'B' | 'A';
  time: number;
  dir: FillDir;
  closedPnl: string;
  fee: string;
  feeToken: string;
  oid: number;
  tid: number;
  crossed: boolean;
  hash: string;
  startPosition: string;
  liquidation?: boolean;
}

/** userFills / userFillsByTime 响应 */
export type UserFillsResponse = Fill[];

/** 资金费率记录 */
export interface FundingRecord {
  time: number;
  coin: string;
  usdc: string;
  szi: string;
  fundingRate: string;
  nSamples: number;
}

/** userFunding 响应 */
export type UserFundingResponse = FundingRecord[];

/** 账本更新类型 */
export type LedgerUpdateType =
  | 'deposit'
  | 'withdraw'
  | 'internalTransfer'
  | 'liquidation'
  | 'accountClassTransfer'
  | 'spotTransfer';

/** 账本更新变化 */
export interface LedgerDelta {
  type: LedgerUpdateType;
  usdc: string;
  fee?: string;
  nonce?: number;
}

/** 账本更新记录 */
export interface LedgerUpdate {
  time: number;
  delta: LedgerDelta;
}

/** userNonFundingLedgerUpdates 响应 */
export type UserNonFundingLedgerUpdatesResponse = LedgerUpdate[];

// ============================================================
// 响应类型 - Builder / 用户信息
// ============================================================

/** maxBuilderFee 响应 */
export type MaxBuilderFeeResponse = number;

/** userRateLimit 响应 */
export interface UserRateLimitResponse {
  cumVlm: string;
  nRequestsUsed: number;
  nRequestsCap: number;
  nRequestsSurplus: number;
}

/** orderStatus 响应状态 */
export type OrderStatusValue = 'open' | 'filled' | 'canceled' | 'unknownOid';

/** orderStatus 响应 */
export interface OrderStatusResponse {
  status: OrderStatusValue;
  order?: OpenOrder;
}

/** 推荐人状态 */
export interface ReferrerState {
  code: string;
  cumReferrerRewards: string;
  unclaimedReferrerRewards: string;
  nReferred: number;
  cumReferredVlm: string;
}

/** referral 响应 */
export interface ReferralResponse {
  referredBy: string | null;
  cumVlm: string;
  unclaimedRewards: string;
  claimedRewards: string;
  builderRewards: string;
  referrerState?: ReferrerState;
  rewardHistory: unknown[];
}

/** 子账户 */
export interface SubAccount {
  subAccountUser: string;
  name: string;
  master: string;
  clearinghouseState?: ClearinghouseStateResponse;
  spotState?: SpotClearinghouseStateResponse;
}

/** subAccounts 响应 */
export type SubAccountsResponse = SubAccount[] | null;

// ============================================================
// 响应类型 - Vault
// ============================================================

/** Vault 详情 */
export interface VaultDetails {
  name: string;
  vaultAddress: string;
  leader: string;
  description?: string;
  portfolio: unknown;
  maxDistributable: string;
  apr: number;
  pnlHistory: unknown[];
  followerState?: unknown;
  isClosed: boolean;
  relationship?: unknown;
}

/** vaultDetails 响应 */
export type VaultDetailsResponse = VaultDetails | null;

/** Vault 权益 */
export interface VaultEquity {
  vaultAddress: string;
  equity: string;
  vaultName: string;
  initialEquity: string;
  allTimePnl: string;
  lockupUntil?: number;
}

/** userVaultEquities 响应 */
export type UserVaultEquitiesResponse = VaultEquity[];

// ============================================================
// 响应类型 - 资金费率
// ============================================================

/** 预测资金费率 */
export interface PredictedFunding {
  predictedFunding: string;
  time: number;
}

/** predictedFundings 响应 */
export type PredictedFundingsResponse = PredictedFunding[];

/** 历史资金费率条目 */
export interface FundingHistoryEntry {
  coin: string;
  fundingRate: string;
  premium: string;
  time: number;
}

/** fundingHistory 响应 */
export type FundingHistoryResponse = FundingHistoryEntry[];
