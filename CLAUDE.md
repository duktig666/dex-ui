# CLAUDE.md

本文件为 Claude Code 在处理本仓库代码时提供指导。

## 项目概述

基于 **HyperLiquid + BuildCode** 模式的第三方 DEX 前端，通过 BuildCode 机制获取用户交易手续费分成。

### 商业模式
- **收益来源**：BuildCode 机制获取交易手续费分成
- **费率上限**：永续合约 0.1%，现货交易 1%
- **前置条件**：Builder 地址需存入 100+ USDC

### 参考项目
- **HyperLiquid**: 底层交易协议
- **Based.one**: 同类 BuildCode 产品

## 语言规则

- **代码**: 英文（变量名、函数名），中文注释
- **文档**: 中文
- **回答**: 中文

## 前端技术栈

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| 核心框架 | React + Next.js App Router | UI + 文件路由 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 样式 | Tailwind CSS + Stitches | 原子化 CSS + CSS-in-JS |
| UI 组件 | shadcn/ui | 基于 Radix UI |
| K线图表 | TradingView | 专业金融图表 |
| 钱包连接 | Reown AppKit + wagmi | Web3 钱包集成 |
| 代码规范 | ESLint + Prettier | 语法检查 + 格式化 |

## 目录结构

```
dex-ui/
├── notes/
│   ├── hyperliquid/
│   │   ├── http/                    # HTTP 调试文件
│   │   │   ├── hyperliquid-query.http     # Info API 调试
│   │   │   ├── hyperliquid-exchange.http  # Exchange API 调试
│   │   │   └── http-client.env.json       # 环境配置
│   │   ├── exchange-api-guide.md    # Exchange API 开发指南
│   │   └── prd.md                   # 产品需求文档
│   ├── pre/                         # 前期调研材料
│   └── plan/                        # 实现计划
└── src/                             # 源代码
```

## HyperLiquid API

### API 端点

| 环境 | REST API | WebSocket |
|------|----------|-----------|
| 主网 | `https://api.hyperliquid.xyz` | `wss://api.hyperliquid.xyz/ws` |
| 测试网 | `https://api.hyperliquid-testnet.xyz` | `wss://api.hyperliquid-testnet.xyz/ws` |

### 主要端点

| 端点 | 用途 | 签名 |
|------|------|------|
| POST /info | 查询数据（元数据、订单簿、持仓等） | 无需 |
| POST /exchange | 交易操作（下单、取消、修改等） | 需要 EIP-712 |

### HTTP 调试

使用 IDE（如 IntelliJ/VS Code）执行 `.http` 文件进行 API 调试：

```
notes/hyperliquid/http/
├── hyperliquid-query.http      # Info API（无需签名）
├── hyperliquid-exchange.http   # Exchange API（需签名，仅格式参考）
└── http-client.env.json        # 环境配置（mainnet/testnet）
```

**环境选择**：`mainnet` / `mainnet-demo` / `testnet` / `testnet-demo`

### Info API 常用查询

| type | 用途 | 返回 |
|------|------|------|
| `meta` | 永续合约列表 | 交易对、精度、杠杆上限 |
| `metaAndAssetCtxs` | 永续 + 实时数据 | 资金费率、成交量、价格 |
| `spotMeta` | 现货代币/交易对 | 代币列表、精度 |
| `spotMetaAndAssetCtxs` | 现货 + 实时数据 | 价格、成交量 |
| `l2Book` | 订单簿 | 买卖盘深度 |
| `candleSnapshot` | K线数据 | OHLCV |
| `clearinghouseState` | 永续账户状态 | 余额、持仓、保证金 |
| `spotClearinghouseState` | 现货余额 | 代币余额 |
| `frontendOpenOrders` | 当前挂单 | 订单详情 |
| `maxBuilderFee` | Builder 授权状态 | 已授权费率 |

### Exchange API 操作类型

| type | 用途 | 签名方法 |
|------|------|----------|
| `order` | 下单 | signL1Action |
| `cancel` | 撤单 | signL1Action |
| `modify` | 修改订单 | signL1Action |
| `updateLeverage` | 更新杠杆 | signL1Action |
| `approveBuilderFee` | 授权 Builder 费率 | signUserSignedAction |
| `usdSend` | USDC 转账 | signUserSignedAction |
| `withdraw3` | 提现到 L1 | signUserSignedAction |
| `vaultDeposit` | 存入 Vault | signL1Action |
| `vaultWithdraw` | 取出 Vault | signL1Action |

> 详细参数见 `notes/hyperliquid/exchange-api-guide.md`

## BuildCode 集成流程

```
1. 用户连接钱包
   ↓
2. 查询 maxBuilderFee 检查授权状态
   ↓
3. 未授权 → 弹窗引导签名 approveBuilderFee
   ↓
4. 下单时附加 builder 参数: { b: "地址", f: 10 }
   ↓
5. 每笔成交自动收取费用
```

## 关键文档

| 文档 | 说明 |
|------|------|
| `notes/hyperliquid/prd.md` | 产品需求文档 |
| `notes/hyperliquid/exchange-api-guide.md` | Exchange API 开发指南 |
| `notes/hyperliquid/http/*.http` | API 调试文件 |

## HyperLiquid 官方文档

### 核心 API
- [Builder Codes](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes) - BuildCode 机制
- [Exchange Endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint) - 交易操作
- [Info - Perpetuals](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals) - 永续查询
- [Info - Spot](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot) - 现货查询
- [Signing](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing) - EIP-712 签名

### WebSocket
- [Subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions) - 订阅类型
- [Timeouts & Heartbeats](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/timeouts-and-heartbeats) - 连接保活

### 规范
- [Asset IDs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids) - 资产 ID（永续=index，现货=10000+index）
- [Tick & Lot Size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size) - 精度规则
- [Rate Limits](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits) - 频率限制
