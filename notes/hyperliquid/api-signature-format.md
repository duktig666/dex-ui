# Hyperliquid API 签名格式问题解析

## 问题描述

在调用 Hyperliquid Exchange API 时，遇到以下错误：

```
Failed to deserialize the JSON body into the target type
```

HTTP 状态码：**422 Unprocessable Entity**

## 错误原因

Hyperliquid API 对请求体的 `signature` 字段有严格的格式要求。API 期望的是一个包含 `r`, `s`, `v` 三个字段的对象，而不是单一的签名字符串。

### ❌ 错误格式（字符串）

```json
{
  "action": { ... },
  "nonce": 1769047273966,
  "signature": "0xf5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e71c"
}
```

### ✅ 正确格式（对象）

```json
{
  "action": { ... },
  "nonce": 1769047273966,
  "signature": {
    "r": "0xf5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d",
    "s": "0x367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e7",
    "v": 28
  }
}
```

## 签名解析方法

EIP-712 签名是 65 字节（130 个十六进制字符，不含 `0x` 前缀），结构如下：

| 字段 | 长度 | 位置 |
|------|------|------|
| r | 32 bytes (64 hex) | 0-64 |
| s | 32 bytes (64 hex) | 64-128 |
| v | 1 byte (2 hex) | 128-130 |

### TypeScript 解析函数

```typescript
export interface ParsedSignature {
  r: string;
  s: string;
  v: number;
}

export function parseSignature(signature: string): ParsedSignature {
  // 移除 0x 前缀（如果有）
  const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
  
  const r = '0x' + sig.slice(0, 64);
  const s = '0x' + sig.slice(64, 128);
  const v = parseInt(sig.slice(128, 130), 16);

  return { r, s, v };
}
```

### 示例

输入签名字符串：
```
0xf5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e71c
```

解析结果：
```json
{
  "r": "0xf5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d",
  "s": "0x367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e7",
  "v": 28
}
```

> 注意：`v` 值 `0x1c` = 28（十进制）

## 其他常见问题

### 1. Builder 地址必须小写

Hyperliquid 要求所有以太坊地址必须使用**全小写**格式。

```typescript
// ❌ 错误
builder: { b: "0xEfc3a654A44FACd6dA111f3114CDd65F16d9a681", f: 1 }

// ✅ 正确
builder: { b: "0xefc3a654a44facd6da111f3114cdd65f16d9a681", f: 1 }
```

### 2. 费率格式

`maxFeeRate` 必须是字符串格式的百分比：

```typescript
// ❌ 错误
maxFeeRate: "0.0001%"  // 计算错误

// ✅ 正确
maxFeeRate: "0.01%"    // 1 basis point = 0.01%
```

### 3. 数字精度

价格和数量需要移除尾随零：

```typescript
// ❌ 可能有问题
price: "50000.00000000"

// ✅ 更好
price: "50000"
```

## 适用范围

**所有** Hyperliquid Exchange API 端点的签名都需要使用 `{r, s, v}` 格式，包括但不限于：

- `order` - 下单
- `cancel` - 撤单
- `modify` - 修改订单
- `batchModify` - 批量修改
- `updateLeverage` - 更新杠杆
- `updateIsolatedMargin` - 更新逐仓保证金
- `approveBuilderFee` - 授权 Builder 费率
- `approveAgent` - 授权 API 钱包
- `usdSend` - USDC 转账
- `withdraw3` - 提现

## 参考资料

- [Hyperliquid Python SDK - signing.py](https://github.com/hyperliquid-dex/hyperliquid-python-sdk/blob/master/hyperliquid/utils/signing.py)
- [Hyperliquid API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)

## 调试建议

1. **打印请求体**：在发送请求前打印完整的 JSON body，确认签名格式正确
2. **检查地址格式**：确保所有以太坊地址都是小写
3. **验证签名长度**：完整签名应该是 132 字符（包含 `0x` 前缀）
4. **检查 v 值**：通常是 27 或 28（0x1b 或 0x1c）

```typescript
// 调试日志示例
console.log('[postSigned] Request:', JSON.stringify({
  action,
  nonce,
  signature: parseSignature(signature)
}, null, 2));
```
