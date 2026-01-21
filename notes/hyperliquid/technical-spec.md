# HyperLiquid DEX 技术方案文档

## 1. 概述

本文档详细说明如何集成 HyperLiquid API，实现基于 BuildCode 的 DEX 前端。

### 1.1 API 端点

| 网络 | REST API | WebSocket |
|------|----------|-----------|
| 主网 | `https://api.hyperliquid.xyz` | `wss://api.hyperliquid.xyz/ws` |
| 测试网 | `https://api.hyperliquid-testnet.xyz` | `wss://api.hyperliquid-testnet.xyz/ws` |

---

## 2. REST API 集成

### 2.1 Info 端点 (POST /info)

所有查询请求发送到 `/info` 端点，通过 `type` 字段区分请求类型。

#### 2.1.1 永续合约元数据

**请求**
```typescript
{
  "type": "meta"
}
```

**响应**
```typescript
{
  "universe": [
    {
      "name": "BTC",
      "szDecimals": 5,        // 数量小数位
      "maxLeverage": 50,      // 最大杠杆
      "onlyIsolated": false   // 是否仅支持逐仓
    },
    // ...
  ]
}
```

#### 2.1.2 永续合约元数据 + 上下文

**请求**
```typescript
{
  "type": "metaAndAssetCtxs"
}
```

**响应**
```typescript
[
  // meta 数据
  { "universe": [...] },
  // 资产上下文（每个资产的实时数据）
  [
    {
      "funding": "0.00001234",     // 当前资金费率
      "openInterest": "12345.67",  // 未平仓合约
      "prevDayPx": "90000.0",      // 前一天价格
      "dayNtlVlm": "1234567.89",   // 24h成交额
      "premium": "0.0001",         // 溢价
      "oraclePx": "90500.0",       // 预言机价格
      "markPx": "90480.0",         // 标记价格
      "midPx": "90475.0"           // 中间价
    },
    // ...
  ]
]
```

#### 2.1.3 现货元数据

**请求**
```typescript
{
  "type": "spotMeta"
}
```

**响应**
```typescript
{
  "tokens": [
    {
      "name": "USDC",
      "szDecimals": 6,
      "tokenId": "0x..."
    },
    // ...
  ],
  "universe": [
    {
      "name": "HYPE/USDC",
      "index": 0,
      "tokens": [150, 0]  // [base token index, quote token index]
    },
    // ...
  ]
}
```

#### 2.1.4 现货元数据 + 上下文

**请求**
```typescript
{
  "type": "spotMetaAndAssetCtxs"
}
```

#### 2.1.5 用户永续状态

**请求**
```typescript
{
  "type": "clearinghouseState",
  "user": "0x1234...abcd"
}
```

**响应**
```typescript
{
  "marginSummary": {
    "accountValue": "10000.0",     // 账户总值
    "totalNtlPos": "5000.0",       // 总持仓名义价值
    "totalRawUsd": "10000.0",      // 总 USD
    "totalMarginUsed": "500.0",    // 已用保证金
    "withdrawable": "9500.0"       // 可提取金额
  },
  "assetPositions": [
    {
      "type": "oneWay",
      "position": {
        "coin": "BTC",
        "szi": "0.1",              // 持仓数量（正=多，负=空）
        "entryPx": "90000.0",      // 开仓价格
        "leverage": {
          "type": "cross",
          "value": 10
        },
        "liquidationPx": "85000.0", // 清算价格
        "unrealizedPnl": "50.0",    // 未实现盈亏
        "returnOnEquity": "0.05"    // 收益率
      }
    }
  ]
}
```

#### 2.1.6 用户现货余额

**请求**
```typescript
{
  "type": "spotClearinghouseState",
  "user": "0x1234...abcd"
}
```

**响应**
```typescript
{
  "balances": [
    {
      "coin": "USDC",
      "token": 0,
      "hold": "0.0",        // 冻结
      "total": "1000.0",    // 总余额
      "entryNtl": "1000.0"  // 入场名义价值
    },
    // ...
  ]
}
```

#### 2.1.7 当前挂单

**请求**
```typescript
{
  "type": "openOrders",
  "user": "0x1234...abcd"
}
```

**响应**
```typescript
[
  {
    "coin": "BTC",
    "oid": 123456,           // 订单 ID
    "cloid": "my-order-1",   // 客户端订单 ID
    "side": "B",             // B=买, A=卖
    "limitPx": "90000.0",    // 限价
    "sz": "0.1",             // 数量
    "origSz": "0.1",         // 原始数量
    "timestamp": 1700000000000
  },
  // ...
]
```

