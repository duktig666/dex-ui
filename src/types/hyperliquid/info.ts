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
  | SpotDeployStateRequest
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
  /** 交易对名称 (永续: "BTC", 现货: "PURR/USDC") */
  coin: string;
  /** 价格聚合精度 (2-5, 可选) */
  nSigFigs?: number;
  /** 配合 nSigFigs 使用的尾数 */
  mantissa?: number;
}

/** K线快照请求 */
export interface CandleSnapshotRequest {
  type: 'candleSnapshot';
  req: {
    /** 交易对名称 */
    coin: string;
    /** K线周期: "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M" */
    interval: string;
    /** 开始时间 (毫秒时间戳) */
    startTime: number;
    /** 结束时间 (毫秒时间戳) */
    endTime: number;
  };
}

/** 最近成交请求 */
export interface RecentTradesRequest {
  type: 'recentTrades';
  /** 交易对名称 */
  coin: string;
}

/** 所有中间价请求 */
export interface AllMidsRequest {
  type: 'allMids';
}

/** 用户永续账户状态请求 */
export interface ClearinghouseStateRequest {
  type: 'clearinghouseState';
  /** 用户钱包地址 (42字符 0x开头) */
  user: string;
}

/** 用户当前挂单请求 */
export interface OpenOrdersRequest {
  type: 'openOrders';
  /** 用户钱包地址 */
  user: string;
}

/** 用户前端挂单详情请求 */
export interface FrontendOpenOrdersRequest {
  type: 'frontendOpenOrders';
  /** 用户钱包地址 */
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
  /** 用户钱包地址 */
  user: string;
}

/** 代币详情请求 */
export interface TokenDetailsRequest {
  type: 'tokenDetails';
  /** 代币ID (32字符 0x，从 spotMeta.tokens[i].tokenId 获取) */
  tokenId: string;
}

/** 现货部署状态请求 */
export interface SpotDeployStateRequest {
  type: 'spotDeployState';
  /** 用户钱包地址 */
  user: string;
}

/** 历史订单请求 */
export interface HistoricalOrdersRequest {
  type: 'historicalOrders';
  /** 用户钱包地址 */
  user: string;
}

/** 用户成交记录请求 */
export interface UserFillsRequest {
  type: 'userFills';
  /** 用户钱包地址 */
  user: string;
  /** 是否按时间聚合 (可选) */
  aggregateByTime?: boolean;
}

/** 用户指定时间范围成交记录请求 */
export interface UserFillsByTimeRequest {
  type: 'userFillsByTime';
  /** 用户钱包地址 */
  user: string;
  /** 开始时间 (毫秒时间戳) */
  startTime: number;
  /** 结束时间 (毫秒时间戳, 可选) */
  endTime?: number;
  /** 是否按时间聚合 (可选) */
  aggregateByTime?: boolean;
}

/** 用户资金费率历史请求 */
export interface UserFundingRequest {
  type: 'userFunding';
  /** 用户钱包地址 */
  user: string;
  /** 开始时间 (可选) */
  startTime?: number;
  /** 结束时间 (可选) */
  endTime?: number;
}

/** 用户非资金费率账本更新请求 */
export interface UserNonFundingLedgerUpdatesRequest {
  type: 'userNonFundingLedgerUpdates';
  /** 用户钱包地址 */
  user: string;
  /** 开始时间 (可选) */
  startTime?: number;
  /** 结束时间 (可选) */
  endTime?: number;
}

/** Builder 授权状态请求 */
export interface MaxBuilderFeeRequest {
  type: 'maxBuilderFee';
  /** 用户钱包地址 */
  user: string;
  /** Builder 钱包地址 */
  builder: string;
}

/** 用户频率限制请求 */
export interface UserRateLimitRequest {
  type: 'userRateLimit';
  /** 用户钱包地址 */
  user: string;
}

/** 订单状态请求 */
export interface OrderStatusRequest {
  type: 'orderStatus';
  /** 用户钱包地址 */
  user: string;
  /** 订单ID */
  oid: number;
}

/** 推荐状态请求 */
export interface ReferralRequest {
  type: 'referral';
  /** 用户钱包地址 */
  user: string;
}

/** 子账户列表请求 */
export interface SubAccountsRequest {
  type: 'subAccounts';
  /** 主账户钱包地址 */
  user: string;
}

