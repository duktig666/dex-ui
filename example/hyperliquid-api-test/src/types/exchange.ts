// ============================================================
// HyperLiquid /exchange API 类型定义
// ============================================================

// ============================================================
// 通用类型
// ============================================================

/** EIP-712 签名 */
export interface Signature {
  r: string;
  s: string;
  v: number;
}

/** 交易请求基础结构 */
export interface ExchangeRequest<A> {
  action: A;
  nonce: number;
  signature: Signature;
  vaultAddress?: string;
}

// ============================================================
// 订单相关类型
// ============================================================

/** 订单类型 - 限价单 */
export interface LimitOrderType {
  limit: {
    tif: 'Gtc' | 'Ioc' | 'Alo';
  };
}

/** 触发类型 (条件单) */
export interface TriggerType {
  triggerPx: string;
  isMarket: boolean;
  tpsl: 'tp' | 'sl';
}

/** 订单类型 - 条件单 */
export interface TriggerOrderType {
  limit: {
    tif: 'Gtc' | 'Ioc' | 'Alo';
  };
  trigger: TriggerType;
}

/** 订单参数 */
export interface OrderRequest {
  /** 资产索引 (永续: coin index, 现货: 10000 + market index) */
  a: number;
  /** 是否为买入: true=买入/开多, false=卖出/开空 */
  b: boolean;
  /** 限价 */
  p: string;
  /** 数量 */
  s: string;
  /** 是否仅减仓 */
  r: boolean;
  /** 订单类型 */
  t: LimitOrderType | TriggerOrderType;
  /** 客户端订单ID (可选, 128位十六进制) */
  c?: string;
}

/** 下单动作 */
export interface OrderAction {
  type: 'order';
  orders: OrderRequest[];
  grouping: 'na' | 'normalTpsl' | 'positionTpsl';
  builder?: {
    b: string;
    f: number;
  };
}

/** 取消订单动作 */
export interface CancelAction {
  type: 'cancel';
  cancels: Array<{
    a: number;
    o: number;
  }>;
}

/** 批量取消订单动作 (按 cloid) */
export interface CancelByCloidAction {
  type: 'cancelByCloid';
  cancels: Array<{
    asset: number;
    cloid: string;
  }>;
}

/** 修改订单动作 */
export interface ModifyAction {
  type: 'modify';
  oid: number;
  order: OrderRequest;
}

/** 批量修改订单动作 */
export interface BatchModifyAction {
  type: 'batchModify';
  modifies: Array<{
    oid: number;
    order: OrderRequest;
  }>;
}

// ============================================================
// 账户操作类型
// ============================================================

/** 更新杠杆动作 */
export interface UpdateLeverageAction {
  type: 'updateLeverage';
  asset: number;
  isCross: boolean;
  leverage: number;
}

/** 更新逐仓保证金动作 */
export interface UpdateIsolatedMarginAction {
  type: 'updateIsolatedMargin';
  asset: number;
  isBuy: boolean;
  ntli: number;
}

/** USDC 转账动作 (L2 内部) */
export interface UsdSendAction {
  type: 'usdSend';
  signatureChainId: string;
  hyperliquidChain: string;
  destination: string;
  amount: string;
  time: number;
}

/** 提现到 L1 动作 */
export interface Withdraw3Action {
  type: 'withdraw3';
  signatureChainId: string;
  hyperliquidChain: string;
  destination: string;
  amount: string;
  time: number;
}

/** 现货转账动作 */
export interface SpotSendAction {
  type: 'spotSend';
  signatureChainId: string;
  hyperliquidChain: string;
  destination: string;
  token: string;
  amount: string;
  time: number;
}

/** 永续与现货之间转账动作 */
export interface UsdClassTransferAction {
  type: 'usdClassTransfer';
  toPerp: boolean;
  amount: string;
}

