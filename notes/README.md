# HyperLiquid DEX 开发文档指南

本目录包含 HyperLiquid DEX 前端开发所需的所有技术文档、API 参考和实现方案。

---

## 快速导航

### 按角色推荐

| 角色 | 推荐阅读顺序 |
|------|------------|
| **新人入门** | PRD → 实现计划 → API 技术方案 |
| **前端开发** | 类型定义 → HTTP 测试 → 页面映射 → 签名格式 |
| **交易功能开发** | Exchange API 指南 → 交易 HTTP 参考 → exchange.ts 类型 |
| **预测市场开发** | 预测市场分析 → Polymarket CLOB 文档 |
| **API 调试** | HTTP 测试文件 → 测试网指南 → 签名格式 |
| **产品理解** | PRD → Based 调研 → 技术栈分析 |

---

## 核心文档

### 1. API 参考 (必读)

| 文档 | 路径 | 说明 |
|------|------|------|
| **TypeScript 类型定义** | `src/types/hyperliquid/` | 所有 API 请求/响应的 TypeScript 类型，含 JSDoc 注释 |
| **查询 API 测试** | `hyperliquid/http/hyperliquid-query.http` | ⭐ /info 查询接口测试（可直接执行） |
| **交易 API 参考** | `hyperliquid/http/hyperliquid-exchange.http` | ⭐ /exchange 写操作格式参考（需签名） |
| **Exchange API 指南** | `hyperliquid/exchange-api-guide.md` | ⭐ 交易 API 开发指南（签名、下单、撤单等） |
| **页面-字段映射** | `hyperliquid/api-page-mapping.md` | UI 组件与 API 字段的对应关系表 |
| **API 技术方案** | `hyperliquid/based-hyperliquid-api-tech-claude.md` | 完整的 API 实现方案（2000+ 行） |

### 2. 项目规划

| 文档 | 路径 | 说明 |
|------|------|------|
| **产品需求文档** | `hyperliquid/prd.md` | 功能模块、优先级、用户故事 |
| **实现计划** | `plan/hyperliquid-dex-plan.md` | 开发计划、技术栈、里程碑 |
| **技术规格** | `hyperliquid/technical-spec.md` | API 集成详细规格 |
| **架构设计** | `hyperliquid/architecture.md` | 系统架构、组件设计 |

### 3. 调试与测试

| 文档 | 路径 | 说明 |
|------|------|------|
| **测试网指南** | `hyperliquid/hyperliquid-testnet-guide.md` | 测试网配置和调试方法 |
| **签名格式** | `hyperliquid/api-signature-format.md` | 签名常见错误和正确格式 |
| **环境配置** | `hyperliquid/http/http-client.env.json` | API 测试环境变量（含活跃测试地址） |

### 4. 扩展功能

| 文档 | 路径 | 说明 |
|------|------|------|
| **预测市场分析** | `hyperliquid/based-prediction-market-analysis.md` | ⭐ Based.one 预测市场技术分析（Polymarket 集成） |

---

## 文件结构

```
notes/
├── README.md                     # 本文件 - 阅读指南
│
├── hyperliquid/                  # HyperLiquid API 相关
│   ├── exchange-api-guide.md     # ⭐ Exchange API 开发指南（签名、下单）
│   ├── api-page-mapping.md       # ⭐ 页面-字段映射表
│   ├── based-hyperliquid-api-tech-claude.md  # ⭐ API 实现方案（详细）
│   ├── based-hyperliquid-api-tech-gpt.md     # API 实现方案（备用）
│   ├── based-prediction-market-analysis.md   # ⭐ 预测市场技术分析
│   ├── technical-spec.md         # 技术规格文档
│   ├── prd.md                    # 产品需求文档
│   ├── architecture.md           # 系统架构设计
│   ├── api-signature-format.md   # 签名格式说明
│   ├── hyperliquid-testnet-guide.md  # 测试网使用指南
│   └── http/
│       ├── hyperliquid-query.http     # ⭐ 查询 API 测试（/info）
│       ├── hyperliquid-exchange.http  # ⭐ 交易 API 参考（/exchange）
│       ├── hyperliquid-query-backup.http  # 备份
│       └── http-client.env.json       # 环境配置
│
├── plan/                         # 开发计划
│   ├── hyperliquid-dex-plan.md   # ⭐ 主开发计划
│   ├── api-plan.md               # API 集成计划
│   ├── hermes-landing-implementation.md  # Landing 页实现
│   └── image-optimization-summary.md     # 图片优化总结
│
├── pre/                          # 前期调研
│   ├── based-hyperliquid-pre.md  # Based.one + HyperLiquid 调研
│   ├── based_ui_tech_pre.md      # Based.one UI 技术调研
│   ├── hyperliquid_based_trading_api_ui_pre.md  # 交易 API 调研
│   └── api_pre.md                # API 初步调研
│
├── analysis/                     # 技术分析
│   └── based-one-tech-stack.md   # Based.one 技术栈分析
│
├── idea/                         # 想法记录
│   └── dex_think.md              # DEX 思考笔记
│
└── dex-fe-stack.md               # 前端技术栈选型
```

