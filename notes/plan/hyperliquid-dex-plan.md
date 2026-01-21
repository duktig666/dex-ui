# HyperLiquid DEX 前端实现计划

## 概述

基于 HyperLiquid 交易 API 开发一个新的 DEX 前端，集成 BuildCode 功能以获取交易费用收益。项目将支持永续合约交易、现货交易、投资组合管理、Vault 功能和钱包集成。

---

## 相关文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| **PRD** | [`../prd.md`](../hyperliquid/prd.md) | 产品需求文档，功能模块、用户故事、优先级 |
| **架构设计** | [`../architecture.md`](../hyperliquid/architecture.md) | 系统架构、组件设计、数据流 |
| **技术方案** | [`../technical-spec.md`](../hyperliquid/technical-spec.md) | API 集成详情、签名实现、WebSocket |
| **测试网指南** | [`../testnet-guide.md`](../hyperliquid/hyperliquid-testnet-guide.md) | 测试网配置、调试方法 |

---

## 现有项目

- **dex-ui** (`/home/rsw/code/dex/dex-ui`)
- 已实现 Based.one 风格的静态交易页面
- 技术栈：Next.js 15 + React 19 + wagmi + @reown/appkit + TradingView
- 当前状态：使用 mock 数据，需要接入 HyperLiquid API

---

## 1. 技术栈

### 前端框架
- **Next.js 14** (App Router) - 服务端渲染、API 路由、TypeScript 支持
- **React 18** - 组件库

### 状态管理
- **Zustand** - 轻量级全局状态管理（用户、持仓、订单）
- **TanStack Query (React Query)** - 服务端状态缓存、实时更新

### UI 组件
- **Tailwind CSS** - 原子化 CSS 样式
- **Radix UI** - 无障碍无样式组件
- **react-grid-layout** - 可拖拽/可调整大小的交易组件（类似 Based.one）

### 图表
- **TradingView Widget** - 专业交易图表（嵌入式）

### 钱包集成
- **wagmi v2** + **viem** - 以太坊钱包连接
- **@reown/appkit** - 钱包 UI（原 WalletConnect 的 Web3Modal）

### WebSocket
- 原生 WebSocket 带重连逻辑
- 自定义 Hook 管理订阅

---

## 2. 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── (trading)/
│   │   ├── [symbol]/page.tsx     # 永续合约交易: /BTC, /ETH
│   │   └── [base]/[quote]/page.tsx # 现货交易: /HYPE/USDC
│   ├── portfolio/page.tsx        # 投资组合页面
│   ├── vaults/page.tsx           # Vault 列表
│   └── vaults/[address]/page.tsx # Vault 详情
│
├── components/
│   ├── trading/
│   │   ├── OrderForm.tsx         # 买入/卖出订单表单
│   │   ├── OrderBook.tsx         # L2 订单簿
│   │   ├── TradeHistory.tsx      # 最近成交
│   │   ├── Chart.tsx             # TradingView 图表
│   │   ├── PositionTable.tsx     # 当前持仓
│   │   ├── OrderTable.tsx        # 当前挂单
│   │   └── MarketHeader.tsx      # 价格、24h涨跌、资金费率
│   ├── portfolio/
│   │   ├── BalanceOverview.tsx   # 余额概览
│   │   ├── PositionList.tsx      # 持仓列表
│   │   ├── OrderHistory.tsx      # 历史订单
│   │   └── PnLChart.tsx          # 盈亏图表
│   ├── vault/
│   │   ├── VaultCard.tsx         # Vault 卡片
│   │   ├── VaultDeposit.tsx      # 存入
│   │   └── VaultWithdraw.tsx     # 取出
│   └── wallet/
│       ├── ConnectButton.tsx     # 连接钱包按钮
│       ├── AccountInfo.tsx       # 账户信息
│       └── ApiWalletManager.tsx  # API 钱包管理
│
├── lib/
│   ├── hyperliquid/
│   │   ├── client.ts             # REST API 客户端
│   │   ├── websocket.ts          # WebSocket 管理器
│   │   ├── signing.ts            # EIP-712 签名工具
│   │   ├── types.ts              # TypeScript 类型定义
│   │   ├── constants.ts          # 资产 ID、端点地址
│   │   └── utils.ts              # 价格/数量格式化
│   └── builder/
│       └── config.ts             # BuildCode 配置
│
├── hooks/
│   ├── useMarketData.ts          # 实时行情数据
│   ├── useOrderBook.ts           # L2 订单簿订阅
│   ├── useTrades.ts              # 成交推送
│   ├── usePositions.ts           # 用户持仓
│   ├── useOrders.ts              # 用户订单
│   └── useWallet.ts              # 钱包状态
│
└── stores/
    ├── userStore.ts              # 用户会话、钱包
    ├── marketStore.ts            # 当前市场、元数据
    └── settingsStore.ts          # UI 偏好设置
