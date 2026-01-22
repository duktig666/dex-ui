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

/** 订单类型 */
export interface OrderType {
  limit: {
    /** 有效期: "Gtc" | "Ioc" | "Alo" */
    tif: 'Gtc' | 'Ioc' | 'Alo';
  };
}

/** 触发类型 (条件单) */
export interface TriggerType {
  /** 触发价格 */
  triggerPx: string;
  /** 是否为市价: true=触发后市价成交, false=触发后限价成交 */
  isMarket: boolean;
  /** 触发条件: "gt"=价格高于时触发, "lt"=价格低于时触发 */
  tpsl: 'tp' | 'sl';
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
  t: OrderType;
  /** 客户端订单ID (可选, 128位十六进制) */
  c?: string;
}

/** 条件订单参数 */
export interface TriggerOrderRequest extends OrderRequest {
  /** 触发条件 */
  t: OrderType & { trigger: TriggerType };
}

/** 下单动作 */
export interface OrderAction {
  type: 'order';
  orders: OrderRequest[];
  /** 订单分组: "na"=普通, "normalTpsl"=带TP/SL, "positionTpsl"=持仓TP/SL */
  grouping: 'na' | 'normalTpsl' | 'positionTpsl';
  /** Builder 地址 (可选) */
  builder?: {
    /** Builder 钱包地址 */
    b: string;
    /** 费率 (基点 bp, 如 10 = 0.1%) */
    f: number;
  };
}

/** 取消订单动作 */
export interface CancelAction {
  type: 'cancel';
  cancels: Array<{
    /** 资产索引 */
    a: number;
    /** 订单ID */
    o: number;
  }>;
}

/** 批量取消订单动作 */
export interface CancelByCloidAction {
  type: 'cancelByCloid';
  cancels: Array<{
    /** 资产索引 */
    asset: number;
    /** 客户端订单ID */
    cloid: string;
  }>;
}

/** 修改订单动作 */
export interface ModifyAction {
  type: 'modify';
  /** 订单ID */
  oid: number;
  /** 新的订单参数 */
  order: OrderRequest;
}

/** 批量修改订单动作 */
export interface BatchModifyAction {
  type: 'batchModify';
  modifies: Array<{
    /** 订单ID */
    oid: number;
    /** 新的订单参数 */
    order: OrderRequest;
  }>;
}

// ============================================================
// 账户操作类型
// ============================================================

/** 更新杠杆动作 */
export interface UpdateLeverageAction {
  type: 'updateLeverage';
  /** 资产索引 */
  asset: number;
  /** 是否为全仓模式 */
  isCross: boolean;
  /** 杠杆倍数 */
  leverage: number;
}

/** 更新逐仓保证金动作 */
export interface UpdateIsolatedMarginAction {
  type: 'updateIsolatedMargin';
  /** 资产索引 */
  asset: number;
  /** 是否为增加 (true=增加, false=减少) */
  isBuy: boolean;
  /** 数量变化 */
  ntli: number;
}

/** 提现动作 - UsdSend (USDC 转账) */
export interface UsdSendAction {
  type: 'usdSend';
  /** 接收地址 */
  destination: string;
  /** 转账金额 */
  amount: string;
  /** 发送时间 */
  time: number;
}

/** 提现动作 - Withdraw2 (提现到 L1) */
export interface Withdraw2Action {
  type: 'withdraw2';
  /** 接收地址 */
  destination: string;
  /** 提现金额 */
  amount: string;
  /** 发送时间 */
  time: number;
}

/** 现货转账动作 */
export interface SpotSendAction {
  type: 'spotSend';
  /** 接收地址 */
  destination: string;
  /** 代币名称 */
  token: string;
  /** 转账数量 */
  amount: string;
  /** 发送时间 */
  time: number;
}

/** 永续与现货之间转账动作 */
export interface UsdClassTransferAction {
  type: 'usdClassTransfer';
  /** 是否从永续转到现货 (true=永续→现货, false=现货→永续) */
  toPerp: boolean;
  /** 转账金额 */
  amount: string;
}