API - TsType
```
src/types/hyperliquid/            # TypeScript 类型定义
├── index.ts                      # ⭐ 统一导出 + 工具函数
├── info.ts                       # ⭐ /info API 类型（800+ 行）
├── exchange.ts                   # /exchange API 类型
└── websocket.ts                  # WebSocket 消息类型
```

---

## 推荐阅读路线

### 路线 A: 快速上手 API 开发

```
1. src/types/hyperliquid/index.ts
   └─ 了解类型导出和工具函数

2. hyperliquid/http/hyperliquid-query.http
   └─ 在 IDE 中执行请求，理解 API 结构

3. hyperliquid/api-page-mapping.md
   └─ 找到要开发的 UI 对应的 API 字段

4. src/types/hyperliquid/info.ts
   └─ 查看详细类型定义和字段说明
```

### 路线 B: 完整项目理解

```
1. hyperliquid/prd.md
   └─ 理解产品需求和功能模块

2. plan/hyperliquid-dex-plan.md
   └─ 了解技术栈和实现计划

3. hyperliquid/based-hyperliquid-api-tech-claude.md
   └─ 深入理解 API 实现细节

4. hyperliquid/architecture.md
   └─ 理解系统架构设计
```

### 路线 C: API 调试专用

```
1. hyperliquid/http/http-client.env.json
   └─ 配置测试环境（选择 testnet-demo）

2. hyperliquid/http/hyperliquid-query.http
   └─ 执行 API 请求测试

3. hyperliquid/hyperliquid-testnet-guide.md
   └─ 测试网配置和常见问题

4. hyperliquid/api-signature-format.md
   └─ 签名格式问题排查
```

### 路线 D: 交易功能开发 (下单/撤单/平仓)

```
1. hyperliquid/exchange-api-guide.md
   └─ 完整的 Exchange API 开发指南

2. hyperliquid/http/hyperliquid-exchange.http
   └─ 交易 API 请求格式参考

3. src/types/hyperliquid/exchange.ts
   └─ 交易相关 TypeScript 类型

4. hyperliquid/api-signature-format.md
   └─ EIP-712 签名实现和常见错误
```

### 路线 E: 预测市场开发

```
1. hyperliquid/based-prediction-market-analysis.md
   └─ Based.one 预测市场技术分析

2. Polymarket 官方文档
   └─ https://docs.polymarket.com/developers/CLOB/introduction

3. Polymarket 客户端库
   └─ @polymarket/clob-client (TypeScript)
```

---

## 关键 API 速查

### 查询 API (`/info`)

| 类型 | 用途 | 文档位置 |
|------|------|---------|
| `meta` | 永续合约列表 | HTTP:1.1, Types:MetaRequest |
| `metaAndAssetCtxs` | 永续 + 实时数据 | HTTP:1.2, Types:MetaAndAssetCtxsRequest |
| `l2Book` | 订单簿 | HTTP:2.1, Types:L2BookRequest |
| `candleSnapshot` | K 线数据 | HTTP:3.1, Types:CandleSnapshotRequest |
| `clearinghouseState` | 永续账户状态 | HTTP:6.1, Types:ClearinghouseStateRequest |
| `spotClearinghouseState` | 现货账户状态 | HTTP:7.3, Types:SpotClearinghouseStateRequest |
| `frontendOpenOrders` | 挂单详情 | HTTP:6.5, Types:FrontendOpenOrdersRequest |
| `userFills` | 成交记录 | HTTP:8.2, Types:UserFillsRequest |

### 交易 API (`/exchange`)

