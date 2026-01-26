# EIP-712 签名修复更新日志

**日期**: 2025-01-23
**状态**: 已完成 (57 测试全部通过)

---

## 更新概览

| 文件 | 操作 | 修改内容 |
|------|------|----------|
| `eip712-signing-troubleshooting.md` | 新建 | 完整的签名故障排查指南 |
| `exchange-api-guide.md` | 修正 | 5 处关键错误 |
| `technical-spec.md` | 修正 | 5 处关键错误 |

---

## 一、新建文档

### `eip712-signing-troubleshooting.md`

完整的 EIP-712 签名故障排查指南，包含:

- 签名失败常见错误及解决方案
- L1Action vs UserSignedAction 区别
- Phantom Agent 签名模式详解
- 各操作类型的 EIP-712 配置表
- 字段顺序的重要性
- maxFeeRate 格式说明
- maxBuilderFee 返回值转换

---

## 二、exchange-api-guide.md 修正

| # | 位置 | 修正内容 |
|---|------|----------|
| 1 | 操作类型表 | `usdClassTransfer` 签名方法: `signL1Action` → `signUserSignedAction` |
| 2 | signL1Action 实现 | 重写为 Phantom Agent 模式 (domain.chainId: 1337) |
| 3 | APPROVE_BUILDER_FEE_TYPES | 字段顺序: `hyperliquidChain, maxFeeRate, builder, nonce` |
| 4 | primaryType | `HyperliquidTransaction` → `HyperliquidTransaction:ApproveBuilderFee` |
| 5 | 新增 | USD_CLASS_TRANSFER_TYPES 定义 + maxFeeRate 格式说明 |

---

## 三、technical-spec.md 修正

| # | 位置 | 修正内容 |
|---|------|----------|
| 1 | L1Action Domain | `chainId: 42161` → `chainId: 1337` (固定值) |
| 2 | signUserSignedAction | 添加正确的 domain 配置 |
| 3 | signApproveBuilderFee | 修正字段顺序和 primaryType |
| 4 | 签名说明表 | 添加 chainId 区分说明 |
| 5 | BuildCode 配置 | 修正 feeRate 注释说明 |

---

## 四、根本原因分析

### 4.1 approveBuilderFee 签名失败

**错误**: `Must deposit before performing actions` / `Percentage is invalid`

| 问题 | 原错误 | 正确实现 |
|------|--------|----------|
| 字段顺序 | `hyperliquidChain, builder, maxFeeRate, nonce` | `hyperliquidChain, maxFeeRate, builder, nonce` |
| primaryType | `HyperliquidTransaction` | `HyperliquidTransaction:ApproveBuilderFee` |
| maxFeeRate | `"10"` (基点) | `"0.1%"` (百分比带%后缀) |

### 4.2 usdClassTransfer 签名失败

**错误**: `422 - Failed to deserialize the JSON body`

| 问题 | 原错误 | 正确实现 |
|------|--------|----------|
| 签名方法 | `signL1Action` | `signUserSignedAction` |
| EIP-712 类型 | 未定义 | `HyperliquidTransaction:UsdClassTransfer` |
| action payload | 仅 `type, amount, toPerp` | 需要 `hyperliquidChain, signatureChainId` |

### 4.3 signL1Action 实现错误

**错误**: 直接签名 action hash

| 问题 | 原错误 | 正确实现 |
|------|--------|----------|
| Domain.name | `HyperliquidSignTransaction` | `Exchange` |
| Domain.chainId | 实际链 ID (42161/421614) | 固定值 `1337` |
| Types | `HyperliquidTransaction` | `Agent` (Phantom Agent) |
| Message | `{action, nonce, vaultAddress}` | `{source, connectionId}` |

---

## 五、关键配置参考

### 5.1 L1Action (Phantom Agent 模式)

```typescript
// Domain - 固定配置
const L1_ACTION_DOMAIN = {
  name: 'Exchange',           // 不是 'HyperliquidSignTransaction'
  version: '1',
  chainId: 1337,              // 固定值，不是实际链 ID
  verifyingContract: '0x0000000000000000000000000000000000000000',
};

// Types
const L1_ACTION_TYPES = {
  Agent: [
    { name: 'source', type: 'string' },      // 'a' = mainnet, 'b' = testnet
    { name: 'connectionId', type: 'bytes32' }, // action hash
  ],
};

// primaryType: 'Agent'
```

### 5.2 approveBuilderFee

```typescript
// Types - 字段顺序严格!
const APPROVE_BUILDER_FEE_TYPES = {
  'HyperliquidTransaction:ApproveBuilderFee': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'maxFeeRate', type: 'string' },   // "0.1%" 格式
    { name: 'builder', type: 'address' },
    { name: 'nonce', type: 'uint64' },
  ],
};

// primaryType: 'HyperliquidTransaction:ApproveBuilderFee'
```

### 5.3 usdClassTransfer

```typescript
// Types
const USD_CLASS_TRANSFER_TYPES = {
  'HyperliquidTransaction:UsdClassTransfer': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'toPerp', type: 'bool' },
    { name: 'nonce', type: 'uint64' },
  ],
};

// primaryType: 'HyperliquidTransaction:UsdClassTransfer'
```

---

## 六、验证结果

```bash
cd example/hyperliquid-api-test
pnpm test tests/exchange/

# 结果: 57 passed
```

---

## 参考文档

- [eip712-signing-troubleshooting.md](./eip712-signing-troubleshooting.md) - 详细故障排查指南
- [exchange-api-guide.md](./exchange-api-guide.md) - Exchange API 开发指南
- [technical-spec.md](./technical-spec.md) - 技术规范
- [HyperLiquid Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk) - 官方参考实现