/** Vault 详情请求 */
export interface VaultDetailsRequest {
  type: 'vaultDetails';
  /** Vault 合约地址 */
  vaultAddress: string;
}

/** 用户 Vault 权益请求 */
export interface UserVaultEquitiesRequest {
  type: 'userVaultEquities';
  /** 用户钱包地址 */
  user: string;
}

/** 预测资金费率请求 */
export interface PredictedFundingsRequest {
  type: 'predictedFundings';
}

/** 历史资金费率请求 */
export interface FundingHistoryRequest {
  type: 'fundingHistory';
  /** 交易对名称 */
  coin: string;
  /** 开始时间 (毫秒时间戳) */
  startTime: number;
  /** 结束时间 (可选) */
  endTime?: number;
}

// ============================================================
// 响应类型 - 永续合约
// ============================================================

/** 永续合约资产 */
export interface PerpAsset {
  /** 交易对名称，如 "BTC", "ETH" → 交易对选择列表 */
  name: string;
  /** 数量精度小数位 → 下单: 数量输入精度 */
  szDecimals: number;
  /** 最大杠杆倍数 → 杠杆选择器: 最大值 */
  maxLeverage: number;
  /** 是否仅支持逐仓模式 → 杠杆模式切换: 禁用全仓 */
  onlyIsolated?: boolean;
}

/** 永续合约实时上下文 */
export interface AssetCtx {
  /** 8小时资金费率 (小数) → 交易页头部: 资金费率 (需 ×100%) */
  funding: string;
  /** 未平仓合约量 (USD) → 市场数据: 未平仓量 */
  openInterest: string;
  /** 前日收盘价 → 计算: 24h涨跌幅 */
  prevDayPx: string;
  /** 24小时成交额 (USD) → 交易页头部: 24h成交额 */
  dayNtlVlm: string;
  /** 溢价率 (相对于预言机) → 市场数据: 溢价 */
  premium: string;
  /** 预言机价格 → 交易页头部: Oracle价格 */
  oraclePx: string;
  /** 标记价格 → 持仓列表: 计算盈亏/清算价 */
  markPx: string;
  /** 中间价 (买一卖一均价) → 交易页头部: 当前价格 */
  midPx: string;
  /** 影响价格数组 [买入影响, 卖出影响] → 下单: 滑点预估 */
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
  /** 价格 → 订单簿: 价格列 */
  px: string;
  /** 该价位总数量 → 订单簿: 数量列 */
  sz: string;
  /** 该价位订单数 → 订单簿: 订单数 (可选显示) */
  n: number;
}

/** 订单簿响应 */
export interface L2BookResponse {
  /** 交易对名称 → 订单簿: 标题 */
  coin: string;
  /** 响应时间戳 (毫秒) → 订单簿: 更新时间 */
  time: number;
  /** [买盘数组(价格降序), 卖盘数组(价格升序)] */
  levels: [L2BookLevel[], L2BookLevel[]];
}

// ============================================================
// 响应类型 - K线
// ============================================================

/** K线数据 */
export interface Candle {
  /** 开盘时间 (毫秒时间戳) → K线图: X轴时间 */
  t: number;
  /** 收盘时间 (毫秒时间戳) */
  T: number;
  /** 交易对名称 */
  s: string;
  /** K线周期 */
  i: string;
  /** 开盘价 → K线图: 开盘价 */
  o: string;
  /** 收盘价 → K线图: 收盘价 */
  c: string;
  /** 最高价 → K线图: 最高价 / 24h最高 */
  h: string;
  /** 最低价 → K线图: 最低价 / 24h最低 */
  l: string;
  /** 成交量 (base货币) → K线图: 成交量柱 */
  v: string;
  /** 成交笔数 */
  n: number;
}

/** candleSnapshot 响应 */
export type CandleSnapshotResponse = Candle[];

// ============================================================
// 响应类型 - 成交
// ============================================================