/** 子账户转账动作 */
export interface SubAccountTransferAction {
  type: 'subAccountTransfer';
  subAccountUser: string;
  isDeposit: boolean;
  usd: number;
}

/** Vault 存入动作 */
export interface VaultDepositAction {
  type: 'vaultDeposit';
  vaultAddress: string;
  usd: number;
}

/** Vault 取出动作 */
export interface VaultWithdrawAction {
  type: 'vaultWithdraw';
  vaultAddress: string;
  usd: number;
}

// ============================================================
// Builder / 授权相关类型
// ============================================================

/** 授权 Builder 费用动作 */
export interface ApproveBuilderFeeAction {
  type: 'approveBuilderFee';
  hyperliquidChain: string;
  signatureChainId: string;
  maxFeeRate: string;
  builder: string;
  nonce: number;
}

/** 授权 Agent 动作 */
export interface ApproveAgentAction {
  type: 'approveAgent';
  hyperliquidChain: string;
  signatureChainId: string;
  agentAddress: string;
  agentName?: string;
  nonce: number;
}

// ============================================================
// 推荐相关类型
// ============================================================

/** 设置推荐码动作 */
export interface SetReferrerAction {
  type: 'setReferrer';
  code: string;
}

/** 创建推荐码动作 */
export interface CreateReferralCodeAction {
  type: 'createReferralCode';
  code: string;
}

// ============================================================
// 动作联合类型
// ============================================================

/** L1 签名动作类型 (signL1Action) */
export type L1Action =
  | OrderAction
  | CancelAction
  | CancelByCloidAction
  | ModifyAction
  | BatchModifyAction
  | UpdateLeverageAction
  | UpdateIsolatedMarginAction
  | UsdClassTransferAction
  | SubAccountTransferAction
  | VaultDepositAction
  | VaultWithdrawAction;

/** 用户签名动作类型 (signUserSignedAction) */
export type UserSignedAction =
  | ApproveBuilderFeeAction
  | ApproveAgentAction
  | UsdSendAction
  | Withdraw3Action
  | SpotSendAction
  | SetReferrerAction
  | CreateReferralCodeAction;

/** 所有 Exchange 动作类型 */
export type ExchangeAction = L1Action | UserSignedAction;

// ============================================================
// 响应类型
// ============================================================

/** 订单响应状态 */
export interface OrderResponseStatus {
  status: 'ok' | 'filled' | 'resting' | 'error';
  error?: string;
  resting?: { oid: number };
  filled?: {
    totalSz: string;
    avgPx: string;
    oid: number;
  };
}

/** 下单响应 */
export interface OrderResponse {
  status: 'ok';
  response: {
    type: 'order';
    data: {
      statuses: OrderResponseStatus[];
    };
  };
}

/** 取消订单响应 */
export interface CancelResponse {
  status: 'ok';
  response: {
    type: 'cancel';
    data: {
      statuses: Array<'success' | { error: string }>;
    };
  };
}

/** 通用成功响应 */
export interface SuccessResponse {
  status: 'ok';
  response: {
    type: string;
    data?: unknown;
  };
}

/** 错误响应 */
export interface ErrorResponse {
  status: 'err';
  response: string;
}

/** Exchange API 响应 */
export type ExchangeResponse =
  | OrderResponse
  | CancelResponse
  | SuccessResponse
  | ErrorResponse;

// ============================================================
// 签名相关类型
// ============================================================

/** EIP-712 域 */
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: `0x${string}`;
}

/** 主网签名域 */
export const MAINNET_DOMAIN: EIP712Domain = {
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: 42161,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

/** 测试网签名域 */
export const TESTNET_DOMAIN: EIP712Domain = {
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: 421614,
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

// ============================================================
// 工具函数
// ============================================================

/** 计算永续合约资产索引 */
export const perpAssetIndex = (coinIndex: number): number => coinIndex;

/** 计算现货资产索引 */
export const spotAssetIndex = (marketIndex: number): number => 10000 + marketIndex;