| 类型 | 用途 | 文档位置 |
|------|------|---------|
| `order` | 下单（永续/现货） | Guide:3.1, HTTP:1.1, Types:OrderAction |
| `cancel` | 撤单（按订单ID） | Guide:3.2, HTTP:1.2, Types:CancelAction |
| `cancelByCloid` | 撤单（按客户端ID） | Guide:3.2, HTTP:1.3, Types:CancelByCloidAction |
| `modify` | 修改订单 | Guide:3.3, HTTP:1.4, Types:ModifyAction |
| `updateLeverage` | 更新杠杆 | Guide:4.1, HTTP:2.1, Types:UpdateLeverageAction |
| `updateIsolatedMargin` | 更新逐仓保证金 | Guide:4.2, HTTP:2.2, Types:UpdateIsolatedMarginAction |
| *Bridge 合约* | **充值到 L2** | Guide:5.0, HTTP:3.0 |
| `usdSend` | USDC 转账 | Guide:5.1, HTTP:3.1, Types:UsdSendAction |
| `withdraw3` | 提现到 L1 | Guide:5.2, HTTP:3.2, Types:Withdraw3Action |
| `usdClassTransfer` | 永续↔现货互转 | Guide:5.3, HTTP:3.4, Types:UsdClassTransferAction |
| `approveBuilderFee` | 授权 Builder 费率 | Guide:7.2, HTTP:5.1, Types:ApproveBuilderFeeAction |
| `approveAgent` | 授权 API 钱包 | Guide:8.1, HTTP:6.1, Types:ApproveAgentAction |

### WebSocket 订阅

| 类型 | 用途 | 类型定义 |
|------|------|---------|
| `allMids` | 所有价格 | AllMidsSubscription |
| `l2Book` | 订单簿更新 | L2BookSubscription |
| `trades` | 实时成交 | TradesSubscription |
| `candle` | K 线更新 | CandleSubscription |
| `orderUpdates` | 订单状态 | OrderUpdatesSubscription |
| `webData2` | 组合数据 | WebData2Subscription |

---

## 测试地址

`http-client.env.json` 中配置了可用的测试地址：

| 环境 | 地址 | 说明 |
|------|------|------|
| `mainnet-demo` | `0x5b5d...a9b08` | 主网鲸鱼账户 ($49M+) |
| `testnet-demo` | `0x7684...a9b08` | 测试网活跃账户 ($23M+) |
| `testnet-zero` | `0x0000...0000` | 零地址（有现货余额） |

---

## 开发工具推荐

### IDE 插件

- **REST Client** (VS Code) - 执行 `.http` 文件
- **JetBrains HTTP Client** - WebStorm/IDEA 内置

### 执行 HTTP 测试

1. 打开 `hyperliquid/http/hyperliquid-query.http`
2. 选择环境（如 `testnet-demo`）
3. 点击 "Send Request" 执行

### 类型使用示例

```typescript
import {
  ClearinghouseStateResponse,
  MetaAndAssetCtxsResponse,
  calc24hChange,
  formatFundingRate,
} from '@/types/hyperliquid';

// 获取账户状态
const state: ClearinghouseStateResponse = await fetchInfo({
  type: 'clearinghouseState',
  user: address,
});

// 计算 24h 涨跌
const change = calc24hChange(midPx, prevDayPx);

// 格式化资金费率
const fundingDisplay = formatFundingRate(funding); // "0.01%"
```

---

## 常见问题

### Q: 如何找到某个 UI 字段对应的 API？

查看 `hyperliquid/api-page-mapping.md`，按页面和组件分类列出了所有字段映射。

### Q: API 请求返回 422 错误？

检查签名格式，参见 `hyperliquid/api-signature-format.md`。签名必须是 `{r, s, v}` 对象格式。

### Q: 如何区分永续和现货的资产 ID？

- 永续: `assetId = coinIndex` (如 BTC=0, ETH=1)
- 现货: `assetId = 10000 + marketIndex`

使用工具函数：
```typescript
import { getPerpAssetId, getSpotAssetId, isSpotAsset } from '@/types/hyperliquid';
```

### Q: WebSocket 如何保持连接？

每 15 秒发送 `{"method": "ping"}`，详见 `src/types/hyperliquid/websocket.ts` 中的 `DEFAULT_HEARTBEAT` 配置。

### Q: 如何充值 USDC 到 HyperLiquid？

充值不是 API 调用，而是 Arbitrum 链上的 ERC-20 转账：

1. 向 Bridge 合约转账 USDC（最低 5 USDC）
2. 主网 Bridge: `0x2df1c51e09aecf9cacb7bc98cb1742757f163df7`
3. 约 1 分钟自动到账 L2

详见 `hyperliquid/exchange-api-guide.md` 的 5.0 节。

---

## 更新日志

| 日期 | 更新内容 |
|------|---------|
| 2026-01-23 | 新增 Based.one 预测市场技术分析（Polymarket 集成方案） |
| 2026-01-23 | 补充充值 (Deposit via Bridge) 文档，完善资金操作说明 |
| 2026-01-22 | 新增 Exchange API 开发指南、交易 API HTTP 参考文件、更新 Withdraw3 类型 |
| 2026-01-22 | 创建 TypeScript 类型定义、增强 HTTP 测试文件、创建页面映射文档 |
| - | 初始化项目文档结构 |