/** 成交记录 */
export interface Trade {
  /** 交易对名称 */
  coin: string;
  /** 方向: "B"=买入, "A"=卖出 → 成交列表: 方向/颜色 */
  side: 'B' | 'A';
  /** 成交价格 → 成交列表: 价格 */
  px: string;
  /** 成交数量 → 成交列表: 数量 */
  sz: string;
  /** 成交时间 (毫秒时间戳) → 成交列表: 时间 */
  time: number;
  /** 交易哈希 → 成交列表: 链接到区块浏览器 */
  hash: string;
  /** 成交ID (唯一) */
  tid: number;
  /** 参与用户数组 (2个地址) */
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
  /** 账户总价值 (USD) → Portfolio: 账户净值 */
  accountValue: string;
  /** 持仓名义价值 (USD) → Portfolio: 持仓价值 */
  totalNtlPos: string;
  /** 原始 USD 余额 */
  totalRawUsd: string;
  /** 已用保证金 → Portfolio: 已用保证金 */
  totalMarginUsed: string;
}

/** 杠杆配置 */
export interface Leverage {
  /** 模式: "cross"=全仓, "isolated"=逐仓 → 持仓列表: 模式标签 */
  type: 'cross' | 'isolated';
  /** 杠杆倍数 → 持仓列表: 杠杆 */
  value: number;
  /** 逐仓时的保证金 (仅逐仓模式) */
  rawUsd?: string;
}

/** 累计资金费 */
export interface CumFunding {
  /** 累计资金费 (历史总计) */
  allTime: string;
  /** 开仓以来资金费 */
  sinceOpen: string;
  /** 上次调整以来资金费 */
  sinceChange: string;
}

/** 单个持仓信息 */
export interface Position {
  /** 交易对名称 → 持仓列表: 币种 */
  coin: string;
  /** 持仓数量，正=多头，负=空头 → 持仓列表: 数量/方向 */
  szi: string;
  /** 开仓均价 → 持仓列表: 开仓价 */
  entryPx: string;
  /** 杠杆配置 */
  leverage: Leverage;
  /** 持仓价值 (USD) → 持仓列表: 价值 */
  positionValue: string;
  /** 预估清算价格 (null=无风险) → 持仓列表: 清算价 */
  liquidationPx: string | null;
  /** 未实现盈亏 → 持仓列表: 盈亏 */
  unrealizedPnl: string;
  /** 收益率 (ROE) → 持仓列表: 收益率% */
  returnOnEquity: string;
  /** 该持仓占用保证金 */
  marginUsed: string;
  /** 该持仓最大杠杆 */
  maxLeverage: number;
  /** 累计资金费 */
  cumFunding: CumFunding;
}

/** 资产持仓包装 */
export interface AssetPosition {
  type: 'oneWay';
  position: Position;
}

/** clearinghouseState 响应 */
export interface ClearinghouseStateResponse {
  /** 保证金概要 */
  marginSummary: MarginSummary;
  /** 全仓保证金概要 */
  crossMarginSummary: MarginSummary;
  /** 可提取金额 → Portfolio: 可用余额 → 提现页面: 最大可提取 */
  withdrawable: string;
  /** 持仓列表 */
  assetPositions: AssetPosition[];
  /** 响应时间戳 (毫秒) */
  time: number;
}

// ============================================================
// 响应类型 - 订单
// ============================================================

/** 基础挂单信息 */
export interface OpenOrder {
  /** 交易对名称 → 挂单列表: 币种 */
  coin: string;
  /** 订单ID (数字) → 挂单列表: 订单号 */
  oid: number;
  /** 客户端订单ID (可选) */
  cloid?: string;
  /** "B"=买入, "A"=卖出 → 挂单列表: 方向 */
  side: 'B' | 'A';
  /** 限价 → 挂单列表: 委托价 */
  limitPx: string;
  /** 剩余数量 → 挂单列表: 未成交量 */
  sz: string;
  /** 原始数量 → 挂单列表: 委托量 */
  origSz: string;
  /** 下单时间 (毫秒) → 挂单列表: 时间 */
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
  /** 订单类型 → 挂单列表: 订单类型 */
  orderType: OrderType;
  /** 有效期 → 挂单列表: 有效期 */
  tif: TimeInForce;
  /** 是否仅减仓 → 挂单列表: 标签 */
  reduceOnly: boolean;
  /** 触发价 (条件单) → 挂单列表: 触发价 */
  triggerPx?: string;
  /** 触发条件 */
  triggerCondition?: TriggerCondition;
  /** 子订单 (TP/SL关联订单) */
  children?: FrontendOpenOrder[];
}