#### 2.1.8 成交记录

**请求**
```typescript
{
  "type": "userFills",
  "user": "0x1234...abcd"
}
```

**响应**
```typescript
[
  {
    "coin": "BTC",
    "px": "90000.0",
    "sz": "0.1",
    "side": "B",
    "time": 1700000000000,
    "startPosition": "0.0",
    "dir": "Open Long",
    "closedPnl": "0.0",
    "fee": "0.9",
    "oid": 123456,
    "tid": 789012
  },
  // ...
]
```

#### 2.1.9 L2 订单簿

**请求**
```typescript
{
  "type": "l2Book",
  "coin": "BTC"
}
```

**响应**
```typescript
{
  "coin": "BTC",
  "time": 1700000000000,
  "levels": [
    [
      // bids (买单)
      [
        { "px": "89990.0", "sz": "1.5", "n": 3 },   // n = 订单数量
        { "px": "89980.0", "sz": "2.0", "n": 5 },
        // ...
      ],
      // asks (卖单)
      [
        { "px": "90000.0", "sz": "1.2", "n": 2 },
        { "px": "90010.0", "sz": "3.0", "n": 4 },
        // ...
      ]
    ]
  ]
}
```

#### 2.1.10 Builder 费率授权状态

**请求**
```typescript
{
  "type": "maxBuilderFee",
  "user": "0x1234...abcd",
  "builder": "0xBUILDER_ADDRESS"
}
```

**响应**
```typescript
{
  "maxFeeRate": "10"  // 10 = 1 基点 (0.01%)，null = 未授权
}
```

---

### 2.2 Exchange 端点 (POST /exchange)

所有交易操作发送到 `/exchange` 端点，需要签名。

#### 2.2.1 下单

**请求结构**
```typescript
{
  "action": {
    "type": "order",
    "orders": [
      {
        "a": 0,              // asset index (BTC = 0)
        "b": true,           // isBuy (true = 买/多, false = 卖/空)
        "p": "90000.0",      // 限价
        "s": "0.1",          // 数量
        "r": false,          // reduceOnly (只减仓)
        "t": {               // 订单类型
          "limit": {
            "tif": "Gtc"     // Gtc | Ioc | Alo
          }
        },
        "c": "my-cloid-1"    // 客户端订单ID (可选)
      }
    ],
    "grouping": "na",        // na | normalTpsl | positionTpsl
    "builder": {             // Builder 费用 (可选但推荐)
      "b": "0xBUILDER_ADDRESS",
      "f": 10                // 费率：10 = 1 基点
    }
  },
  "nonce": 1700000000000,    // 时间戳 nonce
  "signature": {
    "r": "0x...",
    "s": "0x...",
    "v": 27
  }
}
```

**订单类型详解**

```typescript
// 限价单
{ "limit": { "tif": "Gtc" } }  // Good Till Cancel
{ "limit": { "tif": "Ioc" } }  // Immediate or Cancel (市价单)
{ "limit": { "tif": "Alo" } }  // Add Liquidity Only (只挂单)

// 触发单 (止损/止盈)
{
  "trigger": {
    "isMarket": true,          // true = 触发后市价, false = 触发后限价
    "triggerPx": "85000.0",    // 触发价格
    "tpsl": "sl"               // sl = 止损, tp = 止盈
  }
}
```

**响应**
```typescript
{
  "status": "ok",
  "response": {
    "type": "order",
    "data": {
      "statuses": [
        {
          "resting": {
            "oid": 123456
          }
        }
        // 或
        {
          "filled": {
            "totalSz": "0.1",
            "avgPx": "90000.0",
            "oid": 123456
          }
        }
        // 或
        {
          "error": "Insufficient margin"
        }
      ]
    }
  }
}
```

#### 2.2.2 取消订单

