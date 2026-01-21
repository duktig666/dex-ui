# Based.one + HyperLiquid API 技术实现方案

本文档详细说明 Based.one 交易平台各功能与 HyperLiquid API 的对应关系，以及具体实现方式。

---

## 目录

1. [概述与 API 端点](#1-概述与-api-端点)
2. [合约交易页面](#2-合约交易页面)
3. [现货交易页面](#3-现货交易页面)
4. [投资组合页面](#4-投资组合页面)
5. [Builder Code 集成](#5-builder-code-集成)
6. [WebSocket 订阅管理](#6-websocket-订阅管理)
7. [签名实现](#7-签名实现)
8. [错误处理](#8-错误处理)

---

## 1. 概述与 API 端点

### 1.1 API 基础信息

| 网络 | REST API | WebSocket |
|------|----------|-----------|
| 主网 | `https://api.hyperliquid.xyz` | `wss://api.hyperliquid.xyz/ws` |
| 测试网 | `https://api.hyperliquid-testnet.xyz` | `wss://api.hyperliquid-testnet.xyz/ws` |

### 1.2 主要端点

| 端点 | 用途 | 方法 |
|------|------|------|
| `/info` | 查询数据（元数据、持仓、订单等） | POST |
| `/exchange` | 交易操作（下单、取消、修改等） | POST |

### 1.3 功能与 API 映射总览

| 页面 | 功能 | API 类型 | 端点/订阅 |
|------|------|---------|----------|
| 合约 | 市场元数据 | REST | `meta` / `metaAndAssetCtxs` |
| 合约 | 价格头部 | WebSocket | `allMids` |
| 合约 | 订单簿 | WebSocket | `l2Book` |
| 合约 | K线图表 | WebSocket | `candle` |
| 合约 | 最近成交 | WebSocket | `trades` |
| 合约 | 下单 | REST | `/exchange` order |
| 合约 | 取消订单 | REST | `/exchange` cancel |
| 合约 | 修改订单 | REST | `/exchange` modify |
| 合约 | 持仓列表 | REST+WS | `clearinghouseState` |
| 合约 | 当前挂单 | REST+WS | `openOrders` / `orderUpdates` |
| 合约 | 设置杠杆 | REST | `/exchange` updateLeverage |
| 现货 | 市场元数据 | REST | `spotMeta` / `spotMetaAndAssetCtxs` |
| 现货 | 余额 | REST | `spotClearinghouseState` |
| 现货 | 下单 | REST | `/exchange` order (assetId=10000+) |
| Portfolio | 账户总值 | REST | `clearinghouseState` + `spotClearinghouseState` |
| Portfolio | 订单历史 | REST | `historicalOrders` |
| Portfolio | 成交记录 | REST | `userFills` |
| Portfolio | 资金费率 | REST | `userFunding` |
| 全局 | Builder 授权 | REST | `/exchange` approveBuilderFee |

---

## 2. 合约交易页面

合约交易页面 URL 格式：`/BTC`、`/ETH` 等

### 2.1 市场元数据

#### 功能描述
获取所有永续合约的基础信息，包括交易对名称、杠杆限制、精度等。

#### API 对应

| 功能 | API 类型 | 端点 |
|------|---------|------|
| 获取所有永续元数据 | REST | `POST /info` type: `meta` |
| 获取元数据+实时上下文 | REST | `POST /info` type: `metaAndAssetCtxs` |

#### 请求示例

```typescript
// 获取永续合约元数据
const response = await fetch('https://api.hyperliquid.xyz/info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'meta' })
});

const meta = await response.json();
```

#### 响应示例

```typescript
// type: "meta" 响应
{
  "universe": [
    {
      "name": "BTC",           // 交易对名称
      "szDecimals": 5,         // 数量小数位
      "maxLeverage": 50,       // 最大杠杆
      "onlyIsolated": false    // 是否仅支持逐仓
    },
    {
      "name": "ETH",
      "szDecimals": 4,
      "maxLeverage": 50,
      "onlyIsolated": false
    }
    // ...
  ]
}

// type: "metaAndAssetCtxs" 响应
[
  { "universe": [...] },  // 同上
  [
    {
      "funding": "0.00001234",     // 当前资金费率
      "openInterest": "12345.67",  // 未平仓合约量
      "prevDayPx": "90000.0",      // 前日收盘价
      "dayNtlVlm": "1234567.89",   // 24h 成交额
      "premium": "0.0001",         // 溢价
      "oraclePx": "90500.0",       // 预言机价格
      "markPx": "90480.0",         // 标记价格
      "midPx": "90475.0"           // 中间价
    }
    // 每个资产一个对象，顺序与 universe 一致
  ]
]
```

#### 实现要点

```typescript
// 获取资产 ID (用于下单)
function getPerpAssetId(symbol: string, meta: Meta): number {
  return meta.universe.findIndex(u => u.name === symbol);
}

// 获取精度配置
function getAssetDecimals(symbol: string, meta: Meta): number {
  const asset = meta.universe.find(u => u.name === symbol);
  return asset?.szDecimals ?? 5;
}
```

---

### 2.2 价格头部 (Price Bar)

#### 功能描述
显示当前交易对的价格、24h涨跌幅、24h成交量、资金费率等信息。

#### API 对应

| 数据 | 获取方式 | 说明 |
|------|---------|------|
| 当前价格 | WebSocket `allMids` | 实时中间价 |
| 24h 涨跌幅 | REST `metaAndAssetCtxs` | `(midPx - prevDayPx) / prevDayPx` |
| 24h 成交量 | REST `metaAndAssetCtxs` | `dayNtlVlm` |
| 资金费率 | REST `metaAndAssetCtxs` | `funding` |
| 标记价格 | REST `metaAndAssetCtxs` | `markPx` |
| 预言机价格 | REST `metaAndAssetCtxs` | `oraclePx` |

#### WebSocket 订阅 - allMids

```typescript
// 订阅所有中间价
{
  "method": "subscribe",
  "subscription": { "type": "allMids" }
}

// 推送数据
{
  "channel": "allMids",
  "data": {
    "mids": {
      "BTC": "90050.5",
      "ETH": "3000.25",
      "HYPE": "25.123"
      // ...所有交易对
    }
  }
}
```

#### 实现示例

```typescript
// hooks/usePriceData.ts
export function usePriceData(symbol: string) {
  const [price, setPrice] = useState<string | null>(null);
  const [assetCtx, setAssetCtx] = useState<AssetCtx | null>(null);

  // REST: 获取初始数据和上下文
  const { data } = useQuery({
    queryKey: ['metaAndAssetCtxs'],
    queryFn: async () => {
      const res = await fetch('/info', {
        method: 'POST',
        body: JSON.stringify({ type: 'metaAndAssetCtxs' })
      });
      return res.json();
    },
    refetchInterval: 30000 // 30秒刷新一次
  });

  // WebSocket: 实时价格
  useEffect(() => {
    const unsubscribe = wsManager.subscribe('allMids', {}, (data) => {
      if (data.mids[symbol]) {
        setPrice(data.mids[symbol]);
      }
    });
    return unsubscribe;
  }, [symbol]);

  // 计算涨跌幅
  const priceChange = useMemo(() => {
    if (!assetCtx || !price) return null;
    const current = parseFloat(price);
    const prev = parseFloat(assetCtx.prevDayPx);
    return ((current - prev) / prev * 100).toFixed(2);
  }, [price, assetCtx]);

  return { price, priceChange, volume24h: assetCtx?.dayNtlVlm, funding: assetCtx?.funding };
}
```

---

### 2.3 订单簿 (Order Book)

#### 功能描述
显示买卖盘深度，实时更新。

#### API 对应

| 功能 | API 类型 | 端点/订阅 |
|------|---------|----------|
| 初始快照 | REST | `POST /info` type: `l2Book` |
| 实时更新 | WebSocket | `l2Book` |

#### REST 请求 - 获取快照

```typescript
// 请求
{
  "type": "l2Book",
  "coin": "BTC"
}

// 响应
{
  "coin": "BTC",
  "time": 1700000000000,
  "levels": [
    [
      // bids (买单) - 价格从高到低
      { "px": "89990.0", "sz": "1.5", "n": 3 },
      { "px": "89980.0", "sz": "2.0", "n": 5 },
      { "px": "89970.0", "sz": "0.8", "n": 2 }
    ],
    [
      // asks (卖单) - 价格从低到高
      { "px": "90000.0", "sz": "1.2", "n": 2 },
      { "px": "90010.0", "sz": "3.0", "n": 4 },
      { "px": "90020.0", "sz": "1.5", "n": 3 }
    ]
  ]
}
```

#### WebSocket 订阅

```typescript
// 订阅
{
  "method": "subscribe",
  "subscription": {
    "type": "l2Book",
    "coin": "BTC",
    "nLevels": 20  // 可选，默认 20，最大 100
  }
}

// 推送数据格式同上
```

#### 实现示例

```typescript
// hooks/useOrderBook.ts
export function useOrderBook(symbol: string) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);

  useEffect(() => {
    // 订阅 WebSocket
    const unsubscribe = wsManager.subscribe(
      'l2Book',
      { coin: symbol, nLevels: 20 },
      (data: WsBook) => {
        setOrderBook({
          bids: data.levels[0].map(level => ({
            price: level.px,
            size: level.sz,
            count: level.n
          })),
          asks: data.levels[1].map(level => ({
            price: level.px,
            size: level.sz,
            count: level.n
          })),
          time: data.time
        });
      }
    );

    return unsubscribe;
  }, [symbol]);

  // 计算买卖价差
  const spread = useMemo(() => {
    if (!orderBook?.bids.length || !orderBook?.asks.length) return null;
    const bestBid = parseFloat(orderBook.bids[0].price);
    const bestAsk = parseFloat(orderBook.asks[0].price);
    return ((bestAsk - bestBid) / bestBid * 100).toFixed(4);
  }, [orderBook]);

  return { orderBook, spread };
}
```

---

### 2.4 K线图表 (Trading Chart)

#### 功能描述
TradingView K线图表，支持多种时间周期。

#### API 对应

| 功能 | API 类型 | 端点/订阅 |
|------|---------|----------|
| 历史K线 | REST | `POST /info` type: `candleSnapshot` |
| 实时K线 | WebSocket | `candle` |

#### 支持的时间周期

| 周期代码 | 说明 |
|---------|------|
| 1m, 3m, 5m, 15m, 30m | 分钟级 |
| 1h, 2h, 4h, 8h, 12h | 小时级 |
| 1d, 3d, 1w, 1M | 日/周/月 |

#### REST 请求 - 历史K线

```typescript
// 请求
{
  "type": "candleSnapshot",
  "req": {
    "coin": "BTC",
    "interval": "1h",
    "startTime": 1699900000000,
    "endTime": 1700000000000
  }
}

// 响应
[
  {
    "t": 1699900000000,    // 开盘时间 (毫秒)
    "T": 1699903600000,    // 收盘时间
    "s": "BTC",            // 交易对
    "i": "1h",             // 周期
    "o": "89500.0",        // 开盘价
    "c": "90000.0",        // 收盘价
    "h": "90200.0",        // 最高价
    "l": "89400.0",        // 最低价
    "v": "1234.56",        // 成交量 (基础货币)
    "n": 5678              // 成交笔数
  }
  // ...
]
```

#### WebSocket 订阅

```typescript
// 订阅
{
  "method": "subscribe",
  "subscription": {
    "type": "candle",
    "coin": "BTC",
    "interval": "1h"
  }
}

// 推送数据 (格式同上)
{
  "channel": "candle",
  "data": {
    "t": 1700000000000,
    "T": 1700003600000,
    "s": "BTC",
    "i": "1h",
    "o": "90000.0",
    "c": "90100.0",
    "h": "90150.0",
    "l": "89950.0",
    "v": "123.45",
    "n": 1234
  }
}
```

#### TradingView Datafeed 实现

```typescript
// lib/tradingview/datafeed.ts
import { wsManager } from '../hyperliquid/websocket';

export const datafeed: IBasicDataFeed = {
  onReady: (callback) => {
    setTimeout(() => callback({
      supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '480', '720', '1D', '3D', '1W', '1M'],
      supports_time: true,
      supports_marks: false,
    }), 0);
  },

  resolveSymbol: async (symbolName, onResolve, onError) => {
    // 从 meta 获取资产信息
    const meta = await fetchMeta();
    const asset = meta.universe.find(u => u.name === symbolName);

    if (!asset) {
      onError('Symbol not found');
      return;
    }

    onResolve({
      name: symbolName,
      ticker: symbolName,
      description: `${symbolName} Perpetual`,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      minmov: 1,
      pricescale: Math.pow(10, 2), // 价格精度
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '480', '720', '1D', '3D', '1W', '1M'],
    });
  },

  getBars: async (symbolInfo, resolution, periodParams, onResult, onError) => {
    const { from, to } = periodParams;
    const interval = resolutionToInterval(resolution);

    try {
      const candles = await fetchCandles(symbolInfo.name, interval, from * 1000, to * 1000);

      const bars = candles.map(c => ({
        time: c.t,
        open: parseFloat(c.o),
        high: parseFloat(c.h),
        low: parseFloat(c.l),
        close: parseFloat(c.c),
        volume: parseFloat(c.v),
      }));

      onResult(bars, { noData: bars.length === 0 });
    } catch (error) {
      onError(error);
    }
  },

  subscribeBars: (symbolInfo, resolution, onTick, listenerGuid) => {
    const interval = resolutionToInterval(resolution);

    wsManager.subscribe('candle', { coin: symbolInfo.name, interval }, (data) => {
      onTick({
        time: data.t,
        open: parseFloat(data.o),
        high: parseFloat(data.h),
        low: parseFloat(data.l),
        close: parseFloat(data.c),
        volume: parseFloat(data.v),
      });
    });
  },

  unsubscribeBars: (listenerGuid) => {
    // 取消订阅逻辑
  }
};

// 分辨率转换
function resolutionToInterval(resolution: string): string {
  const map: Record<string, string> = {
    '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m',
    '60': '1h', '120': '2h', '240': '4h', '480': '8h', '720': '12h',
    'D': '1d', '1D': '1d', '3D': '3d', 'W': '1w', '1W': '1w', 'M': '1M', '1M': '1M'
  };
  return map[resolution] || '1h';
}
```

---

### 2.5 最近成交 (Recent Trades)

#### 功能描述
显示最近的成交记录，实时更新。

#### API 对应

| 功能 | API 类型 | 端点/订阅 |
|------|---------|----------|
| 历史成交 | REST | `POST /info` type: `recentTrades` |
| 实时成交 | WebSocket | `trades` |

#### REST 请求

```typescript
// 请求
{
  "type": "recentTrades",
  "coin": "BTC"
}

// 响应
[
  {
    "coin": "BTC",
    "side": "B",           // B=买, A=卖
    "px": "90000.0",       // 成交价
    "sz": "0.1",           // 成交量
    "time": 1700000000000, // 时间戳
    "hash": "0x..."        // 交易哈希
  }
  // ...
]
```

#### WebSocket 订阅

```typescript
// 订阅
{
  "method": "subscribe",
  "subscription": {
    "type": "trades",
    "coin": "BTC"
  }
}

// 推送数据
{
  "channel": "trades",
  "data": [
    {
      "coin": "BTC",
      "side": "B",
      "px": "90100.0",
      "sz": "0.05",
      "time": 1700000001000,
      "hash": "0x..."
    }
  ]
}
```

#### 实现示例

```typescript
// hooks/useRecentTrades.ts
export function useRecentTrades(symbol: string, limit: number = 50) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // 获取初始数据
    fetchRecentTrades(symbol).then(data => {
      setTrades(data.slice(0, limit));
    });

    // 订阅实时成交
    const unsubscribe = wsManager.subscribe('trades', { coin: symbol }, (newTrades) => {
      setTrades(prev => {
        const updated = [...newTrades, ...prev];
        return updated.slice(0, limit);
      });
    });

    return unsubscribe;
  }, [symbol, limit]);

  return trades;
}
```

---

### 2.6 下单功能 (Order Placement)

#### 功能描述
支持市价单、限价单、止损单、止盈单。

#### API 对应

| 功能 | API 端点 | action type |
|------|---------|-------------|
| 下单 | POST /exchange | `order` |

#### 请求格式

```typescript
// 完整下单请求
{
  "action": {
    "type": "order",
    "orders": [
      {
        "a": 0,                // asset index (BTC=0)
        "b": true,             // isBuy: true=买/做多, false=卖/做空
        "p": "90000.0",        // 限价 (市价单也需填写，用于滑点保护)
        "s": "0.1",            // 数量
        "r": false,            // reduceOnly: 只减仓
        "t": {                 // 订单类型
          "limit": {
            "tif": "Gtc"       // 时间有效性
          }
        },
        "c": "my-order-001"    // cloid: 客户端订单ID (可选)
      }
    ],
    "grouping": "na",          // 订单分组: na | normalTpsl | positionTpsl
    "builder": {               // Builder 费用 (推荐添加)
      "b": "0xBUILDER_ADDRESS",
      "f": 10                  // 费率: 10 = 1bp = 0.01%
    }
  },
  "nonce": 1700000000000,      // 时间戳 nonce
  "signature": {
    "r": "0x...",
    "s": "0x...",
    "v": 27
  }
}
```

#### 订单类型详解

```typescript
// 1. 限价单 (GTC - Good Till Cancel)
{
  "t": { "limit": { "tif": "Gtc" } }
}

// 2. 市价单 (IOC - Immediate or Cancel)
{
  "t": { "limit": { "tif": "Ioc" } }
}
// 注意: 市价单价格填写当前价格 ± 滑点

// 3. 只挂单 (ALO - Add Liquidity Only)
{
  "t": { "limit": { "tif": "Alo" } }
}

// 4. 止损单 (Stop Loss)
{
  "t": {
    "trigger": {
      "isMarket": true,        // true=触发后市价, false=触发后限价
      "triggerPx": "85000.0",  // 触发价格
      "tpsl": "sl"             // sl=止损
    }
  }
}

// 5. 止盈单 (Take Profit)
{
  "t": {
    "trigger": {
      "isMarket": true,
      "triggerPx": "95000.0",
      "tpsl": "tp"             // tp=止盈
    }
  }
}
```

#### 响应格式

```typescript
// 成功响应
{
  "status": "ok",
  "response": {
    "type": "order",
    "data": {
      "statuses": [
        // 挂单成功
        {
          "resting": {
            "oid": 123456       // 订单 ID
          }
        }
        // 或: 立即成交
        {
          "filled": {
            "totalSz": "0.1",
            "avgPx": "90000.0",
            "oid": 123456
          }
        }
        // 或: 错误
        {
          "error": "Insufficient margin"
        }
      ]
    }
  }
}
```

#### 实现示例

```typescript
// hooks/useSubmitOrder.ts
export function useSubmitOrder() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const submitOrder = async (params: OrderParams) => {
    // 1. 获取 asset index
    const assetId = getPerpAssetId(params.symbol);

    // 2. 构建订单
    const orderAction = {
      type: 'order',
      orders: [{
        a: assetId,
        b: params.side === 'buy',
        p: floatToWire(params.price),
        s: floatToWire(params.size),
        r: params.reduceOnly ?? false,
        t: buildOrderType(params),
        c: params.cloid
      }],
      grouping: 'na',
      builder: {
        b: BUILDER_ADDRESS,
        f: BUILDER_FEE_RATE
      }
    };

    // 3. 签名
    const nonce = Date.now();
    const signature = await signL1Action(walletClient, orderAction, nonce, IS_MAINNET);

    // 4. 提交
    const response = await fetch(`${API_URL}/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: orderAction,
        nonce,
        signature
      })
    });

    const result = await response.json();

    // 5. 处理结果
    if (result.status === 'ok') {
      const status = result.response.data.statuses[0];
      if (status.error) {
        throw new Error(status.error);
      }
      return status.resting?.oid || status.filled?.oid;
    } else {
      throw new Error(result.response);
    }
  };

  return { submitOrder };
}

// 构建订单类型
function buildOrderType(params: OrderParams) {
  if (params.orderType === 'market') {
    return { limit: { tif: 'Ioc' } };
  }
  if (params.orderType === 'limit') {
    return { limit: { tif: params.timeInForce || 'Gtc' } };
  }
  if (params.orderType === 'stopLoss') {
    return {
      trigger: {
        isMarket: params.triggerIsMarket ?? true,
        triggerPx: floatToWire(params.triggerPrice!),
        tpsl: 'sl'
      }
    };
  }
  if (params.orderType === 'takeProfit') {
    return {
      trigger: {
        isMarket: params.triggerIsMarket ?? true,
        triggerPx: floatToWire(params.triggerPrice!),
        tpsl: 'tp'
      }
    };
  }
}
```

---

### 2.7 取消订单

#### 功能描述
取消未成交的挂单。

#### API 对应

| 功能 | action type | 说明 |
|------|-------------|------|
| 按订单ID取消 | `cancel` | 使用 oid |
| 按客户端ID取消 | `cancelByCloid` | 使用 cloid |

#### 请求格式

```typescript
// 按 oid 取消
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

// 按 cloid 取消
{
  "action": {
    "type": "cancelByCloid",
    "cancels": [
      {
        "asset": 0,
        "cloid": "my-order-001"
      }
    ]
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

#### 响应格式

```typescript
{
  "status": "ok",
  "response": {
    "type": "cancel",
    "data": {
      "statuses": ["success"]  // 或 "error: ..."
    }
  }
}
```

---

### 2.8 修改订单

#### 功能描述
修改未成交订单的价格或数量。

#### 请求格式

```typescript
{
  "action": {
    "type": "modify",
    "oid": 123456,           // 要修改的订单 ID
    "order": {
      "a": 0,
      "b": true,
      "p": "90100.0",        // 新价格
      "s": "0.1",            // 新数量
      "r": false,
      "t": { "limit": { "tif": "Gtc" } }
    }
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

---

### 2.9 设置杠杆

#### 功能描述
为指定资产设置杠杆倍数和保证金模式（全仓/逐仓）。

#### 请求格式

```typescript
{
  "action": {
    "type": "updateLeverage",
    "asset": 0,              // asset index
    "isCross": true,         // true=全仓, false=逐仓
    "leverage": 10           // 杠杆倍数
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

#### 响应格式

```typescript
{
  "status": "ok",
  "response": {
    "type": "default"
  }
}
```

---

### 2.10 持仓列表

#### 功能描述
显示当前所有永续合约持仓。

#### API 对应

| 功能 | API 类型 | 端点/订阅 |
|------|---------|----------|
| 获取持仓 | REST | `POST /info` type: `clearinghouseState` |
| 实时更新 | WebSocket | `webData2` |

#### REST 请求

```typescript
// 请求
{
  "type": "clearinghouseState",
  "user": "0x1234...abcd"
}

// 响应
{
  "marginSummary": {
    "accountValue": "10000.0",      // 账户总值
    "totalNtlPos": "5000.0",        // 总持仓名义价值
    "totalRawUsd": "10000.0",       // 总 USD
    "totalMarginUsed": "500.0",     // 已用保证金
    "withdrawable": "9500.0"        // 可提取金额
  },
  "crossMarginSummary": {
    "accountValue": "10000.0",
    "totalNtlPos": "5000.0",
    "totalMarginUsed": "500.0"
  },
  "assetPositions": [
    {
      "type": "oneWay",
      "position": {
        "coin": "BTC",
        "szi": "0.1",               // 持仓数量 (正=多, 负=空)
        "entryPx": "90000.0",       // 开仓均价
        "leverage": {
          "type": "cross",          // cross=全仓, isolated=逐仓
          "value": 10,
          "rawUsd": "900.0"
        },
        "positionValue": "9050.0",
        "liquidationPx": "85000.0", // 清算价格
        "marginUsed": "905.0",
        "unrealizedPnl": "50.0",    // 未实现盈亏
        "returnOnEquity": "0.0553", // 收益率
        "maxLeverage": 50,
        "cumFunding": {
          "allTime": "1.23",
          "sinceChange": "0.12",
          "sinceOpen": "0.05"
        }
      }
    }
  ]
}
```

#### WebSocket 订阅 (推荐使用 webData2)

```typescript
// 订阅
{
  "method": "subscribe",
  "subscription": {
    "type": "webData2",
    "user": "0x1234...abcd"
  }
}

// 推送数据包含完整的用户状态
{
  "channel": "webData2",
  "data": {
    "clearinghouseState": { ... },
    "openOrders": [ ... ],
    // ...
  }
}
```

---

### 2.11 当前挂单

#### 功能描述
显示所有未成交的挂单。

#### API 对应

| 功能 | API 类型 | 端点/订阅 |
|------|---------|----------|
| 获取挂单 | REST | `POST /info` type: `openOrders` |
| 实时更新 | WebSocket | `orderUpdates` |

#### REST 请求

```typescript
// 请求
{
  "type": "openOrders",
  "user": "0x1234...abcd"
}

// 响应
[
  {
    "coin": "BTC",
    "oid": 123456,              // 订单 ID
    "cloid": "my-order-001",    // 客户端订单 ID
    "side": "B",                // B=买, A=卖
    "limitPx": "89000.0",       // 限价
    "sz": "0.1",                // 剩余数量
    "origSz": "0.2",            // 原始数量
    "timestamp": 1700000000000
  }
]
```

#### WebSocket 订阅 - orderUpdates

```typescript
// 订阅
{
  "method": "subscribe",
  "subscription": {
    "type": "orderUpdates",
    "user": "0x1234...abcd"
  }
}

// 推送数据
{
  "channel": "orderUpdates",
  "data": [
    {
      "order": {
        "coin": "BTC",
        "oid": 123456,
        "cloid": "my-order-001",
        "side": "B",
        "limitPx": "89000.0",
        "sz": "0.1",
        "origSz": "0.2",
        "timestamp": 1700000000000
      },
      "status": "open",            // open | filled | canceled | rejected
      "statusTimestamp": 1700000000000
    }
  ]
}
```

---

### 2.12 账户信息面板

#### 功能描述
显示账户余额、保证金使用情况、可用资金等。

#### 数据来源

所有数据来自 `clearinghouseState` 响应的 `marginSummary` 字段。

#### 字段映射

| 显示项 | 数据字段 | 说明 |
|-------|---------|------|
| 账户净值 | `marginSummary.accountValue` | 总账户价值 |
| 可用余额 | `marginSummary.withdrawable` | 可提取/可用于开仓 |
| 已用保证金 | `marginSummary.totalMarginUsed` | 持仓占用 |
| 未实现盈亏 | 所有持仓 `unrealizedPnl` 之和 | 浮盈浮亏 |
| 持仓价值 | `marginSummary.totalNtlPos` | 总持仓名义价值 |

---

## 3. 现货交易页面

现货交易页面 URL 格式：`/HYPE/USDC`、`/PURR/USDC` 等

### 3.1 现货元数据

#### API 对应

| 功能 | API 类型 | 端点 |
|------|---------|------|
| 获取现货元数据 | REST | `POST /info` type: `spotMeta` |
| 获取元数据+上下文 | REST | `POST /info` type: `spotMetaAndAssetCtxs` |

#### 请求示例

```typescript
// 请求
{ "type": "spotMeta" }

// 响应
{
  "tokens": [
    {
      "name": "USDC",
      "szDecimals": 6,
      "weiDecimals": 6,
      "index": 0,
      "tokenId": "0x..."
    },
    {
      "name": "HYPE",
      "szDecimals": 2,
      "weiDecimals": 8,
      "index": 150,
      "tokenId": "0x..."
    }
  ],
  "universe": [
    {
      "name": "HYPE/USDC",
      "tokens": [150, 0],    // [baseToken index, quoteToken index]
      "index": 0
    },
    {
      "name": "PURR/USDC",
      "tokens": [1, 0],
      "index": 1
    }
  ]
}
```

### 3.2 现货余额

#### API 对应

| 功能 | API 类型 | 端点 |
|------|---------|------|
| 获取现货余额 | REST | `POST /info` type: `spotClearinghouseState` |

#### 请求示例

```typescript
// 请求
{
  "type": "spotClearinghouseState",
  "user": "0x1234...abcd"
}

// 响应
{
  "balances": [
    {
      "coin": "USDC",
      "token": 0,
      "hold": "0.0",          // 冻结数量
      "total": "1000.0",      // 总余额
      "entryNtl": "1000.0"    // 入场名义价值
    },
    {
      "coin": "HYPE",
      "token": 150,
      "hold": "10.0",
      "total": "100.0",
      "entryNtl": "2500.0"
    }
  ]
}
```

### 3.3 现货资产 ID 计算

**重要：现货资产 ID = 10000 + spotMeta.universe 中的 index**

```typescript
// 获取现货资产 ID
function getSpotAssetId(pairName: string, spotMeta: SpotMeta): number {
  const index = spotMeta.universe.findIndex(u => u.name === pairName);
  if (index === -1) throw new Error(`Pair ${pairName} not found`);
  return 10000 + index;
}

// 示例
// HYPE/USDC index=0, 所以 assetId = 10000
// PURR/USDC index=1, 所以 assetId = 10001
```

### 3.4 现货下单

#### 与永续下单的区别

| 项目 | 永续合约 | 现货 |
|------|---------|------|
| 资产 ID | index | 10000 + index |
| 杠杆 | 支持 | 不支持 |
| 做空 | 支持 | 不支持 (只能卖出持有的) |
| reduceOnly | 适用 | 不适用 |
| Builder 费率上限 | 0.1% | 1% |

#### 请求示例

```typescript
// 现货买入 HYPE
{
  "action": {
    "type": "order",
    "orders": [
      {
        "a": 10000,            // HYPE/USDC asset ID (10000 + 0)
        "b": true,             // 买入
        "p": "25.50",          // 限价
        "s": "10",             // 数量
        "r": false,
        "t": { "limit": { "tif": "Gtc" } }
      }
    ],
    "grouping": "na",
    "builder": {
      "b": "0xBUILDER_ADDRESS",
      "f": 50                  // 现货可设更高费率，如 50 = 5bp = 0.05%
    }
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

### 3.5 现货订单簿与成交

与永续合约相同，使用 `l2Book` 和 `trades` 订阅，coin 参数使用交易对名称：

```typescript
// 订阅现货订单簿
{
  "method": "subscribe",
  "subscription": {
    "type": "l2Book",
    "coin": "HYPE/USDC"  // 现货使用完整交易对名称
  }
}

// 订阅现货成交
{
  "method": "subscribe",
  "subscription": {
    "type": "trades",
    "coin": "HYPE/USDC"
  }
}
```

---

## 4. 投资组合页面

投资组合页面 URL：`/portfolio`

### 4.1 账户总览

#### 功能描述
显示用户的总资产价值，包括永续和现货。

#### API 调用

需要同时调用两个 API：

```typescript
// 1. 永续账户状态
{
  "type": "clearinghouseState",
  "user": "0x..."
}

// 2. 现货账户状态
{
  "type": "spotClearinghouseState",
  "user": "0x..."
}
```

#### 计算总资产

```typescript
function calculateTotalAssets(perpState, spotState, prices) {
  // 永续账户价值
  const perpValue = parseFloat(perpState.marginSummary.accountValue);

  // 现货资产价值
  let spotValue = 0;
  for (const balance of spotState.balances) {
    const total = parseFloat(balance.total);
    if (balance.coin === 'USDC') {
      spotValue += total;
    } else {
      const price = prices[balance.coin] || 0;
      spotValue += total * price;
    }
  }

  return {
    perpValue,
    spotValue,
    totalValue: perpValue + spotValue
  };
}
```

### 4.2 永续持仓列表

数据来源：`clearinghouseState.assetPositions`

### 4.3 现货余额列表

数据来源：`spotClearinghouseState.balances`

### 4.4 订单历史

#### API 对应

| 功能 | API 类型 | 端点 |
|------|---------|------|
| 历史订单 | REST | `POST /info` type: `historicalOrders` |

#### 请求示例

```typescript
// 请求
{
  "type": "historicalOrders",
  "user": "0x1234...abcd"
}

// 响应
[
  {
    "coin": "BTC",
    "oid": 123456,
    "cloid": "my-order-001",
    "side": "B",
    "limitPx": "90000.0",
    "sz": "0.0",              // 剩余数量 (0 表示已完全成交或取消)
    "origSz": "0.1",
    "timestamp": 1700000000000,
    "orderType": "Limit",
    "tif": "Gtc",
    "closedPnl": "50.0",      // 已实现盈亏
    "status": "filled"        // filled | canceled | ...
  }
]
```

### 4.5 成交记录

#### API 对应

| 功能 | API 类型 | 端点 |
|------|---------|------|
| 用户成交 | REST | `POST /info` type: `userFills` |
| 实时成交 | WebSocket | `userFills` |

#### REST 请求

```typescript
// 请求
{
  "type": "userFills",
  "user": "0x1234...abcd"
}

// 响应
[
  {
    "coin": "BTC",
    "px": "90000.0",          // 成交价
    "sz": "0.1",              // 成交量
    "side": "B",              // B=买, A=卖
    "time": 1700000000000,
    "startPosition": "0.0",   // 成交前持仓
    "dir": "Open Long",       // 方向: Open Long/Short, Close Long/Short
    "closedPnl": "0.0",       // 已实现盈亏 (平仓时)
    "fee": "0.9",             // 手续费
    "feeToken": "USDC",
    "oid": 123456,
    "tid": 789012,            // 成交 ID
    "crossed": false,         // 是否吃单
    "hash": "0x..."
  }
]
```

#### WebSocket 订阅

```typescript
// 订阅
{
  "method": "subscribe",
  "subscription": {
    "type": "userFills",
    "user": "0x1234...abcd",
    "aggregateByTime": false   // 是否按时间聚合
  }
}
```

### 4.6 资金费率历史

#### API 对应

```typescript
// 请求
{
  "type": "userFunding",
  "user": "0x1234...abcd",
  "startTime": 1699000000000,
  "endTime": 1700000000000
}

// 响应
[
  {
    "time": 1700000000000,
    "coin": "BTC",
    "usdc": "1.23",           // 资金费 (正=支付, 负=收取)
    "szi": "0.1",             // 持仓数量
    "fundingRate": "0.0001"   // 资金费率
  }
]
```

### 4.7 转账历史

#### API 对应

```typescript
// 请求
{
  "type": "userNonFundingLedgerUpdates",
  "user": "0x1234...abcd",
  "startTime": 1699000000000,
  "endTime": 1700000000000
}

// 响应包含：存款、提款、内部转账等记录
```

---

## 5. Builder Code 集成

### 5.1 授权流程

#### 检查授权状态

```typescript
// 请求
{
  "type": "maxBuilderFee",
  "user": "0x用户地址",
  "builder": "0xBuilder地址"
}

// 响应
{
  "maxFeeRate": "10"   // 已授权的最大费率，null 表示未授权
}
```

#### 授权 Builder

```typescript
// 请求
{
  "action": {
    "type": "approveBuilderFee",
    "hyperliquidChain": "Mainnet",      // 或 "Testnet"
    "signatureChainId": "0xa4b1",       // 测试网: "0x66eee"
    "builder": "0xbuilder_address",     // 必须小写
    "maxFeeRate": "0.01%",              // 最大授权费率
    "nonce": 1700000000000
  },
  "nonce": 1700000000000,
  "signature": { ... }
}
```

**重要：ApproveBuilderFee 必须使用主钱包签名，不能使用 Agent 钱包。**

### 5.2 订单附加 Builder 参数

```typescript
// 所有订单都应附加 builder 参数
{
  "action": {
    "type": "order",
    "orders": [ ... ],
    "grouping": "na",
    "builder": {
      "b": "0xbuilder_address",  // Builder 地址 (小写)
      "f": 10                    // 费率: 10 = 1bp = 0.01%
    }
  },
  // ...
}
```

### 5.3 费率限制

| 交易类型 | 最大费率 | f 值范围 |
|---------|---------|---------|
| 永续合约 | 0.1% | 0-100 (100=10bp=0.1%) |
| 现货 | 1% | 0-1000 (1000=100bp=1%) |

### 5.4 完整授权流程实现

```typescript
// hooks/useBuilderApproval.ts
export function useBuilderApproval() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  // 检查授权状态
  const { data: isApproved, refetch } = useQuery({
    queryKey: ['builderApproval', address, BUILDER_ADDRESS],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'maxBuilderFee',
          user: address,
          builder: BUILDER_ADDRESS
        })
      });
      const data = await res.json();
      return data.maxFeeRate !== null;
    },
    enabled: !!address
  });

  // 授权操作
  const approve = useMutation({
    mutationFn: async () => {
      if (!walletClient) throw new Error('Wallet not connected');

      const nonce = Date.now();
      const action = {
        type: 'approveBuilderFee',
        hyperliquidChain: IS_MAINNET ? 'Mainnet' : 'Testnet',
        signatureChainId: IS_MAINNET ? '0xa4b1' : '0x66eee',
        builder: BUILDER_ADDRESS.toLowerCase(),
        maxFeeRate: MAX_FEE_RATE,
        nonce
      };

      // 使用 EIP-712 签名
      const signature = await signApproveBuilderFee(walletClient, action);

      const res = await fetch(`${API_URL}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          nonce,
          signature
        })
      });

      const result = await res.json();
      if (result.status !== 'ok') {
        throw new Error(result.response || 'Failed to approve builder');
      }

      return result;
    },
    onSuccess: () => {
      refetch();
    }
  });

  return { isApproved, approve };
}
```

---

## 6. WebSocket 订阅管理

### 6.1 连接管理

```typescript
// lib/hyperliquid/websocket.ts
class HyperliquidWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private reconnectAttempts = 0;
  private maxReconnects = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.resubscribeAll();
        resolve();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onclose = () => {
        console.log('WebSocket closed');
        this.stopHeartbeat();
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  // 心跳保活
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ method: 'ping' }));
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 订阅
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

    // 返回取消订阅函数
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

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(message: any) {
    // 处理 pong 响应
    if (message.channel === 'pong') return;

    // 处理订阅确认
    if (message.channel === 'subscriptionResponse') {
      console.log('Subscription confirmed:', message.data);
      return;
    }

    // 分发数据到回调
    const key = this.getChannelKey(message);
    const callbacks = this.subscriptions.get(key);
    if (callbacks) {
      callbacks.forEach(cb => cb(message.data));
    }
  }

  private getSubscriptionKey(type: string, params: Record<string, any>): string {
    return JSON.stringify({ type, ...params });
  }

  private getChannelKey(message: any): string {
    // 根据 channel 类型构建 key
    const { channel, data } = message;
    if (channel === 'l2Book') {
      return JSON.stringify({ type: 'l2Book', coin: data.coin });
    }
    if (channel === 'trades') {
      return JSON.stringify({ type: 'trades', coin: data[0]?.coin });
    }
    // ... 其他 channel
    return channel;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.connect(), delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private resubscribeAll() {
    for (const [key] of this.subscriptions) {
      const subscription = JSON.parse(key);
      const { type, ...params } = subscription;
      this.sendSubscribe(type, params);
    }
  }
}

// 导出单例
export const wsManager = new HyperliquidWebSocket(
  IS_MAINNET ? 'wss://api.hyperliquid.xyz/ws' : 'wss://api.hyperliquid-testnet.xyz/ws'
);
```

### 6.2 订阅类型汇总

| 订阅类型 | 参数 | 用途 |
|---------|------|------|
| `l2Book` | `coin`, `nLevels?` | 订单簿 |
| `trades` | `coin` | 最近成交 |
| `candle` | `coin`, `interval` | K线数据 |
| `allMids` | 无 | 所有中间价 |
| `bbo` | `coin` | 最优买卖价 |
| `orderUpdates` | `user` | 用户订单更新 |
| `userFills` | `user`, `aggregateByTime?` | 用户成交 |
| `webData2` | `user` | 用户完整数据 |

---

## 7. 签名实现

### 7.1 签名类型

HyperLiquid 使用两种 EIP-712 签名方式：

| 签名方法 | 用途 | 说明 |
|---------|------|------|
| `sign_l1_action` | 交易操作 | 下单、取消、修改等 |
| `sign_user_signed_action` | 用户授权 | ApproveBuilderFee 等 |

### 7.2 签名实现代码

```typescript
// lib/hyperliquid/signing.ts
import { WalletClient } from 'viem';
import { keccak256, encodeAbiParameters, parseAbiParameters } from 'viem';
import msgpack from 'msgpack-lite';

// 常量
const MAINNET_CHAIN_ID = 42161;
const TESTNET_CHAIN_ID = 421614;

// L1 Action 签名 (用于交易操作)
export async function signL1Action(
  walletClient: WalletClient,
  action: any,
  nonce: number,
  vaultAddress: string | null,
  isMainnet: boolean
) {
  // 1. msgpack 编码 action
  const actionBytes = msgpack.encode(action);

  // 2. 计算 action hash
  const actionHash = keccak256(actionBytes);

  // 3. 构建 phantom agent
  const source = isMainnet ? 'a' : 'b';
  const connectionId = computeConnectionId(actionHash, vaultAddress, nonce);

  // 4. EIP-712 签名
  const domain = {
    name: 'Exchange',
    version: '1',
    chainId: isMainnet ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID,
    verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`
  };

  const types = {
    Agent: [
      { name: 'source', type: 'string' },
      { name: 'connectionId', type: 'bytes32' }
    ]
  };

  const message = {
    source,
    connectionId
  };

  const signature = await walletClient.signTypedData({
    account: walletClient.account!,
    domain,
    types,
    primaryType: 'Agent',
    message
  });

  return parseSignature(signature);
}

// ApproveBuilderFee 签名
export async function signApproveBuilderFee(
  walletClient: WalletClient,
  action: {
    hyperliquidChain: string;
    signatureChainId: string;
    builder: string;
    maxFeeRate: string;
    nonce: number;
  },
  isMainnet: boolean
) {
  const domain = {
    name: 'HyperliquidSignTransaction',
    version: '1',
    chainId: isMainnet ? MAINNET_CHAIN_ID : TESTNET_CHAIN_ID,
    verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`
  };

  const types = {
    'HyperliquidTransaction:ApproveBuilderFee': [
      { name: 'hyperliquidChain', type: 'string' },
      { name: 'maxFeeRate', type: 'string' },
      { name: 'builder', type: 'address' },
      { name: 'nonce', type: 'uint64' }
    ]
  };

  const message = {
    hyperliquidChain: action.hyperliquidChain,
    maxFeeRate: action.maxFeeRate,
    builder: action.builder as `0x${string}`,
    nonce: BigInt(action.nonce)
  };

  const signature = await walletClient.signTypedData({
    account: walletClient.account!,
    domain,
    types,
    primaryType: 'HyperliquidTransaction:ApproveBuilderFee',
    message
  });

  return parseSignature(signature);
}

// 解析签名
function parseSignature(signature: string) {
  const r = signature.slice(0, 66);
  const s = '0x' + signature.slice(66, 130);
  const v = parseInt(signature.slice(130, 132), 16);

  return { r, s, v };
}

// 计算 connectionId
function computeConnectionId(
  actionHash: string,
  vaultAddress: string | null,
  nonce: number
): `0x${string}` {
  if (vaultAddress) {
    return keccak256(
      encodeAbiParameters(
        parseAbiParameters('bytes32, address, uint64'),
        [actionHash as `0x${string}`, vaultAddress as `0x${string}`, BigInt(nonce)]
      )
    );
  }
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('bytes32, uint64'),
      [actionHash as `0x${string}`, BigInt(nonce)]
    )
  );
}

// 移除尾随零 (重要!)
export function floatToWire(x: number): string {
  const rounded = Math.round(x * 1e8) / 1e8;
  return rounded.toString();
}
```

### 7.3 签名注意事项

| 事项 | 要求 |
|------|------|
| 地址格式 | 必须小写 |
| 数字格式 | 使用 `floatToWire` 移除尾随零 |
| Nonce | 时间戳，范围 (T - 2天, T + 1天) |
| msgpack 字段顺序 | 必须按特定顺序编码 |
| Chain ID | 主网 42161，测试网 421614 |

---

## 8. 错误处理

### 8.1 常见错误

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Insufficient margin` | 保证金不足 | 减少数量或增加保证金 |
| `Invalid signature` | 签名错误 | 检查地址小写、数字格式 |
| `Order would cross` | 限价单会立即成交 | 使用 IOC 或调整价格 |
| `Rate limit exceeded` | 超过频率限制 | 降低请求频率 |
| `Nonce too old/new` | Nonce 不在有效窗口 | 使用当前时间戳 |
| `User does not exist` | 账户未初始化 | 先存入资金激活账户 |
| `Builder not eligible` | Builder 资金不足 | Builder 需 100+ USDC |
| `Not authorized` | 未授权 Builder | 签署 ApproveBuilderFee |

### 8.2 错误处理实现

```typescript
// lib/hyperliquid/errors.ts
export class HyperliquidError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HyperliquidError';
  }
}

export function handleApiError(response: any): never {
  const message = response.response || response.error || 'Unknown error';

  // 解析特定错误
  if (message.includes('Insufficient margin')) {
    throw new HyperliquidError('保证金不足', 'INSUFFICIENT_MARGIN');
  }
  if (message.includes('Invalid signature')) {
    throw new HyperliquidError('签名无效，请重试', 'INVALID_SIGNATURE');
  }
  if (message.includes('Rate limit')) {
    throw new HyperliquidError('请求过于频繁，请稍后重试', 'RATE_LIMIT');
  }
  if (message.includes('User does not exist')) {
    throw new HyperliquidError('账户未激活，请先存入资金', 'USER_NOT_EXIST');
  }

  throw new HyperliquidError(message, 'UNKNOWN');
}

// 使用示例
async function submitOrder(params: OrderParams) {
  try {
    const result = await hyperliquidClient.placeOrder(params);

    if (result.status !== 'ok') {
      handleApiError(result);
    }

    const status = result.response.data.statuses[0];
    if (status.error) {
      handleApiError({ response: status.error });
    }

    return status;
  } catch (error) {
    if (error instanceof HyperliquidError) {
      // 显示用户友好的错误消息
      toast.error(error.message);
    } else {
      toast.error('下单失败，请重试');
    }
    throw error;
  }
}
```

---

## 参考资料

- [HyperLiquid API 文档](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
- [Builder Codes](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes)
- [Exchange Endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)
- [Info Endpoint - Perpetuals](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals)
- [Info Endpoint - Spot](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot)
- [WebSocket Subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions)
- [Signing](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing)
- [Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk)
