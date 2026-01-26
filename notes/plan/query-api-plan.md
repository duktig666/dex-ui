# HyperLiquid API 文档结构化方案

## 最终方案

采用 **TypeScript 类型定义 + 增强版 HTTP 测试文件 + 页面映射文档** 的综合方案。

### 文件结构

```
dex-ui/
├── src/types/hyperliquid/
│   ├── index.ts              # 统一导出
│   ├── info.ts               # /info API 请求和响应类型
│   ├── exchange.ts           # /exchange API 请求和响应类型
│   └── websocket.ts          # WebSocket 消息类型
│
└── notes/hyperliquid/
    ├── based-hyperliquid-api-tech-claude.md  # 现有：实现方案
    ├── api-page-mapping.md                   # 新增：页面-字段映射表
    └── http/
        └── hyperliquid-query.http            # 增强：添加详细字段注释
```

---

## 实施步骤

### 步骤 1: 增强 hyperliquid-query.http

在现有 HTTP 测试文件中添加详细的参数和响应字段说明：

```http
### 获取永续账户状态 (clearinghouseState)
#
# 请求参数:
#   type: "clearinghouseState"
#   user: string - 用户钱包地址 (42字符 0x开头)
#
# 响应结构:
#   marginSummary.accountValue    - 账户总价值 (USD)     → Portfolio: 账户净值
#   marginSummary.totalNtlPos     - 持仓名义价值 (USD)   → Portfolio: 持仓价值
#   marginSummary.totalMarginUsed - 已用保证金          → Portfolio: 已用保证金
#   withdrawable                  - 可提取金额          → Portfolio: 可用余额
#   assetPositions[].position:
#     .coin       - 交易对名称                         → 持仓列表: 币种
#     .szi        - 持仓数量 (正=多,负=空)             → 持仓列表: 数量
#     .entryPx    - 开仓均价                           → 持仓列表: 开仓价
#     .unrealizedPnl - 未实现盈亏                      → 持仓列表: 盈亏
#     .leverage.value - 杠杆倍数                       → 持仓列表: 杠杆
#     .liquidationPx  - 预估清算价                     → 持仓列表: 清算价
POST {{baseUrl}}/info
Content-Type: application/json

{
  "type": "clearinghouseState",
  "user": "{{userAddress}}"
}
```

### 步骤 2: 创建 TypeScript 类型定义

文件: `src/types/hyperliquid/info.ts`

