# HyperLiquid Exchange API 开发指南

本文档详细介绍 HyperLiquid Exchange API（写操作）的实现方法，包括签名流程、请求格式和 TypeScript 代码示例。

---

## 目录

1. [概述](#1-概述)
2. [签名实现](#2-签名实现)
3. [订单操作](#3-订单操作)
4. [账户操作](#4-账户操作)
5. [资金操作](#5-资金操作)
6. [Vault 操作](#6-vault-操作)
7. [BuildCode 集成](#7-buildcode-集成)
8. [API 钱包授权](#8-api-钱包授权)
9. [响应处理](#9-响应处理)
10. [错误处理](#10-错误处理)
11. [常见交易场景](#附录-常见交易场景代码)

---

## 1. 概述

### 1.1 API 端点

| 环境 | REST API | WebSocket |
|------|----------|-----------|
| 主网 | `https://api.hyperliquid.xyz/exchange` | `wss://api.hyperliquid.xyz/ws` |
| 测试网 | `https://api.hyperliquid-testnet.xyz/exchange` | `wss://api.hyperliquid-testnet.xyz/ws` |

### 1.2 请求结构

所有 Exchange API 请求都遵循以下结构：

```typescript
interface ExchangeRequest<A> {
  action: A;                    // 具体操作
  nonce: number;                // 时间戳（毫秒）
  signature: Signature;         // EIP-712 签名
  vaultAddress?: string;        // Vault 地址（可选，代理交易时使用）
}

interface Signature {
  r: string;  // 签名 r 值 (0x...)
  s: string;  // 签名 s 值 (0x...)
  v: number;  // 签名 v 值 (27 或 28)
}
```

### 1.3 操作类型概览

| 类别 | 操作 | type 值 | 签名方法 |
|------|------|---------|----------|
| 订单 | 下单 | `order` | signL1Action |
| 订单 | 撤单 | `cancel` | signL1Action |
| 订单 | 按 cloid 撤单 | `cancelByCloid` | signL1Action |
| 订单 | 修改订单 | `modify` | signL1Action |
| 订单 | 批量修改 | `batchModify` | signL1Action |
| 账户 | 更新杠杆 | `updateLeverage` | signL1Action |
| 账户 | 更新逐仓保证金 | `updateIsolatedMargin` | signL1Action |
| **资金** | **充值到 L2** | *Bridge 合约* | *链上 ERC-20 转账* |
| 资金 | USDC 转账 | `usdSend` | signUserSignedAction |
| 资金 | 提现到 L1 | `withdraw3` | signUserSignedAction |
| 资金 | 现货转账 | `spotSend` | signUserSignedAction |
| 资金 | 账户互转 | `usdClassTransfer` | signUserSignedAction |
| 资金 | 子账户转账 | `subAccountTransfer` | signL1Action |
| Vault | 存入 | `vaultDeposit` | signL1Action |
| Vault | 取出 | `vaultWithdraw` | signL1Action |
| 授权 | 授权 Builder 费率 | `approveBuilderFee` | signUserSignedAction |
| 授权 | 授权 API 钱包 | `approveAgent` | signUserSignedAction |
| 推荐 | 设置推荐码 | `setReferrer` | signUserSignedAction |
| 推荐 | 创建推荐码 | `createReferralCode` | signUserSignedAction |

---

## 2. 签名实现

HyperLiquid 使用 **EIP-712 结构化签名**，有两种签名方法：

### 2.1 签名域配置

```typescript
// 主网签名域
const MAINNET_DOMAIN = {
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: 42161,  // Arbitrum One
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

// 测试网签名域
const TESTNET_DOMAIN = {
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: 421614,  // Arbitrum Sepolia
  verifyingContract: '0x0000000000000000000000000000000000000000',
};
```

### 2.2 signL1Action - 交易操作签名 (Phantom Agent 模式)

用于：`order`, `cancel`, `modify`, `updateLeverage`, `vaultDeposit`, `vaultWithdraw` 等交易相关操作

**重要**: L1Action 使用 **Phantom Agent** 签名模式，不是直接签名 action 内容。

```typescript
import { encode } from '@msgpack/msgpack';
import { keccak256, hexToBytes, type Hex } from 'viem';

// ============================================================
// L1Action 专用签名域 (与 Python SDK 一致)
// 注意: chainId 固定为 1337，不是实际链 ID!
// ============================================================
const L1_ACTION_DOMAIN = {
  name: 'Exchange',      // 不是 'HyperliquidSignTransaction'
  version: '1',
  chainId: 1337,         // 固定值
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

// L1Action 使用 Agent 类型 (Phantom Agent)
const L1_ACTION_TYPES = {
  Agent: [
    { name: 'source', type: 'string' },      // 'a' = mainnet, 'b' = testnet
    { name: 'connectionId', type: 'bytes32' }, // action hash
  ],
};

// ============================================================
// Action Hash 计算
// data = msgpack(action) + nonce(8字节大端) + vault_flag[+address]
// ============================================================
function computeActionHash(
  action: object,
  nonce: number,
  vaultAddress: string | null = null
): Hex {
  // 1. msgpack 编码 (重要: 不排序 keys，保持原始顺序!)
  const actionData = encode(action);

  // 2. nonce 转 8 字节大端序
  const nonceBytes = new Uint8Array(8);
  const view = new DataView(nonceBytes.buffer);
  view.setBigUint64(0, BigInt(nonce), false);  // big-endian

  // 3. vault 标志 (0 = 无 vault, 1 = 有 vault + 20字节地址)
  let vaultData: Uint8Array;
  if (!vaultAddress || vaultAddress === '0x0000000000000000000000000000000000000000') {
    vaultData = new Uint8Array([0]);
  } else {
    const addrHex = vaultAddress.startsWith('0x') ? vaultAddress.slice(2) : vaultAddress;
    const addrBytes = hexToBytes(`0x${addrHex}`);
    vaultData = new Uint8Array(21);
    vaultData[0] = 1;
    vaultData.set(addrBytes, 1);
  }

  // 4. 拼接所有数据
  const combined = new Uint8Array(actionData.length + 8 + vaultData.length);
  combined.set(actionData, 0);
  combined.set(nonceBytes, actionData.length);
  combined.set(vaultData, actionData.length + 8);

  // 5. keccak256 哈希
  return keccak256(combined);
}

// ============================================================
// Phantom Agent 构造
// ============================================================
function constructPhantomAgent(hash: Hex, isMainnet: boolean) {
  return {
    source: isMainnet ? 'a' : 'b',  // 'a' = mainnet, 'b' = testnet
    connectionId: hash,
  };
}

// ============================================================
// L1Action 签名函数
// ============================================================
async function signL1Action(
  walletClient: WalletClient,
  action: object,
  nonce: number,
  vaultAddress: string | null = null,
  isMainnet: boolean = false
): Promise<Signature> {
  // 1. 计算 action hash
  const actionHash = computeActionHash(action, nonce, vaultAddress);

  // 2. 构造 phantom agent
  const phantomAgent = constructPhantomAgent(actionHash, isMainnet);

  // 3. EIP-712 签名 phantom agent (不是 action!)
  const signature = await walletClient.signTypedData({
    domain: L1_ACTION_DOMAIN,
    types: L1_ACTION_TYPES,
    primaryType: 'Agent',
    message: phantomAgent,
  });

  // 4. 解析签名
  return parseSignature(signature);
}

// 解析签名字符串为 {r, s, v} 对象格式
function parseSignature(signature: Hex): Signature {
  const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
  return {
    r: '0x' + sig.slice(0, 64),
    s: '0x' + sig.slice(64, 128),
    v: parseInt(sig.slice(128, 130), 16),
  };
}
```

> **注意**: action 对象的字段顺序必须与 Python SDK 一致，msgpack 不会对 keys 排序!

### 2.3 signUserSignedAction - 用户授权签名

用于：`approveBuilderFee`, `approveAgent`, `usdSend`, `withdraw3`, `usdClassTransfer` 等授权和资金操作

```typescript
// ============================================================
// EIP-712 类型定义
// 重要: 字段顺序必须与 Python SDK 完全一致!
// ============================================================

// approveBuilderFee 类型 (注意 primaryType 格式!)
const APPROVE_BUILDER_FEE_TYPES = {
  'HyperliquidTransaction:ApproveBuilderFee': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'maxFeeRate', type: 'string' },   // 顺序: maxFeeRate 在 builder 前!
    { name: 'builder', type: 'address' },
    { name: 'nonce', type: 'uint64' },
  ],
};

// usdClassTransfer 类型 (永续/现货互转)
const USD_CLASS_TRANSFER_TYPES = {
  'HyperliquidTransaction:UsdClassTransfer': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'toPerp', type: 'bool' },
    { name: 'nonce', type: 'uint64' },
  ],
};

// usdSend / withdraw3 / spotSend 类型
const USD_SEND_TYPES = {
  HyperliquidTransaction: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'destination', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'time', type: 'uint64' },
  ],
};

// ============================================================
// maxFeeRate 格式说明
// ============================================================
// approveBuilderFee 的 maxFeeRate 必须是带 % 后缀的百分比字符串!
//
// | 基点 (bps) | 正确格式 |
// |-----------|----------|
// | 10 bps    | "0.1%"   |
// | 100 bps   | "1%"     |
//
// 转换函数:
// const feeRatePercent = `${bps / 100}%`;  // 10 -> "0.1%"
// ============================================================

// 签名授权 Builder 费率
async function signApproveBuilderFee(
  walletClient: WalletClient,
  builder: string,
  maxFeeRate: string,  // 必须是 "0.1%" 格式!
  nonce: number,
  isTestnet = false
): Promise<Signature> {
  const message = {
    hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
    maxFeeRate,                          // 顺序与 types 一致
    builder: builder.toLowerCase(),       // 小写地址
    nonce: BigInt(nonce),
  };

  const signature = await walletClient.signTypedData({
    domain: isTestnet ? TESTNET_DOMAIN : MAINNET_DOMAIN,
    types: APPROVE_BUILDER_FEE_TYPES,
    primaryType: 'HyperliquidTransaction:ApproveBuilderFee',  // 注意格式!
    message,
  });

  return parseSignature(signature);
}

// 签名账户互转 (永续 <-> 现货)
async function signUsdClassTransfer(
  walletClient: WalletClient,
  amount: string,
  toPerp: boolean,
  nonce: number,
  isTestnet = false
): Promise<Signature> {
  const message = {
    hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
    amount,
    toPerp,
    nonce: BigInt(nonce),
  };

  const signature = await walletClient.signTypedData({
    domain: isTestnet ? TESTNET_DOMAIN : MAINNET_DOMAIN,
    types: USD_CLASS_TRANSFER_TYPES,
    primaryType: 'HyperliquidTransaction:UsdClassTransfer',
    message,
  });

  return parseSignature(signature);
}
```

### 2.4 签名常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `Invalid signature` | 签名格式错误 | 确保使用 `{r, s, v}` 对象格式，不是字符串 |
| `Must deposit before performing actions` | 签名恢复地址错误 | 检查 EIP-712 types 字段顺序、primaryType 格式 |
| `Percentage is invalid` | maxFeeRate 格式错误 | 使用带 % 后缀的格式，如 `"0.1%"` |
| `422 Unprocessable Entity` | 签名内容或 action 格式不匹配 | 检查 action 字段是否完整（如 hyperliquidChain, signatureChainId） |
| `Nonce too old` | nonce 过期 | 使用当前时间戳（毫秒） |
| `Wrong chain` | 签名域 chainId 错误 | UserSignedAction: 主网 42161，测试网 421614；L1Action: 固定 1337 |

> **详细故障排查**: 参见 [EIP-712 签名故障排查指南](./eip712-signing-troubleshooting.md)

---

## 3. 订单操作

### 3.1 下单 (order)

```typescript
interface OrderRequest {
  a: number;      // 资产索引 (永续: index, 现货: 10000+index)
  b: boolean;     // 方向: true=买入/开多, false=卖出/开空
  p: string;      // 限价 (移除尾随零)
  s: string;      // 数量
  r: boolean;     // 是否仅减仓
  t: OrderType;   // 订单类型
  c?: string;     // 客户端订单ID (可选)
}

interface OrderType {
  limit: {
    tif: 'Gtc' | 'Ioc' | 'Alo';  // 有效期
  };
  trigger?: {
    triggerPx: string;
    isMarket: boolean;
    tpsl: 'tp' | 'sl';
  };
}

interface OrderAction {
  type: 'order';
  orders: OrderRequest[];
  grouping: 'na' | 'normalTpsl' | 'positionTpsl';
  builder?: {
    b: string;  // Builder 地址
    f: number;  // 费率 (基点)
  };
}
```

**示例：永续开多**

```typescript
async function placeOrder(
  walletClient: WalletClient,
  asset: number,
  isBuy: boolean,
  price: string,
  size: string,
  reduceOnly: boolean = false
) {
  const nonce = Date.now();

  const action: OrderAction = {
    type: 'order',
    orders: [{
      a: asset,
      b: isBuy,
      p: price,
      s: size,
      r: reduceOnly,
      t: { limit: { tif: 'Gtc' } },
    }],
    grouping: 'na',
  };

  const signature = await signL1Action(walletClient, {
    action,
    nonce,
    isTestnet: true,
  });

  const response = await fetch('https://api.hyperliquid-testnet.xyz/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, nonce, signature }),
  });

  return response.json();
}

// 使用示例
// BTC 做多: asset=0, isBuy=true
await placeOrder(walletClient, 0, true, '95000', '0.001');

// ETH 做空: asset=1, isBuy=false
await placeOrder(walletClient, 1, false, '3500', '0.01');
```

**示例：带止盈止损的订单**

```typescript
async function placeOrderWithTpSl(
  walletClient: WalletClient,
  asset: number,
  isBuy: boolean,
  price: string,
  size: string,
  tpPrice: string,
  slPrice: string
) {
  const nonce = Date.now();

  const action: OrderAction = {
    type: 'order',
    orders: [
      // 主订单
      {
        a: asset,
        b: isBuy,
        p: price,
        s: size,
        r: false,
        t: { limit: { tif: 'Gtc' } },
      },
      // 止盈订单
      {
        a: asset,
        b: !isBuy,  // 方向相反
        p: tpPrice,
        s: size,
        r: true,    // 仅减仓
        t: {
          limit: { tif: 'Gtc' },
          trigger: {
            triggerPx: tpPrice,
            isMarket: true,
            tpsl: 'tp',
          },
        },
      },
      // 止损订单
      {
        a: asset,
        b: !isBuy,
        p: slPrice,
        s: size,
        r: true,
        t: {
          limit: { tif: 'Gtc' },
          trigger: {
            triggerPx: slPrice,
            isMarket: true,
            tpsl: 'sl',
          },
        },
      },
    ],
    grouping: 'normalTpsl',  // 使用 TP/SL 分组
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

### 3.2 撤单 (cancel)

```typescript
interface CancelAction {
  type: 'cancel';
  cancels: Array<{
    a: number;  // 资产索引
    o: number;  // 订单ID
  }>;
}

async function cancelOrder(
  walletClient: WalletClient,
  asset: number,
  orderId: number
) {
  const nonce = Date.now();

  const action: CancelAction = {
    type: 'cancel',
    cancels: [{ a: asset, o: orderId }],
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

### 3.3 修改订单 (modify)

```typescript
interface ModifyAction {
  type: 'modify';
  oid: number;         // 原订单ID
  order: OrderRequest; // 新的订单参数
}

async function modifyOrder(
  walletClient: WalletClient,
  orderId: number,
  newOrder: OrderRequest
) {
  const nonce = Date.now();

  const action: ModifyAction = {
    type: 'modify',
    oid: orderId,
    order: newOrder,
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

---

## 4. 账户操作

### 4.1 更新杠杆 (updateLeverage)

```typescript
interface UpdateLeverageAction {
  type: 'updateLeverage';
  asset: number;      // 资产索引
  isCross: boolean;   // true=全仓, false=逐仓
  leverage: number;   // 杠杆倍数 (1-100)
}

async function updateLeverage(
  walletClient: WalletClient,
  asset: number,
  leverage: number,
  isCross: boolean = true
) {
  const nonce = Date.now();

  const action: UpdateLeverageAction = {
    type: 'updateLeverage',
    asset,
    isCross,
    leverage,
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}

// 使用示例
// BTC 设置全仓 10x
await updateLeverage(walletClient, 0, 10, true);

// ETH 设置逐仓 20x
await updateLeverage(walletClient, 1, 20, false);
```

### 4.2 更新逐仓保证金 (updateIsolatedMargin)

```typescript
interface UpdateIsolatedMarginAction {
  type: 'updateIsolatedMargin';
  asset: number;   // 资产索引
  isBuy: boolean;  // true=增加, false=减少
  ntli: number;    // 保证金变化量 (USD)
}

async function updateIsolatedMargin(
  walletClient: WalletClient,
  asset: number,
  amount: number,
  isAdd: boolean = true
) {
  const nonce = Date.now();

  const action: UpdateIsolatedMarginAction = {
    type: 'updateIsolatedMargin',
    asset,
    isBuy: isAdd,
    ntli: amount,
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

---

## 5. 资金操作

### 充值 vs 提现 对比

| 操作 | 方式 | 签名 | 到账时间 |
|------|------|------|----------|
| **充值** | Arbitrum 链上 USDC 转账到 Bridge 合约 | 无需 HL 签名 | ~1 分钟 |
| **提现** | `/exchange` API + `withdraw3` | 需要 EIP-712 签名 | 3-4 分钟 |

---

### 5.0 充值到 L2 (Deposit via Bridge)

> **注意**: 充值不是 `/exchange` API，而是 Arbitrum 链上的 ERC-20 转账。

#### Bridge 合约地址

| 网络 | Bridge 地址 | USDC 地址 |
|------|------------|-----------|
| 主网 (Arbitrum One) | `0x2df1c51e09aecf9cacb7bc98cb1742757f163df7` | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| 测试网 (Arbitrum Sepolia) | `0x08cfc1B6b2dCF36A1480b99353A354AA8AC56f89` | `0x1baAbB04529D43a73232B713C0FE471f7c7334d5` (USDC2) |

#### 充值流程

1. 用户在 Arbitrum 链上调用 `USDC.transfer(bridgeAddress, amount)`
2. HyperLiquid 验证节点监控 Bridge 合约
3. 约 **1 分钟内**自动到账 L2

#### 限制条件

- **最低充值**: 5 USDC
- 低于最低金额的转账将**丢失且无法找回**
- 无需 HyperLiquid 签名

#### TypeScript 示例

```typescript
import { parseUnits, type WalletClient } from 'viem';

const USDC_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const BRIDGE_ADDRESS = '0x2df1c51e09aecf9cacb7bc98cb1742757f163df7';

// ERC-20 Transfer ABI
const erc20Abi = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

/**
 * 充值 USDC 到 HyperLiquid L2
 * @param walletClient viem 钱包客户端
 * @param amount 充值金额 (USDC)
 */
async function depositToHyperliquid(
  walletClient: WalletClient,
  amount: string
) {
  // USDC 使用 6 位小数
  const amountInUnits = parseUnits(amount, 6);

  // 调用 USDC 合约的 transfer 方法
  const txHash = await walletClient.writeContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [BRIDGE_ADDRESS, amountInUnits],
  });

  console.log('充值交易已发送:', txHash);
  console.log('预计 1 分钟内到账 L2');

  return txHash;
}
```

#### 查询充值状态

使用 `/info` API 的 `userNonFundingLedgerUpdates` 查询账本记录：

```typescript
const response = await fetch('https://api.hyperliquid.xyz/info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'userNonFundingLedgerUpdates',
    user: userAddress,
  }),
});

const ledger = await response.json();

// 筛选充值记录
const deposits = ledger.filter((item: any) => item.delta.type === 'deposit');
```

---

### 5.1 USDC 转账 (usdSend)

L2 内部转账，即时到账，无 gas 费用。

```typescript
interface UsdSendAction {
  type: 'usdSend';
  destination: string;  // 接收地址
  amount: string;       // 转账金额
  time: number;         // 发送时间 (毫秒)
}

async function sendUsdc(
  walletClient: WalletClient,
  destination: string,
  amount: string
) {
  const time = Date.now();
  const nonce = time;

  const action: UsdSendAction = {
    type: 'usdSend',
    destination,
    amount,
    time,
  };

  // 使用 signUserSignedAction
  const signature = await signUsdSend(walletClient, destination, amount, time);

  // ... 发送请求
}
```

### 5.2 提现到 L1 (withdraw3)

提现到 Arbitrum 主链。

```typescript
interface Withdraw3Action {
  type: 'withdraw3';
  destination: string;  // 接收地址
  amount: string;       // 提现金额
  time: number;         // 发送时间 (毫秒)
}

async function withdraw(
  walletClient: WalletClient,
  destination: string,
  amount: string
) {
  const time = Date.now();
  const nonce = time;

  const action: Withdraw3Action = {
    type: 'withdraw3',
    destination,
    amount,
    time,
  };

  // 使用 signUserSignedAction
  const signature = await signWithdraw(walletClient, destination, amount, time);

  // ... 发送请求
}
```

### 5.3 账户互转 (usdClassTransfer)

永续账户与现货账户之间转账。

```typescript
interface UsdClassTransferAction {
  type: 'usdClassTransfer';
  toPerp: boolean;   // true=现货→永续, false=永续→现货
  amount: string;    // 转账金额
}

async function transferBetweenAccounts(
  walletClient: WalletClient,
  amount: string,
  toPerp: boolean = true
) {
  const nonce = Date.now();

  const action: UsdClassTransferAction = {
    type: 'usdClassTransfer',
    toPerp,
    amount,
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

---

## 6. Vault 操作

### 6.1 存入 Vault (vaultDeposit)

```typescript
interface VaultDepositAction {
  type: 'vaultDeposit';
  vaultAddress: string;  // Vault 地址
  usd: number;           // 存入金额
}

async function depositToVault(
  walletClient: WalletClient,
  vaultAddress: string,
  amount: number
) {
  const nonce = Date.now();

  const action: VaultDepositAction = {
    type: 'vaultDeposit',
    vaultAddress,
    usd: amount,
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

### 6.2 从 Vault 取出 (vaultWithdraw)

```typescript
interface VaultWithdrawAction {
  type: 'vaultWithdraw';
  vaultAddress: string;  // Vault 地址
  usd: number;           // 取出金额
}

async function withdrawFromVault(
  walletClient: WalletClient,
  vaultAddress: string,
  amount: number
) {
  const nonce = Date.now();

  const action: VaultWithdrawAction = {
    type: 'vaultWithdraw',
    vaultAddress,
    usd: amount,
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

---

## 7. BuildCode 集成

BuildCode 是 HyperLiquid 的第三方平台收费机制，允许 Builder 从用户交易中收取费用。

### 7.1 前置条件

1. Builder 地址需存入 **100+ USDC** 作为保证金
2. 永续合约最高费率 **0.1%** (10 bp)
3. 现货交易最高费率 **1%** (100 bp)

### 7.2 授权 Builder 费率 (approveBuilderFee)

用户首次使用平台前需要授权：

```typescript
interface ApproveBuilderFeeAction {
  type: 'approveBuilderFee';
  builder: string;       // Builder 钱包地址
  maxFeeRate: string;    // 最大费率 (基点字符串)
}

async function approveBuilderFee(
  walletClient: WalletClient,
  builderAddress: string,
  maxFeeRate: string = '10'  // 默认 0.1%
) {
  const nonce = Date.now();

  const action: ApproveBuilderFeeAction = {
    type: 'approveBuilderFee',
    builder: builderAddress,
    maxFeeRate,
  };

  // 使用 signUserSignedAction
  const signature = await signApproveBuilderFee(
    walletClient,
    builderAddress,
    maxFeeRate,
    nonce
  );

  const response = await fetch('https://api.hyperliquid.xyz/exchange', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, nonce, signature }),
  });

  return response.json();
}
```

### 7.3 下单时附加 Builder 参数

用户授权后，每笔订单附加 `builder` 参数：

```typescript
async function placeOrderWithBuilder(
  walletClient: WalletClient,
  orderParams: OrderRequest,
  builderAddress: string,
  feeRate: number = 10  // 0.1%
) {
  const nonce = Date.now();

  const action: OrderAction = {
    type: 'order',
    orders: [orderParams],
    grouping: 'na',
    builder: {
      b: builderAddress,
      f: feeRate,
    },
  };

  const signature = await signL1Action(walletClient, { action, nonce });

  // ... 发送请求
}
```

### 7.4 BuildCode 集成流程

```
1. 用户首次连接钱包
   ↓
2. 检查是否已授权 (通过 /info 查询)
   ↓
3. 未授权 → 弹窗引导签名 approveBuilderFee
   ↓
4. 授权成功 → 保存授权状态
   ↓
5. 用户下单时自动附加 builder 参数
   ↓
6. 每笔成交自动收取费用
```

---

## 8. API 钱包授权

### 8.1 授权 API 钱包 (approveAgent)

允许 Agent 钱包代替主钱包签名交易（但不能提现转账）。

```typescript
interface ApproveAgentAction {
  type: 'approveAgent';
  agentAddress: string;   // Agent 钱包地址
  agentName?: string;     // Agent 名称 (可选)
  nonce?: number;         // 授权到期时间 (可选)
}

async function approveAgent(
  walletClient: WalletClient,
  agentAddress: string,
  agentName?: string,
  expirationTime?: number
) {
  const nonce = Date.now();

  const action: ApproveAgentAction = {
    type: 'approveAgent',
    agentAddress,
    agentName,
    nonce: expirationTime,  // action.nonce 是到期时间
  };

  // 使用 signUserSignedAction
  const signature = await signApproveAgent(walletClient, action, nonce);

  // ... 发送请求
}
```

---

## 9. 响应处理

### 9.1 通用响应结构

```typescript
// 成功响应
interface SuccessResponse {
  status: 'ok';
  response: {
    type: string;
    data?: unknown;
  };
}

// 错误响应
interface ErrorResponse {
  status: 'err';
  response: string;  // 错误信息
}
```

### 9.2 订单响应

```typescript
interface OrderResponse {
  status: 'ok';
  response: {
    type: 'order';
    data: {
      statuses: OrderStatus[];
    };
  };
}

interface OrderStatus {
  status: 'filled' | 'resting' | 'error';
  filled?: {
    totalSz: string;  // 成交数量
    avgPx: string;    // 成交均价
    oid: number;      // 订单ID
  };
  resting?: {
    oid: number;      // 订单ID
  };
  error?: string;     // 错误信息
}
```

### 9.3 响应处理示例

```typescript
async function handleOrderResponse(response: OrderResponse | ErrorResponse) {
  if (response.status === 'err') {
    throw new Error(response.response);
  }

  const statuses = response.response.data.statuses;

  for (const status of statuses) {
    if (status.status === 'filled') {
      console.log(`订单成交: ${status.filled?.totalSz} @ ${status.filled?.avgPx}`);
    } else if (status.status === 'resting') {
      console.log(`订单挂单: oid=${status.resting?.oid}`);
    } else if (status.status === 'error') {
      console.error(`订单失败: ${status.error}`);
    }
  }
}
```

---

## 10. 错误处理

### 10.1 常见错误码

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `Invalid signature` | 签名格式错误 | 使用 `{r, s, v}` 对象格式 |
| `Insufficient margin` | 保证金不足 | 增加保证金或减少仓位 |
| `Order would be immediately liquidated` | 订单会导致立即清算 | 调整价格或仓位大小 |
| `Position does not exist` | 没有对应持仓 | 检查资产索引和方向 |
| `Order not found` | 订单不存在 | 检查订单ID |
| `Nonce too old` | Nonce 过期 | 使用当前时间戳 |
| `Rate limit exceeded` | 请求过于频繁 | 添加请求间隔 |

### 10.2 错误处理最佳实践

```typescript
async function safeExchangeRequest<T>(
  action: object,
  signature: Signature,
  nonce: number
): Promise<T> {
  try {
    const response = await fetch('https://api.hyperliquid.xyz/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, nonce, signature }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'err') {
      throw new Error(data.response);
    }

    return data;
  } catch (error) {
    // 处理网络错误
    if (error instanceof TypeError) {
      throw new Error('网络连接失败，请检查网络');
    }
    throw error;
  }
}
```

---

## 附录: 常见交易场景代码

### A.1 完整的下单流程

```typescript
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrum } from 'viem/chains';

// 创建钱包客户端
const account = privateKeyToAccount('0x...');
const walletClient = createWalletClient({
  account,
  chain: arbitrum,
  transport: http(),
});

// 下单
async function main() {
  // 1. 检查 Builder 授权 (首次使用)
  // await approveBuilderFee(walletClient, BUILDER_ADDRESS, '10');

  // 2. 设置杠杆
  await updateLeverage(walletClient, 0, 10, true);

  // 3. 下单
  const response = await placeOrderWithBuilder(
    walletClient,
    {
      a: 0,           // BTC
      b: true,        // 买入/开多
      p: '95000',     // 限价
      s: '0.001',     // 数量
      r: false,       // 非减仓
      t: { limit: { tif: 'Gtc' } },
    },
    BUILDER_ADDRESS,
    10  // 0.1% 费率
  );

  console.log('下单结果:', response);
}
```

### A.2 市价单 (IOC 模拟)

```typescript
// 市价买入 - 使用非常高的限价 + IOC
async function marketBuy(walletClient: WalletClient, asset: number, size: string) {
  return placeOrder(walletClient, {
    a: asset,
    b: true,
    p: '9999999',    // 远高于市场价
    s: size,
    r: false,
    t: { limit: { tif: 'Ioc' } },  // 立即成交否则取消
  });
}

// 市价卖出 - 使用非常低的限价 + IOC
async function marketSell(walletClient: WalletClient, asset: number, size: string) {
  return placeOrder(walletClient, {
    a: asset,
    b: false,
    p: '0.01',       // 远低于市场价
    s: size,
    r: false,
    t: { limit: { tif: 'Ioc' } },
  });
}
```

### A.3 一键平仓

```typescript
async function closePosition(
  walletClient: WalletClient,
  asset: number,
  positionSize: string,  // 当前持仓量 (正=多头, 负=空头)
) {
  const size = Math.abs(parseFloat(positionSize));
  const isBuy = parseFloat(positionSize) < 0;  // 空头需要买入平仓

  return placeOrder(walletClient, {
    a: asset,
    b: isBuy,
    p: isBuy ? '9999999' : '0.01',  // 市价
    s: size.toString(),
    r: true,  // 仅减仓
    t: { limit: { tif: 'Ioc' } },
  });
}
```

---

## 相关文档

- [HTTP 测试文件](./http/hyperliquid-exchange.http) - 请求格式参考
- [TypeScript 类型定义](../../src/types/hyperliquid/exchange.ts) - 完整类型
- [API 页面映射](./api-page-mapping.md) - UI 字段对应关系
- [签名格式说明](./api-signature-format.md) - 签名问题排查

---

*最后更新: 2026-01-22*
