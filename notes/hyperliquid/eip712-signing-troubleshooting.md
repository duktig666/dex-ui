# HyperLiquid EIP-712 签名故障排查指南

本文档记录了在实现 HyperLiquid Exchange API 签名时遇到的问题、根本原因分析及正确的实现方式。

---

## 目录

1. [签名失败常见错误](#1-签名失败常见错误)
2. [L1Action vs UserSignedAction](#2-l1action-vs-usersignedaction)
3. [Phantom Agent 签名模式详解](#3-phantom-agent-签名模式详解)
4. [各操作类型的 EIP-712 配置](#4-各操作类型的-eip-712-配置)
5. [字段顺序的重要性](#5-字段顺序的重要性)
6. [maxFeeRate 格式说明](#6-maxfeerate-格式说明)
7. [maxBuilderFee 查询返回值转换](#7-maxbuilderfee-查询返回值转换)

---

## 1. 签名失败常见错误

### 1.1 `Must deposit before performing actions`

**错误表现**:
```json
{
  "status": "err",
  "response": "Must deposit before performing actions. User: 0x..."
}
```

**根本原因**: 签名恢复的地址与请求发起者不匹配

**可能原因**:
- EIP-712 Domain 配置错误
- EIP-712 Types 字段顺序错误
- primaryType 名称错误
- 消息字段值与签名时使用的值不一致

**解决方案**: 检查 EIP-712 配置是否与 Python SDK 完全一致

---

### 1.2 `Percentage is invalid`

**错误表现**:
```json
{
  "status": "err",
  "response": "Percentage is invalid."
}
```

**根本原因**: `approveBuilderFee` 的 `maxFeeRate` 格式错误

**错误格式**:
- `"10"` - 基点数字
- `"0.001"` - 小数比例
- `"0.1"` - 百分比数值

**正确格式**:
- `"0.1%"` - 必须带 `%` 后缀

**示例**:
```typescript
// 10 bps = 0.1%
const feeRateBps = 10;
const feeRatePercent = `${feeRateBps / 100}%`;  // "0.1%"
```

---

### 1.3 `422 - Failed to deserialize the JSON body`

**错误表现**:
```
Exchange API error: 422 - Failed to deserialize the JSON body into the target type
```

**根本原因**: action 结构或字段不符合 API 预期

**常见原因**:
- 使用了错误的签名方法（如 usdClassTransfer 错用 signL1Action）
- action payload 缺少必要字段（如 `hyperliquidChain`, `signatureChainId`）
- 字段类型不匹配

---

### 1.4 `Invalid signature`

**根本原因**: 签名格式错误

**正确格式**: 必须使用 `{r, s, v}` 对象格式，不是十六进制字符串

```typescript
interface Signature {
  r: string;  // "0x..." (64 hex chars)
  s: string;  // "0x..." (64 hex chars)
  v: number;  // 27 或 28
}

// 解析签名
function parseSignature(signature: string): Signature {
  const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
  return {
    r: '0x' + sig.slice(0, 64),
    s: '0x' + sig.slice(64, 128),
    v: parseInt(sig.slice(128, 130), 16),
  };
}
```

---

## 2. L1Action vs UserSignedAction

HyperLiquid 有两种签名方法，适用于不同的操作类型：

### 2.1 signL1Action

**用途**: 交易相关操作

| 操作 | type 值 |
|------|---------|
| 下单 | `order` |
| 撤单 | `cancel` |
| 修改订单 | `modify` |
| 更新杠杆 | `updateLeverage` |
| Vault 存取 | `vaultDeposit`, `vaultWithdraw` |

**特点**:
- 使用 **Phantom Agent** 模式签名
- Domain: `{name: 'Exchange', chainId: 1337}`
- action hash 包含 msgpack + nonce + vault flag

---

### 2.2 signUserSignedAction

**用途**: 授权和资金操作

| 操作 | type 值 | primaryType |
|------|---------|-------------|
| 授权 Builder | `approveBuilderFee` | `HyperliquidTransaction:ApproveBuilderFee` |
| 账户互转 | `usdClassTransfer` | `HyperliquidTransaction:UsdClassTransfer` |
| USDC 转账 | `usdSend` | `HyperliquidTransaction` |
| 提现到 L1 | `withdraw3` | `HyperliquidTransaction` |
| 授权 Agent | `approveAgent` | `HyperliquidTransaction` |

**特点**:
- 直接签名消息内容
- Domain: `{name: 'HyperliquidSignTransaction', chainId: 实际链 ID}`
- 每种操作有特定的 Types 定义

---

## 3. Phantom Agent 签名模式详解

L1Action 不直接签名 action 内容，而是使用 **Phantom Agent** 模式：

### 3.1 签名流程

```
1. 构造 action 对象 (字段顺序必须正确)
   ↓
2. msgpack 编码 action (不排序 keys)
   ↓
3. 拼接数据: msgpack(action) + nonce(8字节大端) + vault_flag[+address]
   ↓
4. keccak256 哈希得到 connectionId
   ↓
5. 构造 phantom agent: {source: 'a'|'b', connectionId: hash}
   ↓
6. EIP-712 签名 phantom agent
```

### 3.2 Domain 配置

```typescript
const L1_ACTION_DOMAIN = {
  name: 'Exchange',           // 固定值，不是 'HyperliquidSignTransaction'
  version: '1',
  chainId: 1337,              // 固定值，不是实际链 ID
  verifyingContract: '0x0000000000000000000000000000000000000000',
};
```

### 3.3 Types 定义

```typescript
const L1_ACTION_TYPES = {
  Agent: [
    { name: 'source', type: 'string' },      // 'a' = mainnet, 'b' = testnet
    { name: 'connectionId', type: 'bytes32' }, // action hash
  ],
};
```

### 3.4 Action Hash 计算

```typescript
function computeActionHash(
  action: L1Action,
  nonce: number,
  vaultAddress: string | null = null
): `0x${string}` {
  // 1. msgpack 编码 (保持字段原始顺序，不排序!)
  const actionData = encode(action);

  // 2. nonce 转 8 字节大端序
  const nonceBytes = new Uint8Array(8);
  const view = new DataView(nonceBytes.buffer);
  view.setBigUint64(0, BigInt(nonce), false);  // big-endian

  // 3. vault 标志
  let vaultData: Uint8Array;
  if (!vaultAddress || vaultAddress === '0x0000000000000000000000000000000000000000') {
    vaultData = new Uint8Array([0]);
  } else {
    vaultData = new Uint8Array(21);
    vaultData[0] = 1;
    vaultData.set(hexToBytes(vaultAddress), 1);
  }

  // 4. 拼接并哈希
  const combined = new Uint8Array(actionData.length + 8 + vaultData.length);
  combined.set(actionData, 0);
  combined.set(nonceBytes, actionData.length);
  combined.set(vaultData, actionData.length + 8);

  return keccak256(combined);
}
```

---

## 4. 各操作类型的 EIP-712 配置

### 4.1 L1Action (order, cancel, updateLeverage, etc.)

```typescript
// Domain
{
  name: 'Exchange',
  version: '1',
  chainId: 1337,
  verifyingContract: '0x0000000000000000000000000000000000000000',
}

// Types
{
  Agent: [
    { name: 'source', type: 'string' },
    { name: 'connectionId', type: 'bytes32' },
  ],
}

// primaryType: 'Agent'
```

### 4.2 approveBuilderFee

```typescript
// Domain (主网)
{
  name: 'HyperliquidSignTransaction',
  version: '1',
  chainId: 42161,  // Arbitrum One
  verifyingContract: '0x0000000000000000000000000000000000000000',
}

// Types - 字段顺序严格!
{
  'HyperliquidTransaction:ApproveBuilderFee': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'maxFeeRate', type: 'string' },   // "0.1%" 格式
    { name: 'builder', type: 'address' },
    { name: 'nonce', type: 'uint64' },
  ],
}

// primaryType: 'HyperliquidTransaction:ApproveBuilderFee'

// Message 示例
{
  hyperliquidChain: 'Mainnet',  // 或 'Testnet'
  maxFeeRate: '0.1%',
  builder: '0x...'.toLowerCase(),
  nonce: BigInt(timestamp),
}
```

### 4.3 usdClassTransfer

```typescript
// Domain: 同 approveBuilderFee

// Types
{
  'HyperliquidTransaction:UsdClassTransfer': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'toPerp', type: 'bool' },
    { name: 'nonce', type: 'uint64' },
  ],
}

// primaryType: 'HyperliquidTransaction:UsdClassTransfer'

// Message 示例
{
  hyperliquidChain: 'Testnet',
  amount: '1.5',
  toPerp: true,
  nonce: BigInt(timestamp),
}

// Action Payload (与签名消息不同!)
{
  type: 'usdClassTransfer',
  hyperliquidChain: 'Testnet',
  signatureChainId: '0x66eee',  // 十六进制链 ID
  amount: '1.5',
  toPerp: true,
  nonce: timestamp,
}
```

### 4.4 usdSend / withdraw3

```typescript
// Types
{
  HyperliquidTransaction: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'destination', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'time', type: 'uint64' },
  ],
}

// primaryType: 'HyperliquidTransaction'
```

---

## 5. 字段顺序的重要性

### 5.1 EIP-712 Types 字段顺序

EIP-712 规范要求 types 中的字段顺序必须与消息对象的属性顺序匹配。HyperLiquid 验证签名时会严格检查这一点。

**错误示例** (approveBuilderFee):
```typescript
// 错误! builder 在 maxFeeRate 前面
{
  HyperliquidTransaction: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'builder', type: 'address' },      // 错误位置
    { name: 'maxFeeRate', type: 'string' },
    { name: 'nonce', type: 'uint64' },
  ],
}
```

**正确示例**:
```typescript
// 正确! 与 Python SDK 顺序一致
{
  'HyperliquidTransaction:ApproveBuilderFee': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'maxFeeRate', type: 'string' },    // 正确位置
    { name: 'builder', type: 'address' },
    { name: 'nonce', type: 'uint64' },
  ],
}
```

### 5.2 Action 对象字段顺序

对于 L1Action，msgpack 编码不会对 keys 排序，因此 action 对象的字段声明顺序必须与 Python SDK 一致。

**updateLeverage 示例**:
```typescript
// 错误顺序
const action = {
  type: 'updateLeverage',
  asset: 0,
  leverage: 10,   // 错误: leverage 在 isCross 前
  isCross: true,
};

// 正确顺序 (与 Python SDK 一致)
const action = {
  type: 'updateLeverage',
  asset: 0,
  isCross: true,  // 正确: isCross 在 leverage 前
  leverage: 10,
};
```

---

## 6. maxFeeRate 格式说明

### 6.1 格式要求

`approveBuilderFee` 的 `maxFeeRate` 必须是带 `%` 后缀的百分比字符串。

| 基点 (bps) | 百分比 | 正确格式 |
|-----------|--------|----------|
| 1 bps | 0.01% | `"0.01%"` |
| 5 bps | 0.05% | `"0.05%"` |
| 10 bps | 0.1% | `"0.1%"` |
| 100 bps | 1% | `"1%"` |

### 6.2 转换函数

```typescript
// 基点 → 百分比字符串
function bpsToFeeRatePercent(bps: number): string {
  return `${bps / 100}%`;
}

// 示例
bpsToFeeRatePercent(10);   // "0.1%"
bpsToFeeRatePercent(100);  // "1%"
```

### 6.3 费率限制

| 市场类型 | 最大费率 |
|---------|---------|
| 永续合约 | 0.1% (10 bps) |
| 现货 | 1% (100 bps) |

---

## 7. maxBuilderFee 查询返回值转换

### 7.1 API 返回值格式

`maxBuilderFee` Info API 返回的数值单位是 `percentage * 1000`：

| 返回值 | 实际含义 |
|--------|---------|
| 100 | 0.1% (10 bps) |
| 50 | 0.05% (5 bps) |
| 1000 | 1% (100 bps) |

### 7.2 转换为基点

```typescript
async maxBuilderFee(user: string, builder: string): Promise<number> {
  const response = await this.client.info<number>({
    type: 'maxBuilderFee',
    user,
    builder,
  });
  // API 返回 percentage * 1000，转换为基点
  // 100 (API) = 0.1% = 10 bps
  return response / 10;
}
```

---

## 参考资料

- [HyperLiquid Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk)
- [HyperLiquid Builder Codes 文档](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes)
- [EIP-712 规范](https://eips.ethereum.org/EIPS/eip-712)