/** 子账户转账动作 */
export interface SubAccountTransferAction {
  type: 'subAccountTransfer';
  /** 子账户地址 */
  subAccountUser: string;
  /** 是否存入子账户 (true=存入, false=取出) */
  isDeposit: boolean;
  /** 转账金额 */
  usd: number;
}

/** Vault 存入动作 */
export interface VaultDepositAction {
  type: 'vaultDeposit';
  /** Vault 地址 */
  vaultAddress: string;
  /** 存入金额 */
  usd: number;
}

/** Vault 取出动作 */
export interface VaultWithdrawAction {
  type: 'vaultWithdraw';
  /** Vault 地址 */
  vaultAddress: string;
  /** 取出金额 */
  usd: number;
}

// ============================================================
// Builder / 授权相关类型
// ============================================================

/** 授权 Builder 费用动作 */
export interface ApproveBuilderFeeAction {
  type: 'approveBuilderFee';
  /** Builder 地址 */
  builder: string;
  /** 授权的最大费率 (基点 bp) */
  maxFeeRate: string;
}

/** 授权 Agent 动作 */
export interface ApproveAgentAction {
  type: 'approveAgent';
  /** Agent 地址 */
  agentAddress: string;
  /** Agent 名称 */
  agentName?: string;
  /** 授权到期时间 (毫秒时间戳, 可选) */
  nonce?: number;
}

// ============================================================
// 推荐相关类型
// ============================================================

/** 设置推荐码动作 */
export interface SetReferrerAction {
  type: 'setReferrer';
  /** 推荐码 */
  code: string;
}

/** 创建推荐码动作 */
export interface CreateReferralCodeAction {
  type: 'createReferralCode';
  /** 推荐码 */
  code: string;
}

// ============================================================
// 动作联合类型
// ============================================================

/** 所有 Exchange 动作类型 */
export type ExchangeAction =
  | OrderAction
  | CancelAction
  | CancelByCloidAction
  | ModifyAction
  | BatchModifyAction
  | UpdateLeverageAction
  | UpdateIsolatedMarginAction
  | UsdSendAction
  | Withdraw2Action
  | SpotSendAction
  | UsdClassTransferAction
  | SubAccountTransferAction
  | VaultDepositAction
  | VaultWithdrawAction
  | ApproveBuilderFeeAction
  | ApproveAgentAction
  | SetReferrerAction
  | CreateReferralCodeAction;

// ============================================================
// 响应类型
// ============================================================

/** 订单响应状态 */
export interface OrderResponseStatus {
  /** 状态: "ok" | "filled" | "resting" | "error" */
  status: 'ok' | 'filled' | 'resting' | 'error';
  /** 错误信息 (status="error" 时) */
  error?: string;
  /** 订单ID (status="resting"/"filled" 时) */
  resting?: { oid: number };
  /** 成交信息 (status="filled" 时) */
  filled?: {
    /** 成交数量 */
    totalSz: string;
    /** 成交均价 */
    avgPx: string;
    /** 订单ID */
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
export type ExchangeResponse = OrderResponse | CancelResponse | SuccessResponse | ErrorResponse;

// ============================================================
// 签名相关类型
// ============================================================

/** EIP-712 域 */
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

/** 签名类型定义 */
export interface EIP712Types {
  [key: string]: Array<{
    name: string;
    type: string;
  }>;
}

/** 主网签名域 */
export const MAINNET_DOMAIN: EIP712Domain = {
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: 42161, // Arbitrum One
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

/** 测试网签名域 */
export const TESTNET_DOMAIN: EIP712Domain = {
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: 421614, // Arbitrum Sepolia
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

// ============================================================
// 工具函数类型
// ============================================================

/** 计算资产索引 */
export interface AssetIndexHelper {
  /** 永续合约资产索引 (直接使用 meta.universe 中的索引) */
  perpIndex: (coinIndex: number) => number;
  /** 现货资产索引 (10000 + spotMeta.universe 中的索引) */
  spotIndex: (marketIndex: number) => number;
}

/** 默认资产索引计算 */
export const assetIndex: AssetIndexHelper = {
  perpIndex: (coinIndex: number) => coinIndex,
  spotIndex: (marketIndex: number) => 10000 + marketIndex,
};
