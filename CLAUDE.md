# CLAUDE.md

本文件为 Claude Code 在处理本仓库代码时提供指导。

## 项目概述

本项目用于**调研和分析 DEX API**，核心目标是基于 **HyperLiquid + BuildCode** 模式实现一套新的 DEX 前端。

### 核心目标
1. 分析 HyperLiquid 交易 API（REST + WebSocket）
2. 研究 Based.one 的实现方式
3. 基于 BuildCode 机制开发新的 DEX 前端

### 参考项目
- **HyperLiquid**: 高性能去中心化衍生品交易所
- **Based.one**: 基于 HyperLiquid BuildCode 的第三方交易平台

## 语言规则

- **代码**: 使用英文（变量名、函数名）注释使用中文
- **文档**: 使用中文（分析报告、设计文档、README）
- **回答**: 使用中文

## 目录结构

```
dex-api/
├── notes/
│   ├── pre/                # 前期调研材料
│   │   └── based-hyperliquid-pre.md
│   └── plan/               # 实现计划
│       └── hyperliquid-dex-plan.md
└── src/                    # 源代码（待开发）
```
## HyperLiquid API 概览

### REST API
- **主网**: `https://api.hyperliquid.xyz`
- **测试网**: `https://api.hyperliquid-testnet.xyz`

### WebSocket
- **地址**: `wss://api.hyperliquid.xyz/ws`

### 主要端点
| 端点 | 用途 |
|------|------|
| POST /info | 查询数据（元数据、订单簿、持仓等） |
| POST /exchange | 交易操作（下单、取消、修改等） |

## BuildCode 机制

BuildCode 允许第三方平台通过代发交易获取部分手续费：

1. **前置条件**: Builder 地址需存入 100+ USDC
2. **费率限制**: 永续最高 0.1%，现货最高 1%
3. **用户授权**: 首次交易需签署 `ApproveBuilderFee`
4. **订单附加**: 每笔订单携带 `builder` 参数

## 核心功能模块

1. **交易页面**: 永续合约 (`/BTC`) + 现货 (`/HYPE/USDC`)
2. **投资组合**: 余额、持仓、订单历史
3. **Vault**: 存入、取出、收益查看
4. **钱包**: 连接、签名、API 钱包管理

## 关键文档

- 实现计划: `notes/plan/hyperliquid-dex-plan.md`

## HyperLiquid API 参考文档

### 核心交易 API
| 文档 | 说明 |
|------|------|
| [Builder Codes](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes) | 第三方通过 BuildCode 获取交易费用收益 |
| [Exchange Endpoint](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint) | 交易操作 API（下单、取消、修改等） |
| [Info - Perpetuals](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals) | 永续合约查询 API |
| [Info - Spot](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot) | 现货交易查询 API |

### WebSocket
| 文档 | 说明 |
|------|------|
| [WebSocket 概览](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket) | WebSocket 连接基础 |
| [Subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions) | 订阅类型（订单簿、成交、K线等） |
| [Post Requests](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests) | 通过 WebSocket 发送请求 |
| [Timeouts & Heartbeats](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/timeouts-and-heartbeats) | 连接保活机制 |

### 概念与规范
| 文档 | 说明 |
|------|------|
| [Notation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/notation) | API 符号与术语说明 |
| [Asset IDs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids) | 资产 ID 规则（永续=index，现货=10000+index） |
| [Tick & Lot Size](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size) | 价格精度与数量精度 |
| [Nonces & API Wallets](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets) | Nonce 规则与 API 钱包 |
| [Signing](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing) | EIP-712 签名实现 |

### 补充文档
| 文档 | 说明 |
|------|------|
| [Error Responses](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/error-responses) | 错误码与处理 |
| [Rate Limits](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits) | 请求频率限制 |
| [Activation Gas Fee](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/activation-gas-fee) | 账户激活费用 |
| [Optimizing Latency](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/optimizing-latency) | 延迟优化建议 |
| [Bridge2](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/bridge2) | 跨链桥接口 |
| [HIP-1/HIP-2 Assets](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets) | 资产部署 |
| [HIP-3 Deployer](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions) | HIP-3 部署操作 |
