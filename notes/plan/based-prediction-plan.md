# Based.one 预测市场分析计划

## 背景

用户需要详细分析 Based.one 的预测市场功能（https://app.based.one/predict），了解其技术实现方式。

## 研究结论

### 1. 核心发现：Based.one 集成 Polymarket

Based.one 的预测市场**并非原生 HyperLiquid 功能**，而是通过集成 **Polymarket** 实现：

| 特性 | 说明 |
|------|------|
| 集成时间 | 2025 年 11 月 |
| 集成方式 | Polymarket CLOB API + Gamma API |
| 资金流转 | 通过 HyperLiquid hypercore 实现永续↔预测市场账户互转 |
| 覆盖市场 | 政治、体育、加密货币、流行文化、商业、科学等 |

### 2. Polymarket 技术架构

**核心组件**：

| 组件 | 功能 | 说明 |
|------|------|------|
| CLOB API | 交易执行 | 中央限价订单簿，链下匹配+链上结算 |
| Gamma API | 市场发现 | 市场元数据、分类、成交量索引 |
| CTF | 代币标准 | Conditional Token Framework (ERC-1155) |
| UMA Oracle | 结算预言机 | 乐观预言机，用于市场结算 |

**API 端点**：

| 端点 | URL | 用途 |
|------|-----|------|
| CLOB REST | `https://clob.polymarket.com` | 下单、订单簿、成交 |
| CLOB WebSocket | `wss://ws-subscriptions-clob.polymarket.com` | 实时订阅 |
| Gamma API | `https://gamma-api.polymarket.com` | 市场列表、元数据 |

### 3. Polymarket CLOB API 详情

**认证机制**：
- L1 认证：私钥 EIP-712 签名（证明钱包所有权）
- L2 认证：API Key（程序化访问）

**订单模型**：
- 一个 Maker + 多个 Taker
- 价格改善收益归 Taker
- 链下撮合 + 链上原子交换

**费率**（当前）：
- Maker: 0 bps
- Taker: 0 bps

**客户端库**：
- TypeScript: `@polymarket/clob-client`
- Python: `py-clob-client`

### 4. Polymarket Gamma API 详情

**功能**：
- 市场发现和搜索
- 分类标签 (Tags)
- 成交量索引
- 市场元数据

**主要端点**：
- `GET /markets` - 获取市场列表
- `GET /events` - 获取事件数据
- `GET /tags` - 获取分类标签

### 5. Based.one 集成特点

1. **统一入口**：用户通过 Based.one 同时访问 HyperLiquid 交易和 Polymarket 预测市场
2. **资金互转**：利用 HyperLiquid hypercore 实现永续和预测市场账户间即时转账
3. **4合1空投**：同时积累 HyperLiquid S3、HyperUnit、Based Gold、Polymarket 积分
4. **多平台覆盖**：Web、桌面端、Telegram 统一体验

---

## 输出文档结构

创建文件：`notes/hyperliquid/based-prediction-market-analysis.md`

```markdown
# Based.one 预测市场技术分析

## 1. 概述
   - Based.one 预测市场简介
   - 与 Polymarket 的关系

## 2. Polymarket 技术架构
   ### 2.1 系统架构
   - 混合去中心化设计
   - CLOB + CTF + UMA Oracle

   ### 2.2 CLOB API
   - 端点
   - 认证
   - 订单模型
   - 代码示例

   ### 2.3 Gamma API
   - 端点
   - 市场发现
   - 代码示例

## 3. Based.one 集成实现
   ### 3.1 资金流转
   - HyperLiquid hypercore 集成
   - 账户互转机制

   ### 3.2 交易流程
   - 用户下单流程
   - 订单执行流程

   ### 3.3 多端支持
   - Web/Desktop/Telegram

## 4. 与 HyperLiquid HIP-3 对比
   - HIP-3（原生预测市场提案）
   - Polymarket 集成方案对比

## 5. 实现建议
   - 如需复刻预测市场功能的技术路线
```

---

## 执行步骤

1. **创建分析文档** `notes/hyperliquid/based-prediction-market-analysis.md`
   - 整合研究结论
   - 包含 Polymarket API 详细说明
   - 提供 TypeScript 代码示例

2. **更新 notes/README.md**
   - 添加预测市场分析文档链接

---

## 信息来源

- [Polymarket CLOB Documentation](https://docs.polymarket.com/developers/CLOB/introduction)
- [Polymarket CLOB Quickstart](https://docs.polymarket.com/developers/CLOB/quickstart)
- [Polymarket Gamma API Overview](https://docs.polymarket.com/developers/gamma-markets-api/overview)
- [Based.one Polymarket Integration - Polymark.et](https://polymark.et/product/based)
- [How Polymarket Works - RockNBlock](https://rocknblock.io/blog/how-polymarket-works-the-tech-behind-prediction-markets)

---

## 验证方式

1. 文档内容与 Polymarket 官方文档一致
2. API 端点可访问并返回数据
3. 代码示例语法正确