```typescript
// ============================================================
// /info API 类型定义
// ============================================================

/** 请求类型联合 */
export type InfoRequest =
  | MetaRequest
  | MetaAndAssetCtxsRequest
  | ClearinghouseStateRequest
  | OpenOrdersRequest
  | SpotMetaRequest
  | SpotClearinghouseStateRequest;
// ... 更多

/** 永续元数据请求 */
export interface MetaRequest {
  type: 'meta';
}

/** 永续元数据 + 实时上下文请求 */
export interface MetaAndAssetCtxsRequest {
  type: 'metaAndAssetCtxs';
}

/** 用户永续账户状态请求 */
export interface ClearinghouseStateRequest {
  type: 'clearinghouseState';
  /** 用户钱包地址 (42字符 0x开头) */
  user: string;
}

// ============================================================
// 响应类型
// ============================================================

/** 永续合约资产 */
export interface PerpAsset {
  /** 交易对名称，如 "BTC", "ETH" */
  name: string;
  /** 数量精度小数位 (下单时需要按此精度取整) */
  szDecimals: number;
  /** 最大杠杆倍数 */
  maxLeverage: number;
  /** 是否仅支持逐仓模式 */
  onlyIsolated?: boolean;
}

/** 永续合约实时上下文 */
export interface AssetCtx {
  /** 资金费率 (8小时) - 页面显示需 ×100% */
  funding: string;
  /** 未平仓合约量 */
  openInterest: string;
  /** 前日收盘价 - 用于计算24h涨跌 */
  prevDayPx: string;
  /** 24h成交额 (USD) */
  dayNtlVlm: string;
  /** 溢价率 */
  premium: string;
  /** 预言机价格 */
  oraclePx: string;
  /** 标记价格 - 用于计算盈亏和清算 */
  markPx: string;
  /** 中间价 - 买一卖一的均价 */
  midPx: string;
}

/** metaAndAssetCtxs 响应 */
export type MetaAndAssetCtxsResponse = [{ universe: PerpAsset[] }, AssetCtx[]];

/** 账户保证金概要 */
export interface MarginSummary {
  /** 账户总价值 (USD) → Portfolio: 账户净值 */
  accountValue: string;
  /** 持仓名义价值 (USD) */
  totalNtlPos: string;
  /** 原始 USD 余额 */
  totalRawUsd: string;
  /** 已用保证金 → Portfolio: 已用保证金 */
  totalMarginUsed: string;
}

/** 单个持仓信息 */
export interface Position {
  /** 交易对名称 → 持仓列表: 币种 */
  coin: string;
  /** 持仓数量，正=多头，负=空头 → 持仓列表: 数量 */
  szi: string;
  /** 开仓均价 → 持仓列表: 开仓价 */
  entryPx: string;
  /** 杠杆配置 */
  leverage: {
    /** 模式: "cross"=全仓, "isolated"=逐仓 */
    type: 'cross' | 'isolated';
    /** 杠杆倍数 → 持仓列表: 杠杆 */
    value: number;
  };
  /** 持仓价值 (USD) */
  positionValue: string;
  /** 预估清算价格 → 持仓列表: 清算价 */
  liquidationPx: string | null;
  /** 未实现盈亏 → 持仓列表: 盈亏 */
  unrealizedPnl: string;
  /** 收益率 (ROE) */
  returnOnEquity: string;
}

/** clearinghouseState 响应 */
export interface ClearinghouseStateResponse {
  /** 保证金概要 */
  marginSummary: MarginSummary;
  /** 全仓保证金概要 */
  crossMarginSummary: MarginSummary;
  /** 可提取金额 → Portfolio: 可用余额 */
  withdrawable: string;
  /** 持仓列表 */
  assetPositions: Array<{
    type: 'oneWay';
    position: Position;
  }>;
  /** 响应时间戳 */
  time: number;
}
```

### 步骤 3: 创建页面-字段映射文档

文件: `notes/hyperliquid/api-page-mapping.md`

```markdown
# HyperLiquid API 页面-字段映射

## 1. 交易页面 (/BTC, /ETH)

### 1.1 价格头部

| UI 展示   | 字段路径                 | API                 | 计算/格式化                             |
| --------- | ------------------------ | ------------------- | --------------------------------------- |
| 当前价格  | `mids[symbol]`           | WS: allMids         | 直接显示                                |
| 24h涨跌%  | -                        | metaAndAssetCtxs    | `(midPx - prevDayPx) / prevDayPx × 100` |
| 24h最高   | -                        | candleSnapshot (1d) | `candle.h`                              |
| 24h最低   | -                        | candleSnapshot (1d) | `candle.l`                              |
| 24h成交额 | `assetCtxs[i].dayNtlVlm` | metaAndAssetCtxs    | 格式化为 K/M/B                          |
| 资金费率  | `assetCtxs[i].funding`   | metaAndAssetCtxs    | `× 100%` 显示                           |
| 标记价格  | `assetCtxs[i].markPx`    | metaAndAssetCtxs    | 直接显示                                |

### 1.2 订单簿

...
```

---

## 关键文件清单

| 文件                                            | 作用                 | 状态   |
| ----------------------------------------------- | -------------------- | ------ |
| `notes/hyperliquid/http/hyperliquid-query.http` | HTTP 测试 + 字段注释 | 待增强 |
| `src/types/hyperliquid/info.ts`                 | /info API 类型       | 待创建 |
| `src/types/hyperliquid/exchange.ts`             | /exchange API 类型   | 待创建 |
| `src/types/hyperliquid/websocket.ts`            | WebSocket 类型       | 待创建 |
| `notes/hyperliquid/api-page-mapping.md`         | 页面-字段映射表      | 待创建 |

---

## 执行顺序

1. **增强 hyperliquid-query.http** - 为每个 API 添加详细的请求参数和响应字段说明
2. **创建 TypeScript 类型文件** - 基于 HTTP 测试中的字段说明生成类型定义
3. **创建页面映射文档** - 整理 UI 组件与 API 字段的对应关系

---

## 验证方式

1. HTTP 测试文件可正常执行并返回数据
2. TypeScript 类型与实际 API 响应匹配
3. 页面映射文档覆盖所有核心功能点