**请求**
```typescript
{
  "action": {
    "type": "cancel",
    "cancels": [
      {
        "a": 0,          // asset index
        "o": 123456      // order id
      }
    ]
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

#### 2.2.3 按 CLOID 取消

**请求**
```typescript
{
  "action": {
    "type": "cancelByCloid",
    "cancels": [
      {
        "asset": 0,
        "cloid": "my-cloid-1"
      }
    ]
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

#### 2.2.4 修改订单

**请求**
```typescript
{
  "action": {
    "type": "modify",
    "oid": 123456,
    "order": {
      "a": 0,
      "b": true,
      "p": "90100.0",    // 新价格
      "s": "0.1",
      "r": false,
      "t": { "limit": { "tif": "Gtc" } }
    }
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

#### 2.2.5 设置杠杆

**请求**
```typescript
{
  "action": {
    "type": "updateLeverage",
    "asset": 0,
    "isCross": true,     // true = 全仓, false = 逐仓
    "leverage": 10
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

#### 2.2.6 授权 Builder 费用

**请求**
```typescript
{
  "action": {
    "type": "approveBuilderFee",
    "builder": "0xBUILDER_ADDRESS",
    "maxFeeRate": "100"  // 100 = 10 基点 (0.1%)
  },
  "nonce": 1700000000000,
  "signature": { ... }   // 使用 sign_user_signed_action
}
```

---

## 3. WebSocket 集成

### 3.1 连接管理

```typescript
class HyperliquidWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private reconnectAttempts = 0;
  private readonly maxReconnects = 5;
  private readonly reconnectDelay = 1000;

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.resubscribeAll();
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };

      this.ws.onclose = () => {
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };
    });
  }

  subscribe<T>(
    type: string,
    params: Record<string, any>,
    callback: (data: T) => void
  ): () => void {
    const key = this.getSubscriptionKey(type, params);

    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
      this.sendSubscribe(type, params);
    }

    this.subscriptions.get(key)!.add(callback);

    return () => {
      const callbacks = this.subscriptions.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.sendUnsubscribe(type, params);
          this.subscriptions.delete(key);
        }
      }
    };
  }

  private sendSubscribe(type: string, params: Record<string, any>) {
    this.send({
      method: 'subscribe',
      subscription: { type, ...params }
    });
  }

  private sendUnsubscribe(type: string, params: Record<string, any>) {
    this.send({
      method: 'unsubscribe',
      subscription: { type, ...params }
    });
  }

  private handleMessage(message: any) {
    const { channel, data } = message;
    const callbacks = this.subscriptions.get(channel);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }
}
```

### 3.2 订阅类型详解

#### 3.2.1 订单簿 (l2Book)

**订阅**
```typescript
{
  "method": "subscribe",
  "subscription": { "type": "l2Book", "coin": "BTC" }
}
```

**推送数据**
```typescript
{
  "channel": "l2Book",
  "data": {
    "coin": "BTC",
    "time": 1700000000000,
    "levels": [[bids], [asks]]
  }
}
```

#### 3.2.2 最近成交 (trades)

**订阅**
```typescript
{
  "method": "subscribe",
  "subscription": { "type": "trades", "coin": "BTC" }
}
```

**推送数据**
```typescript
{
  "channel": "trades",
  "data": [
    {
      "coin": "BTC",
      "side": "B",
      "px": "90000.0",
      "sz": "0.1",
      "time": 1700000000000,
      "hash": "0x..."
    }
  ]
}
```

#### 3.2.3 K线数据 (candle)

**订阅**
```typescript
{
  "method": "subscribe",
  "subscription": {
    "type": "candle",
    "coin": "BTC",
    "interval": "1m"  // 1m | 3m | 5m | 15m | 30m | 1h | 2h | 4h | 6h | 12h | 1d | 1w | 1M
  }
}
```

**推送数据**
```typescript
{
  "channel": "candle",
  "data": {
    "t": 1700000000000,  // 开盘时间
    "T": 1700000060000,  // 收盘时间
    "s": "BTC",
    "i": "1m",
    "o": "90000.0",      // 开盘价
    "c": "90100.0",      // 收盘价
    "h": "90150.0",      // 最高价
    "l": "89950.0",      // 最低价
    "v": "123.45",       // 成交量
    "n": 1234            // 成交笔数
  }
}
```

#### 3.2.4 所有中间价 (allMids)

**订阅**
```typescript
{
  "method": "subscribe",
  "subscription": { "type": "allMids" }
}
```

**推送数据**
```typescript
{
  "channel": "allMids",
  "data": {
    "mids": {
      "BTC": "90050.0",
      "ETH": "3000.0",
      // ...
    }
  }
}
```

#### 3.2.5 订单更新 (orderUpdates)

**订阅**
```typescript
{
  "method": "subscribe",
  "subscription": { "type": "orderUpdates", "user": "0x1234...abcd" }
}
```

**推送数据**
```typescript
{
  "channel": "orderUpdates",
  "data": [
    {
      "order": {
        "coin": "BTC",
        "oid": 123456,
        "side": "B",
        "limitPx": "90000.0",
        "sz": "0.1",
        "origSz": "0.1",
        "timestamp": 1700000000000
      },
      "status": "open",        // open | filled | canceled | rejected
      "statusTimestamp": 1700000000000
    }
  ]
}
```

#### 3.2.6 用户成交 (userFills)

**订阅**
```typescript
{
  "method": "subscribe",
  "subscription": { "type": "userFills", "user": "0x1234...abcd" }
}
```

#### 3.2.7 账户状态 (clearinghouseState)

**订阅**
```typescript
{
  "method": "subscribe",
  "subscription": { "type": "clearinghouseState", "user": "0x1234...abcd" }
}
```

---

## 4. 签名实现

### 4.1 EIP-712 签名

HyperLiquid 使用 EIP-712 类型化数据签名。有两种签名方法：

1. **sign_l1_action** - 用于交易操作（下单、取消等）
2. **sign_user_signed_action** - 用于用户授权操作（Builder 授权等）

### 4.2 签名实现代码

```typescript
import { signTypedData } from 'viem/actions';
import { WalletClient } from 'viem';

// 常量
const MAINNET_CHAIN_ID = 42161;  // Arbitrum
const TESTNET_CHAIN_ID = 421614; // Arbitrum Sepolia

// EIP-712 Domain
const getDomain = (isMainnet: boolean) => ({
  name: 'Exchange',
  version: '1',
  chainId: isMainnet ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID,
  verifyingContract: '0x0000000000000000000000000000000000000000'
});

// 签名 L1 Action (交易操作)
export async function signL1Action(
  walletClient: WalletClient,
  action: any,
  nonce: number,
  isMainnet: boolean
) {
  // 重要：地址必须小写
  const actionHash = hashAction(action);

  const types = {
    Agent: [
      { name: 'source', type: 'string' },
      { name: 'connectionId', type: 'bytes32' }
    ]
  };

  const message = {
    source: isMainnet ? 'a' : 'b',
    connectionId: actionHash
  };

  const signature = await walletClient.signTypedData({
    domain: getDomain(isMainnet),
    types,
    primaryType: 'Agent',
    message
  });

  return parseSignature(signature);
}

// 签名用户授权操作
export async function signUserSignedAction(
  walletClient: WalletClient,
  action: any,
  payloadTypes: any[],
  isMainnet: boolean
) {
  const types = {
    [action.type]: payloadTypes
  };

  const signature = await walletClient.signTypedData({
    domain: getDomain(isMainnet),
    types,
    primaryType: action.type,
    message: action
  });

  return parseSignature(signature);
}

// ApproveBuilderFee 签名
export async function signApproveBuilderFee(
  walletClient: WalletClient,
  builder: string,
  maxFeeRate: string,
  nonce: number,
  isMainnet: boolean
) {
  const action = {
    type: 'approveBuilderFee',
    hyperliquidChain: isMainnet ? 'Mainnet' : 'Testnet',
    signatureChainId: '0x66eee',
    builder: builder.toLowerCase(),  // 重要：小写
    maxFeeRate,
    nonce
  };

  const types = [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'signatureChainId', type: 'string' },
    { name: 'builder', type: 'address' },
    { name: 'maxFeeRate', type: 'string' },
    { name: 'nonce', type: 'uint64' }
  ];

  return signUserSignedAction(walletClient, action, types, isMainnet);
}

// 解析签名
function parseSignature(signature: string) {
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

// 移除尾随零 (重要)
export function floatToWire(x: number): string {
  const rounded = Math.round(x * 1e8) / 1e8;
  return rounded.toString();
}
```

### 4.3 签名注意事项

| 项目 | 要求 |
|------|------|
| 地址格式 | 必须小写 |
| 数字格式 | 移除尾随零（使用 `floatToWire`）|
| Nonce | 时间戳，必须在 (T - 2天, T + 1天) 窗口内 |
| Chain ID | 主网 42161，测试网 421614 |

---

## 5. BuildCode 集成

### 5.1 配置

```typescript
// lib/hyperliquid/constants.ts
export const BUILDER_CONFIG = {
  address: process.env.NEXT_PUBLIC_BUILDER_ADDRESS!,
  feeRate: 10,           // 10 = 1 基点 (0.01%)
  maxFeeRatePerps: 100,  // 100 = 10 基点 (0.1%)
  maxFeeRateSpot: 1000   // 1000 = 100 基点 (1%)
};
```

### 5.2 授权流程

```typescript
// hooks/useBuilder.ts
export function useBuilderApproval() {
  const { address } = useAccount();
  const walletClient = useWalletClient();

  // 检查授权状态
  const { data: isApproved } = useQuery({
    queryKey: ['builderApproval', address],
    queryFn: async () => {
      const result = await hyperliquidClient.getMaxBuilderFee(
        address!,
        BUILDER_CONFIG.address
      );
      return result.maxFeeRate !== null;
    },
    enabled: !!address
  });

  // 授权操作
  const approve = useMutation({
    mutationFn: async () => {
      const nonce = Date.now();
      const signature = await signApproveBuilderFee(
        walletClient.data!,
        BUILDER_CONFIG.address,
        BUILDER_CONFIG.maxFeeRatePerps.toString(),
        nonce,
        true  // isMainnet
      );

      return hyperliquidClient.approveBuilderFee({
        builder: BUILDER_CONFIG.address,
        maxFeeRate: BUILDER_CONFIG.maxFeeRatePerps.toString(),
        nonce,
        signature
      });
    }
  });

  return { isApproved, approve };
}
```

### 5.3 订单附加 Builder 参数

```typescript
// 构建订单时添加 builder 参数
const orderAction = {
  type: 'order',
  orders: [orderParams],
  grouping: 'na',
  builder: {
    b: BUILDER_CONFIG.address,
    f: BUILDER_CONFIG.feeRate
  }
};
```

---

## 6. 资产 ID 计算

### 6.1 永续合约

```typescript
// 直接使用 meta 返回的 index
const perpAssetId = perpMeta.universe.findIndex(u => u.name === 'BTC');
// BTC = 0, ETH = 1, ...
```

### 6.2 现货

```typescript
// 10000 + spotInfo.index
const spotIndex = spotMeta.universe.findIndex(u => u.name === 'HYPE/USDC');
const spotAssetId = 10000 + spotIndex;
// HYPE/USDC index = 0, 所以 assetId = 10000
```

### 6.3 Builder 部署的永续

```typescript
// 100000 + perp_dex_index * 10000 + index_in_meta
// 例如 test:ABC 在 testnet: perp_dex_index = 1, index = 0
const builderPerpAssetId = 100000 + 1 * 10000 + 0;  // = 110000
```

---

## 7. 错误处理

### 7.1 常见错误码

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Insufficient margin` | 保证金不足 | 减少数量或增加保证金 |
| `Invalid signature` | 签名错误 | 检查地址小写、尾随零 |
| `Order would cross` | 限价单会立即成交 | 使用 IOC 或调整价格 |
| `Rate limit exceeded` | 超过频率限制 | 降低请求频率 |
| `Nonce too old/new` | Nonce 不在有效窗口 | 使用当前时间戳 |

### 7.2 错误处理代码

```typescript
async function submitOrder(params: OrderParams) {
  try {
    const result = await hyperliquidClient.placeOrder(params);

    if (result.status === 'ok') {
      const status = result.response.data.statuses[0];

      if (status.error) {
        throw new Error(status.error);
      }

      return status.resting?.oid || status.filled?.oid;
    } else {
      throw new Error(result.response);
    }
  } catch (error) {
    // 用户友好的错误提示
    if (error.message.includes('Insufficient margin')) {
      toast.error('保证金不足，请减少数量或增加保证金');
    } else if (error.message.includes('Invalid signature')) {
      toast.error('签名失败，请重试');
    } else {
      toast.error(`下单失败: ${error.message}`);
    }
    throw error;
  }
}
```

---

## 8. 限流策略

### 8.1 API 限制

| 类型 | 限制 |
|------|------|
| REST API | 1200 请求/分钟 |
| WebSocket 订阅 | 无明确限制 |
| 订单操作 | 10 订单/秒 |

### 8.2 客户端限流

```typescript
// 使用简单的限流器
class RateLimiter {
  private timestamps: number[] = [];
  private readonly limit: number;
  private readonly window: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.window);

    if (this.timestamps.length >= this.limit) {
      const waitTime = this.timestamps[0] + this.window - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.timestamps.push(Date.now());
  }
}

// 使用
const orderRateLimiter = new RateLimiter(10, 1000);

async function placeOrder(params: OrderParams) {
  await orderRateLimiter.acquire();
  return hyperliquidClient.placeOrder(params);
}
```