```

---

## 3. HyperLiquid API 集成

### 3.1 REST API 客户端

**基础配置：**
```typescript
const API_URL = {
  mainnet: 'https://api.hyperliquid.xyz',
  testnet: 'https://api.hyperliquid-testnet.xyz'
}
```

**Info 端点 (POST /info)：**

| 功能 | 请求类型 | 参数 |
|------|---------|------|
| 永续合约元数据 | `meta` | - |
| 现货元数据 | `spotMeta` | - |
| 永续合约 + 上下文 | `metaAndAssetCtxs` | - |
| 现货 + 上下文 | `spotMetaAndAssetCtxs` | - |
| 用户永续状态 | `clearinghouseState` | `user: 地址` |
| 用户现货状态 | `spotClearinghouseState` | `user: 地址` |
| 当前挂单 | `openOrders` | `user: 地址` |
| 成交记录 | `userFills` | `user: 地址` |
| 资金费率历史 | `fundingHistory` | `user: 地址, startTime, endTime` |
| L2 订单簿 | `l2Book` | `coin: 字符串` |
| 所有中间价 | `allMids` | - |
| Builder 费率 | `maxBuilderFee` | `user, builder` |

**Exchange 端点 (POST /exchange)：**

| 操作 | 类型 | 关键参数 |
|------|------|---------|
| 下单 | `order` | `orders[], grouping, builder?` |
| 取消订单 | `cancel` | `cancels[]` |
| 按 CLOID 取消 | `cancelByCloid` | `cancels[]` |
| 修改订单 | `modify` | `oid, order` |
| 更新杠杆 | `updateLeverage` | `asset, leverage, isCross` |
| 转账 | `usdClassTransfer` | `amount, toPerp` |
| 授权 Builder | `approveBuilderFee` | `builder, maxFeeRate` |

### 3.2 WebSocket 管理器

**连接地址：** `wss://api.hyperliquid.xyz/ws`

**关键订阅：**

```typescript
// 市场数据（公开）
{ type: 'l2Book', coin: 'BTC' }           // 订单簿
{ type: 'trades', coin: 'BTC' }            // 最近成交
{ type: 'allMids' }                        // 所有中间价
{ type: 'candle', coin: 'BTC', interval: '1m' }  // K线

// 用户数据（需要地址）
{ type: 'orderUpdates', user: address }    // 订单状态变更
{ type: 'userFills', user: address }       // 成交通知
{ type: 'clearinghouseState', user: address }  // 账户状态
{ type: 'webData3', user: address }        // 聚合用户信息
```

**消息格式：**
```typescript
// 订阅
{ method: 'subscribe', subscription: { type: '...', ... } }

// 取消订阅
{ method: 'unsubscribe', subscription: { type: '...', ... } }
```

### 3.3 交易签名

**两种签名方法：**
1. `sign_l1_action` - 用于交易操作（下单、取消）
2. `sign_user_signed_action` - 用于用户发起的操作（授权）

**关键要求：**
- 使用 EIP-712 类型化数据签名
- 签名前将地址转为小写
- 移除数字的尾随零
- Nonce 必须在 (T - 2天, T + 1天) 窗口内

---

## 4. BuildCode 集成

### Builder 账户设置（首先需要）

**前置条件：**
1. 创建一个新的以太坊钱包（或使用现有的）作为 Builder 地址
2. 向该地址的 HyperLiquid 永续账户存入至少 100 USDC
3. 该地址必须维持 100+ USDC 余额才能保持 Builder 资格

**设置步骤：**
1. 访问 https://app.hyperliquid.xyz 并连接你的 Builder 钱包
2. 通过跨链桥存入 USDC
3. 记下地址 - 这就是你的 `BUILDER_ADDRESS`

### 配置
```typescript
const BUILDER_CONFIG = {
  address: '0xYOUR_BUILDER_ADDRESS',  // 替换为你的 Builder 钱包
  feeRate: 10,  // 10 = 1 基点 (0.01%)
  maxFeePerps: 100,  // 最高 0.1%
  maxFeeSpot: 1000   // 最高 1%
}
```

### 实现流程

1. **首次用户授权：**
   - 提示用户签署 `ApproveBuilderFee` 操作
   - 本地存储授权状态

2. **带 Builder 的订单提交：**
   ```typescript
   {
     action: {
       type: 'order',
       orders: [...],
       grouping: 'na',
       builder: {
         b: BUILDER_CONFIG.address,
         f: BUILDER_CONFIG.feeRate
       }
     },
     nonce: timestamp,
     signature: { r, s, v }
   }
   ```

3. **费用追踪：**
   - 查询推荐状态：`{ type: 'referral', user: builderAddress }`
   - 下载成交记录：`stats-data.hyperliquid.xyz/Mainnet/builder_fills/{address}/{date}.csv.lz4`

---

## 5. 功能实现详情

### 5.1 永续合约交易页面 (`/[symbol]`)

**组件与 API 映射：**

| 组件 | 数据来源 | 更新方式 |
|------|---------|---------|
| MarketHeader | `metaAndAssetCtxs` | WS: `allMids` |
| Chart | `candleSnapshot` | WS: `candle` |
| OrderBook | `l2Book` | WS: `l2Book` |
| TradeHistory | `recentTrades` | WS: `trades` |
| OrderForm | - | Exchange: `order` |
| PositionTable | `clearinghouseState` | WS: `clearinghouseState` |
| OrderTable | `openOrders` | WS: `orderUpdates` |