/** frontendOpenOrders 响应 */
export type FrontendOpenOrdersResponse = FrontendOpenOrder[];

// ============================================================
// 响应类型 - 现货
// ============================================================

/** 现货代币 */
export interface SpotToken {
  /** 代币名称 (如 "USDC", "PURR") → 现货选择: 代币列表 */
  name: string;
  /** 数量精度小数位 → 下单: 数量精度 */
  szDecimals: number;
  /** 链上精度 (用于转换) */
  weiDecimals: number;
  /** 代币索引 (用于 assetId 计算) */
  index: number;
  /** 代币唯一标识 (32字符 0x) → tokenDetails 查询参数 */
  tokenId: string;
  /** 是否为标准代币 */
  isCanonical: boolean;
  /** EVM 合约地址 (可选) */
  evmContract?: string | null;
  /** 完整名称 (可选) */
  fullName?: string | null;
}

/** 现货交易对 */
export interface SpotMarket {
  /** 交易对名称 (如 "PURR/USDC") → 现货市场列表 */
  name: string;
  /** [baseTokenIndex, quoteTokenIndex] */
  tokens: [number, number];
  /** 交易对索引 */
  index: number;
  /** 是否为标准交易对 */
  isCanonical: boolean;
}

/** spotMeta 响应 */
export interface SpotMetaResponse {
  tokens: SpotToken[];
  universe: SpotMarket[];
}

/** 现货资产实时上下文 */
export interface SpotAssetCtx {
  /** 前日收盘价 → 计算: 24h涨跌% */
  prevDayPx: string;
  /** 24小时成交额 (USD) → 市场列表: 成交额 */
  dayNtlVlm: string;
  /** 标记价格 → 市场列表: 价格 */
  markPx: string;
  /** 中间价 → 市场列表: 当前价 */
  midPx: string;
  /** 流通供应量 → 代币详情: 流通量 */
  circulatingSupply: string;
}

/** spotMetaAndAssetCtxs 响应 */
export type SpotMetaAndAssetCtxsResponse = [SpotMetaResponse, SpotAssetCtx[]];

/** 现货余额 */
export interface SpotBalance {
  /** 代币名称 → 资产列表: 币种 */
  coin: string;
  /** 代币索引 (对应 spotMeta.tokens) */
  token: number;
  /** 冻结数量 (挂单占用) → 资产列表: 冻结 */
  hold: string;
  /** 总数量 → 资产列表: 总量 */
  total: string;
  /** 入场名义价值 (成本) → 资产列表: 成本 */
  entryNtl: string;
}

/** spotClearinghouseState 响应 */
export interface SpotClearinghouseStateResponse {
  balances: SpotBalance[];
}

/** tokenDetails 响应 */
export interface TokenDetailsResponse {
  /** 代币名称 → 代币详情: 名称 */
  name: string;
  /** 最大供应量 → 代币详情: 最大供应 */
  maxSupply: string;
  /** 总供应量 → 代币详情: 总供应 */
  totalSupply: string;
  /** 流通供应量 → 代币详情: 流通量 */
  circulatingSupply: string;
  /** 数量精度 */
  szDecimals: number;
  /** 链上精度 */
  weiDecimals: number;
  /** 中间价 → 代币详情: 当前价 */
  midPx: string;
  /** 标记价格 */
  markPx: string;
  /** 前日收盘价 */
  prevDayPx: string;
  /** 创世信息 (可选) */
  genesis?: unknown;
  /** 部署者地址 (可选) */
  deployer?: string | null;
  /** 部署 Gas (可选) */
  deployGas?: string | null;
  /** 部署时间 (可选) */
  deployTime?: number | null;
  /** 种子 USDC (可选) */
  seededUsdc?: string | null;
}

// ============================================================
// 响应类型 - 历史记录
// ============================================================

/** 订单状态 */
export type OrderStatus = 'filled' | 'canceled' | 'rejected';

/** 历史订单 */
export interface HistoricalOrder {
  /** 交易对名称 → 历史订单: 币种 */
  coin: string;
  /** 订单ID → 历史订单: 订单号 */
  oid: number;
  /** 客户端订单ID (可选) */
  cloid?: string;
  /** "B"=买入, "A"=卖出 → 历史订单: 方向 */
  side: 'B' | 'A';
  /** 委托价格 → 历史订单: 委托价 */
  limitPx: string;
  /** 成交数量 → 历史订单: 成交量 */
  sz: string;
  /** 原始委托数量 → 历史订单: 委托量 */
  origSz: string;
  /** 下单时间 (毫秒) → 历史订单: 时间 */
  timestamp: number;
  /** 订单类型 → 历史订单: 类型 */
  orderType: OrderType;
  /** 有效期 */
  tif: TimeInForce;
  /** 订单状态 → 历史订单: 状态 */
  status: OrderStatus;
  /** 平仓盈亏 (平仓单) → 历史订单: 盈亏 */
  closedPnl: string;
}

/** historicalOrders 响应 */
export type HistoricalOrdersResponse = HistoricalOrder[];

/** 开平方向 */
export type FillDir = 'Open Long' | 'Open Short' | 'Close Long' | 'Close Short';

/** 成交记录 */
export interface Fill {
  /** 交易对名称 → 成交记录: 币种 */
  coin: string;
  /** 成交价格 → 成交记录: 成交价 */
  px: string;
  /** 成交数量 → 成交记录: 数量 */
  sz: string;
  /** "B"=买入, "A"=卖出 → 成交记录: 方向 */
  side: 'B' | 'A';
  /** 成交时间 (毫秒) → 成交记录: 时间 */
  time: number;
  /** 开平方向 → 成交记录: 类型 */
  dir: FillDir;
  /** 平仓盈亏 (平仓时) → 成交记录: 盈亏 */
  closedPnl: string;
  /** 手续费 → 成交记录: 手续费 */
  fee: string;
  /** 手续费币种 (通常 "USDC") */
  feeToken: string;
  /** 关联订单ID */
  oid: number;
  /** 成交ID */
  tid: number;
  /** 是否吃单 (taker) → 成交记录: 标签 */
  crossed: boolean;
  /** 交易哈希 → 成交记录: 区块浏览器链接 */
  hash: string;
  /** 成交前持仓量 */
  startPosition: string;
  /** 是否清算单 */
  liquidation?: boolean;
}

/** userFills / userFillsByTime 响应 */
export type UserFillsResponse = Fill[];

/** 资金费率记录 */
export interface FundingRecord {
  /** 结算时间 (毫秒) → 资金费历史: 时间 */
  time: number;
  /** 交易对名称 → 资金费历史: 币种 */
  coin: string;
  /** 资金费金额 (USDC)，正=收取，负=支付 → 资金费历史: 金额 */
  usdc: string;
  /** 结算时持仓量 */
  szi: string;
  /** 资金费率 → 资金费历史: 费率 */
  fundingRate: string;
  /** 采样次数 */
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
  /** 更新类型 → 账本: 类型 */
  type: LedgerUpdateType;
  /** USDC 金额变化 → 账本: 金额 */
  usdc: string;
  /** 手续费 (提款时) */
  fee?: string;
  /** 操作 nonce */
  nonce?: number;
}

/** 账本更新记录 */
export interface LedgerUpdate {
  /** 更新时间 (毫秒) → 账本: 时间 */
  time: number;
  /** 变化详情 */
  delta: LedgerDelta;
}

/** userNonFundingLedgerUpdates 响应 */
export type UserNonFundingLedgerUpdatesResponse = LedgerUpdate[];

// ============================================================
// 响应类型 - Builder / 用户信息
// ============================================================

/** maxBuilderFee 响应 - 已授权的最大费率 (基点 bp) */
export type MaxBuilderFeeResponse = number;

/** userRateLimit 响应 */
export interface UserRateLimitResponse {
  /** 累计交易量 (USD) → 用于计算VIP等级 */
  cumVlm: string;
  /** 已使用请求数 → API状态: 已用 */
  nRequestsUsed: number;
  /** 请求数上限 → API状态: 上限 */
  nRequestsCap: number;
  /** 剩余请求数 → API状态: 剩余 */
  nRequestsSurplus: number;
}

/** orderStatus 响应状态 */
export type OrderStatusValue = 'open' | 'filled' | 'canceled' | 'unknownOid';

/** orderStatus 响应 */
export interface OrderStatusResponse {
  /** 订单状态 */
  status: OrderStatusValue;
  /** 订单详情 (status 非 unknownOid 时) */
  order?: OpenOrder;
}

/** 推荐人状态 */
export interface ReferrerState {
  /** 推荐码 */
  code: string;
  /** 累计推荐奖励 */
  cumReferrerRewards: string;
  /** 未领取推荐奖励 */
  unclaimedReferrerRewards: string;
  /** 被推荐人数 */
  nReferred: number;
  /** 被推荐人累计交易量 */
  cumReferredVlm: string;
}

/** referral 响应 */
export interface ReferralResponse {
  /** 推荐人地址 (null=无推荐人) */
  referredBy: string | null;
  /** 累计交易量 */
  cumVlm: string;
  /** 未领取奖励 (USDC) → 推荐页: 待领取 */
  unclaimedRewards: string;
  /** 已领取奖励 (USDC) → 推荐页: 已领取 */
  claimedRewards: string;
  /** Builder 奖励 (USDC) */
  builderRewards: string;
  /** 作为推荐人的状态 (如果是推荐人) */
  referrerState?: ReferrerState;
  /** 奖励历史记录 */
  rewardHistory: unknown[];
}

/** 子账户 */
export interface SubAccount {
  /** 子账户地址 → 子账户列表: 地址 */
  subAccountUser: string;
  /** 子账户名称 → 子账户列表: 名称 */
  name: string;
  /** 主账户地址 */
  master: string;
  /** 子账户永续状态 (可选) */
  clearinghouseState?: ClearinghouseStateResponse;
  /** 子账户现货状态 (可选) */
  spotState?: SpotClearinghouseStateResponse;
}

/** subAccounts 响应 */
export type SubAccountsResponse = SubAccount[] | null;

// ============================================================
// 响应类型 - Vault
// ============================================================

/** Vault 详情 */
export interface VaultDetails {
  /** Vault 名称 → Vault详情: 名称 */
  name: string;
  /** Vault 地址 */
  vaultAddress: string;
  /** 管理者地址 → Vault详情: 管理者 */
  leader: string;
  /** 描述 → Vault详情: 简介 */
  description?: string;
  /** 持仓组合信息 → Vault详情: 持仓 */
  portfolio: unknown;
  /** 最大可分配金额 */
  maxDistributable: string;
  /** 年化收益率 → Vault列表: APR */
  apr: number;
  /** 历史盈亏数据 → Vault详情: 收益曲线 */
  pnlHistory: unknown[];
  /** 跟随者状态信息 */
  followerState?: unknown;
  /** 是否已关闭 */
  isClosed: boolean;
  /** 与当前用户的关系 */
  relationship?: unknown;
}

/** vaultDetails 响应 */
export type VaultDetailsResponse = VaultDetails | null;

/** Vault 权益 */
export interface VaultEquity {
  /** Vault 地址 → 我的投资: Vault */
  vaultAddress: string;
  /** 当前权益 (USD) → 我的投资: 当前价值 */
  equity: string;
  /** Vault 名称 */
  vaultName: string;
  /** 初始投入 → 我的投资: 投入金额 */
  initialEquity: string;
  /** 累计盈亏 → 我的投资: 盈亏 */
  allTimePnl: string;
  /** 锁定期结束时间 */
  lockupUntil?: number;
}

/** userVaultEquities 响应 */
export type UserVaultEquitiesResponse = VaultEquity[];

// ============================================================
// 响应类型 - 资金费率
// ============================================================

/** 预测资金费率 */
export interface PredictedFunding {
  /** 预测的下次资金费率 → 市场列表: 预测费率 */
  predictedFunding: string;
  /** 下次结算时间 */
  time: number;
}

/** predictedFundings 响应 */
export type PredictedFundingsResponse = PredictedFunding[];

/** 历史资金费率条目 */
export interface FundingHistoryEntry {
  /** 交易对名称 */
  coin: string;
  /** 资金费率 → 费率图表: Y轴 */
  fundingRate: string;
  /** 溢价率 */
  premium: string;
  /** 结算时间 (毫秒) → 费率图表: X轴 */
  time: number;
}

/** fundingHistory 响应 */
export type FundingHistoryResponse = FundingHistoryEntry[];