**需要支持的订单类型：**
- 市价单 (IOC)
- 限价单 (GTC, 只挂单)
- 止损 / 止盈
- 只减仓

### 5.2 现货交易页面 (`/[base]/[quote]`)

**与永续合约的区别：**
- 使用 `spotMeta` / `spotMetaAndAssetCtxs` 获取元数据
- 使用 `spotClearinghouseState` 获取余额
- 资产 ID 计算：`10000 + spotInfo.index`
- MAX_DECIMALS = 8（永续为 6）
- 无杠杆、无资金费率

### 5.3 投资组合页面 (`/portfolio`)

**板块：**

1. **余额概览**
   - API：`clearinghouseState` + `spotClearinghouseState`
   - 显示：账户价值、已用保证金、可用余额

2. **持仓**
   - API：`clearinghouseState.assetPositions`
   - 显示：开仓价格、数量、未实现盈亏、清算价格

3. **当前挂单**
   - API：`openOrders`
   - 操作：取消单个/全部订单

4. **历史订单**
   - API：`historicalOrders` 带分页
   - 显示：已成交、已取消的订单

5. **成交历史**
   - API：`userFills`
   - 显示：已执行交易及手续费

### 5.4 Vault 功能 (`/vaults`)

**API：**
- 列出 Vault：`vaultDetails`（多个地址）
- 单个 Vault：`vaultDetails`（单个地址）
- 用户 Vault 信息：`userVaultEquities`

**操作：**
- 存入：Exchange 操作 `vaultDeposit`
- 取出：Exchange 操作 `vaultWithdraw`

### 5.5 钱包集成

**连接流程：**
1. 通过 wagmi/@reown/appkit 连接钱包
2. 检查现有的 Builder 费率授权
3. 如未授权，提示签署 `ApproveBuilderFee`
4. 将钱包状态存入 Zustand store

**API 钱包设置：**
- 可选：允许用户创建 API 钱包用于自动化交易
- 操作：`createSubAccount` + agent 钱包注册

---

## 6. 数据流架构

```
┌─────────────────┐     ┌─────────────────┐
│   用户钱包      │────▶│   签名层        │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   REST 客户端   │────▶│   API 响应      │────▶│  React Query    │
└─────────────────┘     └─────────────────┘     │  缓存           │
                                                 └────────┬────────┘
┌─────────────────┐     ┌─────────────────┐              │
│   WebSocket     │────▶│  Zustand Store  │◀─────────────┘
│   管理器        │     │  （实时数据）    │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │   React UI      │
                        │   组件          │
                        └─────────────────┘
```

---

## 7. 实现阶段

### 阶段 1：基础搭建
- [ ] 项目初始化（Next.js、TypeScript、Tailwind）
- [ ] HyperLiquid REST 客户端及所有 Info 端点
- [ ] 所有 API 响应的类型定义
- [ ] 带重连逻辑的 WebSocket 管理器

### 阶段 2：核心交易
- [ ] 钱包连接（wagmi + @reown/appkit）
- [ ] 交易签名工具
- [ ] BuildCode 集成
- [ ] 永续合约交易页面（订单表单、订单簿、成交）

### 阶段 3：完整交易功能
- [ ] 图表集成（TradingView）
- [ ] 持仓管理
- [ ] 订单管理（修改、取消）
- [ ] 现货交易页面

### 阶段 4：投资组合
- [ ] 余额概览
- [ ] 带盈亏的持仓列表
- [ ] 历史订单
- [ ] 成交历史

### 阶段 5：高级功能
- [ ] Vault 列表和管理
- [ ] API 钱包创建
- [ ] 设置和偏好
- [ ] 移动端响应式布局

---

## 8. 验证计划

### API 集成测试
1. 测试所有 Info 端点返回有效数据
2. 验证 WebSocket 订阅正常工作
3. 测试订单签名产生有效签名（与 Python SDK 对比）

### 交易流程测试
1. 下限价单（永续）
2. 取消订单
3. 下市价单
4. 验证 Builder 费用已包含
5. 测试现货订单流程

### 端到端测试
1. 在测试网连接钱包
2. 授权 Builder 费率
3. 执行完整交易流程
4. 验证持仓正确更新
5. 测试 Vault 存入/取出

---

## 9. 关键文件参考

**HyperLiquid SDK 参考（用于签名实现）：**
- Python SDK 类型：`hyperliquid-python-sdk/hyperliquid/utils/types.py`
- Python SDK 签名：`hyperliquid-python-sdk/hyperliquid/utils/signing.py`
- WebSocket 管理器：`hyperliquid-python-sdk/hyperliquid/websocket_manager.py`

**API 文档链接：**
- Exchange 端点：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint
- Info 端点（永续）：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals
- Info 端点（现货）：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot
- WebSocket：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
- 签名：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing
