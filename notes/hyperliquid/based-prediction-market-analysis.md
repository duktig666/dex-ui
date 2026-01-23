# Based.one 预测市场技术分析

> 分析时间: 2026-01-23
> 目标: 分析 Based.one 预测市场 (https://app.based.one/predict) 的技术实现

---

## 1. 概述

### 1.1 核心发现

**Based.one 的预测市场功能并非 HyperLiquid 原生功能，而是通过集成 Polymarket 实现。**

| 特性 | 说明 |
|------|------|
| 集成时间 | 2025 年 11 月 |
| 集成方式 | Polymarket CLOB API + Gamma API |
| 资金流转 | 通过 HyperLiquid hypercore 实现账户互转 |
| 覆盖市场 | 政治、体育、加密货币、流行文化、商业、科学 |

### 1.2 Based.one 定位

Based.one 将自己定位为 "4-in-1 空投农场" 平台：

1. **HyperLiquid S3** - HyperLiquid 积分
2. **HyperUnit** - 社区积分
3. **Based Gold** - 平台积分
4. **Polymarket 积分** - 预测市场积分

### 1.3 与 HyperLiquid 的关系

```
┌─────────────────────────────────────────────────────────────┐
│                        Based.one                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │  HyperLiquid 交易    │    │   Polymarket 预测市场        │ │
│  │  - 永续合约          │    │   - 政治/体育/加密等市场     │ │
│  │  - 现货交易          │    │   - CLOB 订单簿             │ │
│  │  - BuildCode 收益    │    │   - 条件代币交易            │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│              ↑                           ↑                   │
│              └─────── hypercore 资金互转 ──────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Polymarket 平台详解

### 2.1 平台概述

**Polymarket** 是全球最大的去中心化预测市场平台，用户可以通过买卖代表事件结果概率的"股份"来对未来事件进行预测和投注。

| 属性 | 说明 |
|------|------|
| **创始人** | Shayne Coplan（2020年创立，原名 Union.market） |
| **底层网络** | Polygon（以太坊 L2） |
| **抵押品** | USDC 稳定币 |
| **市场类型** | 政治、体育、加密货币、流行文化、商业、科学等 |
| **估值** | ~$8B（2025年10月，ICE 投资后） |

### 2.2 发展历程

| 时间 | 事件 |
|------|------|
| **2020 年初** | Shayne Coplan 创立 Union.market（后更名 Polymarket） |
| **2021 年 10 月** | CFTC 对 Polymarket 展开调查 |
| **2022 年 1 月** | 与 CFTC 达成和解，支付 $1.4M 罚款，禁止美国用户 |
| **2024 年** | 美国大选市场爆发，交易量超 $33 亿 |
| **2024 年** | Nate Silver（FiveThirtyEight 创始人）成为顾问 |
| **2025 年 7 月** | 收购 QCEX（CFTC 监管的衍生品交易所） |
| **2025 年 9 月** | CFTC 发布无行动函，允许美国运营 |
| **2025 年 10 月** | ICE（纽交所母公司）投资高达 $20 亿 |
| **2025 年 11 月** | 获得 CFTC 指定合约市场（DCM）资质 |
| **2025 年** | 与 X（Twitter）、道琼斯达成合作 |

### 2.3 关键数据（2025年）

| 指标 | 数值 |
|------|------|
| 月交易量 | $27.6 亿（2025年10月） |
| 活跃交易者 | 44.5 万+ |
| 累计交易量 | $100 亿+ |
| 市场数量 | 数千个活跃市场 |

### 2.4 市场运作原理

#### 2.4.1 基本概念

每个预测市场都有两个或多个可能的结果，用户可以买卖代表每个结果的"股份"（代币）：

```
┌─────────────────────────────────────────────────────────────┐
│                    预测市场示例                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  问题: "2026年美国总统是共和党人？"                           │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │     Yes 代币         │    │     No 代币          │        │
│  │                     │    │                     │        │
│  │  当前价格: $0.52     │    │  当前价格: $0.48     │        │
│  │  隐含概率: 52%       │    │  隐含概率: 48%       │        │
│  │                     │    │                     │        │
│  │  如果共和党赢:       │    │  如果共和党输:        │        │
│  │  价值 = $1.00       │    │  价值 = $1.00        │        │
│  │                     │    │                     │        │
│  │  如果共和党输:       │    │  如果共和党赢:        │        │
│  │  价值 = $0.00       │    │  价值 = $0.00        │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
│  注意: Yes 价格 + No 价格 ≈ $1.00                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2.4.2 价格机制

- **价格范围**: $0.01 - $1.00
- **价格含义**: 价格 = 市场认为该结果发生的概率
- **动态定价**: 没有固定赔率，价格随买卖供需变化
- **结算规则**: 正确结果的代币价值 $1，错误结果价值 $0

#### 2.4.3 盈利方式

| 策略 | 说明 | 示例 |
|------|------|------|
| **持有到期** | 买入后等待事件结束 | 以 $0.60 买入 Yes，事件发生后获得 $1.00，利润 $0.40 |
| **中途卖出** | 价格上涨后卖出 | 以 $0.50 买入，价格涨到 $0.70 时卖出，利润 $0.20 |
| **做市** | 同时挂买卖单赚取价差 | 买价 $0.49，卖价 $0.51，赚取 $0.02 价差 |

### 2.5 市场类别

| 类别 | 示例市场 |
|------|----------|
| **政治** | 总统大选、国会选举、政策变化 |
| **体育** | NFL、NBA、足球比赛结果 |
| **加密货币** | BTC 价格、ETF 批准、协议升级 |
| **流行文化** | 名人事件、电影票房、奖项 |
| **商业** | 公司财报、并购、IPO |
| **科学/技术** | AI 进展、太空探索、气候数据 |

---

## 3. Polymarket 技术架构

### 3.1 系统架构概述

Polymarket 采用**混合去中心化 (Hybrid-Decentralized)** 架构：

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         Polymarket 完整架构                               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                         用户层                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │  │
│  │  │  Web 前端    │  │  移动端 App │  │  API 客户端  │                │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │  │
│  └─────────┼────────────────┼────────────────┼───────────────────────┘  │
│            │                │                │                          │
│            ▼                ▼                ▼                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                       API 层 (链下)                                 │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────┐    ┌─────────────────────────┐       │  │
│  │  │      CLOB API           │    │      Gamma API           │       │  │
│  │  │  clob.polymarket.com    │    │  gamma-api.polymarket.com│       │  │
│  │  │                         │    │                         │       │  │
│  │  │  - 订单管理              │    │  - 市场发现              │       │  │
│  │  │  - 订单簿               │    │  - 元数据               │       │  │
│  │  │  - 订单撮合             │    │  - 分类标签             │       │  │
│  │  │  - 价格发现             │    │  - 搜索                 │       │  │
│  │  └────────────┬────────────┘    └─────────────────────────┘       │  │
│  └───────────────┼───────────────────────────────────────────────────┘  │
│                  │                                                      │
│                  ▼ 撮合成功，提交链上                                     │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                      智能合约层 (Polygon 链上)                       │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────┐    ┌─────────────────────────┐       │  │
│  │  │   CTF Exchange Contract │    │    CTF Token Contract    │       │  │
│  │  │                         │    │                         │       │  │
│  │  │  - 原子交换              │    │  - ERC-1155 代币         │       │  │
│  │  │  - USDC ↔ 条件代币      │    │  - 分割/合并            │       │  │
│  │  │  - 订单执行              │    │  - 代币转移             │       │  │
│  │  └─────────────────────────┘    └─────────────────────────┘       │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────┐      │  │
│  │  │                    UMA Optimistic Oracle                 │      │  │
│  │  │                                                         │      │  │
│  │  │  - 市场结算                                              │      │  │
│  │  │  - 争议解决                                              │      │  │
│  │  │  - DVM 投票（最终仲裁）                                   │      │  │
│  │  └─────────────────────────────────────────────────────────┘      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 核心组件

| 组件 | 位置 | 功能 |
|------|------|------|
| **CLOB** | 链下 | 中央限价订单簿，订单撮合 |
| **Gamma API** | 链下 | 市场发现、元数据索引 |
| **CTF Exchange** | Polygon 链上 | 原子交换、订单执行 |
| **CTF Token** | Polygon 链上 | ERC-1155 条件代币 |
| **UMA Oracle** | 链上 | 乐观预言机，市场结算 |

---

## 4. 条件代币框架 (CTF) 详解

### 4.1 什么是 CTF

**Conditional Token Framework (CTF)** 是 Gnosis 创建的条件代币框架，Polymarket 用它来代币化预测市场的结果。

| 特性 | 说明 |
|------|------|
| **标准** | ERC-1155 多代币标准 |
| **网络** | Polygon |
| **抵押品** | USDC |
| **结果类型** | 二元（Yes/No） |

### 4.2 代币结构

```
┌─────────────────────────────────────────────────────────────┐
│                    CTF 代币层级结构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Condition（条件/市场）                                      │
│  │                                                          │
│  │  conditionId = hash(oracle, questionId, outcomeSlotCount)│
│  │                                                          │
│  ├── Collection（集合）                                      │
│  │   │                                                      │
│  │   │  collectionId = hash(parentCollectionId,             │
│  │   │                      conditionId, indexSet)          │
│  │   │                                                      │
│  │   ├── Position (Yes)                                     │
│  │   │   positionId = hash(collateralToken, collectionId)   │
│  │   │   indexSet = 1 (0b01)                                │
│  │   │                                                      │
│  │   └── Position (No)                                      │
│  │       positionId = hash(collateralToken, collectionId)   │
│  │       indexSet = 2 (0b10)                                │
│  │                                                          │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 分割与合并

CTF 的核心操作是**分割 (Split)** 和**合并 (Merge)**：

#### 4.3.1 分割 (Split)

将抵押品分割成完整的结果代币集：

```
           Split
1 USDC  ─────────→  1 Yes Token + 1 No Token

代码示例:
splitPosition(
  collateralToken,  // USDC 地址
  parentCollectionId,
  conditionId,
  partition,        // [1, 2] 表示 Yes 和 No
  amount            // 分割数量
)
```

#### 4.3.2 合并 (Merge)

将完整的结果代币集合并回抵押品：

```
                   Merge
1 Yes Token + 1 No Token  ─────────→  1 USDC

代码示例:
mergePositions(
  collateralToken,
  parentCollectionId,
  conditionId,
  partition,
  amount
)
```

**用途**：
- 持有双方代币时，合并可立即取回 USDC（无需等待结算）
- 套利机会：如果 Yes + No 价格 < $1，可买入双方后合并获利

### 4.4 CTF Exchange 合约

CTF Exchange 是 Polymarket 的核心交易合约，支持：

| 功能 | 说明 |
|------|------|
| **原子交换** | USDC ↔ 条件代币的即时交换 |
| **订单簿统一** | Yes 和 No 订单簿统一，互补订单可撮合 |
| **Mint/Merge 优化** | 撮合时自动执行分割/合并操作 |
| **非托管** | 用户始终控制资金 |

```
交易示例:

用户 A 想买 Yes @ $0.60
用户 B 想买 No @ $0.40

订单簿统一后:
- A 的买 Yes @ $0.60 = 卖 No @ $0.40
- B 的买 No @ $0.40 = 卖 Yes @ $0.60

撮合时:
1. 合约从 A 收取 $0.60
2. 合约从 B 收取 $0.40
3. 合约用 $1.00 铸造 1 Yes + 1 No
4. A 获得 1 Yes，B 获得 1 No
```

### 4.5 TypeScript 代码示例

```typescript
import { ethers } from "ethers";

// CTF 合约地址 (Polygon)
const CTF_ADDRESS = "0x4D97DCd97eC945f40cF65F87097ACe5EA0476045";

// CTF ABI (部分)
const CTF_ABI = [
  "function splitPosition(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] calldata partition, uint amount)",
  "function mergePositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] calldata partition, uint amount)",
  "function redeemPositions(address collateralToken, bytes32 parentCollectionId, bytes32 conditionId, uint[] calldata indexSets)"
];

// 分割 USDC 为 Yes/No 代币
async function splitPosition(
  signer: ethers.Signer,
  conditionId: string,
  amount: ethers.BigNumber
) {
  const ctf = new ethers.Contract(CTF_ADDRESS, CTF_ABI, signer);
  const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // Polygon USDC

  const tx = await ctf.splitPosition(
    USDC,
    ethers.constants.HashZero,  // parentCollectionId
    conditionId,
    [1, 2],  // partition: Yes=1, No=2
    amount
  );

  return tx.wait();
}

// 合并 Yes/No 代币为 USDC
async function mergePositions(
  signer: ethers.Signer,
  conditionId: string,
  amount: ethers.BigNumber
) {
  const ctf = new ethers.Contract(CTF_ADDRESS, CTF_ABI, signer);
  const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

  const tx = await ctf.mergePositions(
    USDC,
    ethers.constants.HashZero,
    conditionId,
    [1, 2],
    amount
  );

  return tx.wait();
}

// 结算后赎回代币
async function redeemPositions(
  signer: ethers.Signer,
  conditionId: string
) {
  const ctf = new ethers.Contract(CTF_ADDRESS, CTF_ABI, signer);
  const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

  const tx = await ctf.redeemPositions(
    USDC,
    ethers.constants.HashZero,
    conditionId,
    [1, 2]  // 赎回所有持有的代币
  );

  return tx.wait();
}
```

---

## 5. UMA Oracle 详解

### 5.1 什么是 UMA Oracle

**UMA (Universal Market Access)** 提供乐观预言机 (Optimistic Oracle) 用于市场结算。其核心理念是：大多数情况下真相是明显的，只有在争议时才需要仲裁。

| 特性 | 说明 |
|------|------|
| **类型** | 乐观预言机 (Optimistic Oracle) |
| **核心机制** | 提案-挑战-仲裁 |
| **最终仲裁** | DVM（数据验证机制） |
| **代币** | $UMA |

### 5.2 结算流程

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       UMA 结算流程                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. 初始化 (Initialize)                                                  │
│  │                                                                      │
│  │  市场创建时，UmaCtfAdapter 向 Optimistic Oracle 发送请求               │
│  │  包含: 问题描述、奖励代币、奖励金额、提案保证金、活跃期                   │
│  │                                                                      │
│  ▼                                                                      │
│  2. 提案 (Propose)                                                       │
│  │                                                                      │
│  │  任何人都可以提交结果提案，需质押保证金                                  │
│  │  例如: "Yes" 获胜                                                     │
│  │                                                                      │
│  ▼                                                                      │
│  3. 挑战窗口 (Challenge Window) - 通常 2 小时                             │
│  │                                                                      │
│  │  ┌─────────────────────────────────────────────────────────┐        │
│  │  │                                                         │        │
│  │  │  无人挑战 ──────────────────────→ 提案生效，市场结算      │        │
│  │  │                                                         │        │
│  │  │  有人挑战 ──────────────────────→ 进入争议流程           │        │
│  │  │                                                         │        │
│  │  └─────────────────────────────────────────────────────────┘        │
│  │                                                                      │
│  ▼                                                                      │
│  4. 争议处理 (如有挑战)                                                   │
│  │                                                                      │
│  │  第一次争议: 忽略，创建新请求（防止恶意争议拖延）                         │
│  │  第二次争议: 升级到 DVM 投票                                           │
│  │                                                                      │
│  ▼                                                                      │
│  5. DVM 投票 (最终仲裁)                                                   │
│  │                                                                      │
│  │  - UMA 代币持有者投票                                                 │
│  │  - 投票隐藏，防止串谋                                                 │
│  │  - 48 小时完成                                                       │
│  │  - 多数票决定结果                                                    │
│  │                                                                      │
│  ▼                                                                      │
│  6. 结算 (Settle)                                                        │
│                                                                         │
│     结果确定，用户可赎回获胜代币                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 经济安全模型

UMA 使用**谢林点 (Schelling Point)** 原则确保诚实行为：

| 角色 | 激励 | 惩罚 |
|------|------|------|
| **提案者** | 准确提案获得奖励 | 错误提案失去保证金 |
| **挑战者** | 成功挑战获得提案者保证金 | 无效挑战失去自己保证金 |
| **投票者** | 正确投票获得奖励 | 错误投票被惩罚 |

**安全性**：
- 攻击需要控制多数 $UMA 代币
- 攻击会导致代币价值下跌
- 经济上不可行

### 5.4 结算统计

| 指标 | 数值 |
|------|------|
| 在 OO 层解决（无争议） | ~98.5% |
| 需要 DVM 投票 | ~1.5% |
| 平均结算时间（无争议） | 2-4 小时 |
| DVM 投票时间 | ~48 小时 |

### 5.5 合约接口

```typescript
// UMA CTF Adapter 接口
interface UmaCtfAdapter {
  // 初始化市场请求
  function initialize(
    bytes memory ancillaryData,  // 问题描述
    address rewardToken,          // 奖励代币
    uint256 reward,               // 奖励金额
    uint256 proposalBond,         // 提案保证金
    uint256 liveness              // 活跃期（秒）
  ) external;

  // 提交提案
  function proposePrice(
    bytes32 requestId,
    int256 price  // 1 = Yes, 0 = No
  ) external;

  // 争议提案
  function disputePrice(
    bytes32 requestId
  ) external;
}
```

---

## 6. Polymarket API 详解

### 6.1 API 端点总览

| 端点 | URL | 用途 |
|------|-----|------|
| **CLOB REST** | `https://clob.polymarket.com` | 下单、订单簿、成交 |
| **CLOB WebSocket** | `wss://ws-subscriptions-clob.polymarket.com` | 实时订阅 |
| **Gamma API** | `https://gamma-api.polymarket.com` | 市场发现、元数据 |
| **Data API** | `https://data-api.polymarket.com` | 用户持仓、交易历史 |

### 6.2 CLOB API

#### 6.2.1 认证机制

Polymarket CLOB 使用**两级认证**：

| 级别 | 方式 | 用途 |
|------|------|------|
| **L1** | 私钥 EIP-712 签名 | 证明钱包所有权 |
| **L2** | API Key | 程序化交易访问 |

**L1 认证流程**：
```typescript
// 使用私钥签名 EIP-712 消息
const signature = await wallet._signTypedData(domain, types, message);
```

**L2 认证流程**：
```typescript
// 1. 使用 L1 认证生成 API Key
const apiCreds = await tempClient.createOrDeriveApiKey();

// 2. 后续请求使用 API Key
const client = new ClobClient(HOST, CHAIN_ID, signer, apiCreds);
```

#### 6.2.2 订单模型

| 特性 | 说明 |
|------|------|
| **类型** | 限价单 (Limit Order) |
| **撮合** | 一个 Maker + 一个或多个 Takers |
| **价格改善** | 收益归 Taker |
| **执行** | 链下撮合 + 链上结算 |

**订单数据结构**：
```typescript
interface Order {
  salt: string;           // 随机数
  maker: string;          // 用户地址
  signer: string;         // 签名者地址
  taker: string;          // 对手方（通常为 0x0）
  tokenId: string;        // 代币 ID
  makerAmount: string;    // Maker 提供数量
  takerAmount: string;    // Taker 提供数量
  expiration: string;     // 过期时间
  nonce: string;          // 随机数
  feeRateBps: string;     // 费率
  side: "BUY" | "SELL";   // 方向
  signatureType: number;  // 签名类型
  signature: string;      // EIP-712 签名
}
```

#### 6.2.3 费率结构

当前费率（可能变动）：

| 角色 | 费率 |
|------|------|
| Maker | 0 bps (0%) |
| Taker | 0 bps (0%) |

费用计算公式：
```
// 卖出时
feeQuote = baseRate × min(price, 1-price) × size

// 买入时
feeBase = baseRate × min(price, 1-price) × (size/price)
```

#### 6.2.4 主要端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/auth/api-key` | POST | 生成/获取 API Key |
| `/order` | POST | 创建订单 |
| `/order/{orderId}` | DELETE | 取消订单 |
| `/orders` | GET | 获取用户订单 |
| `/book` | GET | 获取订单簿 |
| `/trades` | GET | 获取成交记录 |
| `/price` | GET | 获取当前价格 |

#### 6.2.5 TypeScript 代码示例

**安装依赖**：
```bash
npm install @polymarket/clob-client ethers
```

**初始化客户端**：
```typescript
import { ClobClient, Side } from "@polymarket/clob-client";
import { Wallet } from "ethers";

const HOST = "https://clob.polymarket.com";
const CHAIN_ID = 137; // Polygon 主网

// 创建钱包
const signer = new Wallet(process.env.PRIVATE_KEY);

// 步骤 1: 创建临时客户端获取 API 凭证
const tempClient = new ClobClient(HOST, CHAIN_ID, signer);
const apiCreds = await tempClient.createOrDeriveApiKey();

// 步骤 2: 创建完整客户端
const signatureType = 0; // EOA 钱包
const client = new ClobClient(HOST, CHAIN_ID, signer, apiCreds, signatureType);
```

**下单**：
```typescript
// 买入 Yes 代币
const response = await client.createAndPostOrder({
  tokenID: "YOUR_TOKEN_ID",  // 市场的 Yes 或 No 代币 ID
  price: 0.65,               // 价格 (0-1)
  size: 10,                  // 数量
  side: Side.BUY,
});

console.log("订单响应:", response);
```

**查询订单**：
```typescript
// 获取当前挂单
const openOrders = await client.getOpenOrders();

// 获取历史成交
const trades = await client.getTrades();
```

**获取订单簿**：
```typescript
// 获取指定市场的订单簿
const orderbook = await client.getOrderBook("TOKEN_ID");
console.log("买单:", orderbook.bids);
console.log("卖单:", orderbook.asks);
```

**取消订单**：
```typescript
// 取消单个订单
await client.cancelOrder(orderId);

// 取消所有订单
await client.cancelAll();

// 取消特定市场的所有订单
await client.cancelAllByMarket(marketId);
```

### 6.3 Gamma API

Gamma API 是 Polymarket 的市场发现服务。

#### 6.3.1 主要端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/markets` | GET | 获取市场列表 |
| `/markets/{id}` | GET | 获取市场详情 |
| `/events` | GET | 获取事件数据 |
| `/events/{id}` | GET | 获取事件详情 |
| `/tags` | GET | 获取分类标签 |
| `/tags/{id}` | GET | 获取特定标签 |
| `/search` | GET | 搜索市场 |

#### 6.3.2 市场数据结构

```typescript
interface Market {
  id: string;                    // 市场 ID
  question: string;              // 市场问题
  description: string;           // 详细描述
  conditionId: string;           // CTF 条件 ID
  slug: string;                  // URL 友好标识

  // 结果信息
  outcomes: string[];            // ["Yes", "No"]
  outcomePrices: string[];       // ["0.52", "0.48"]

  // 代币信息
  clobTokenIds: string[];        // CLOB 代币 ID

  // 统计数据
  volume: string;                // 总成交量
  volume24hr: string;            // 24h 成交量
  liquidity: string;             // 流动性

  // 时间信息
  startDate: string;             // 开始日期
  endDate: string;               // 结束日期

  // 状态
  active: boolean;               // 是否活跃
  closed: boolean;               // 是否关闭
  archived: boolean;             // 是否归档

  // 分类
  tags: Tag[];                   // 标签

  // 结算信息
  resolutionSource: string;      // 结算来源
  negRisk: boolean;              // 负风险标记
}

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  markets: Market[];
  startDate: string;
  endDate: string;
}

interface Tag {
  id: string;
  label: string;
  slug: string;
}
```

#### 6.3.3 查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `offset` | number | 分页偏移 |
| `limit` | number | 每页数量 |
| `active` | boolean | 是否活跃 |
| `closed` | boolean | 是否关闭 |
| `tag_id` | string | 按标签筛选 |
| `order` | string | 排序方式 |
| `ascending` | boolean | 升序/降序 |

#### 6.3.4 代码示例

**获取市场列表**：
```typescript
async function getMarkets(options?: {
  limit?: number;
  offset?: number;
  active?: boolean;
  tag?: string;
}) {
  const params = new URLSearchParams();

  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));
  if (options?.active !== undefined) params.set('active', String(options.active));
  if (options?.tag) params.set('tag_id', options.tag);

  const response = await fetch(
    `https://gamma-api.polymarket.com/markets?${params}`
  );

  return response.json();
}

// 获取活跃的政治市场
const politicsMarkets = await getMarkets({
  active: true,
  tag: 'politics',
  limit: 20
});
```

**获取市场详情**：
```typescript
async function getMarket(marketId: string) {
  const response = await fetch(
    `https://gamma-api.polymarket.com/markets/${marketId}`
  );
  return response.json();
}
```

**搜索市场**：
```typescript
async function searchMarkets(query: string) {
  const response = await fetch(
    `https://gamma-api.polymarket.com/search?q=${encodeURIComponent(query)}`
  );
  return response.json();
}

// 搜索包含 "Bitcoin" 的市场
const btcMarkets = await searchMarkets("Bitcoin");
```

### 6.4 WebSocket API

#### 6.4.1 连接

```typescript
const ws = new WebSocket("wss://ws-subscriptions-clob.polymarket.com/ws/market");
```

#### 6.4.2 订阅类型

| 类型 | 说明 |
|------|------|
| `book` | 订单簿更新 |
| `price` | 价格更新 |
| `trade` | 成交更新 |
| `user` | 用户订单更新 |

#### 6.4.3 代码示例

```typescript
const ws = new WebSocket("wss://ws-subscriptions-clob.polymarket.com/ws/market");

ws.onopen = () => {
  // 订阅订单簿
  ws.send(JSON.stringify({
    type: "subscribe",
    channel: "book",
    markets: ["TOKEN_ID_1", "TOKEN_ID_2"]
  }));

  // 订阅价格
  ws.send(JSON.stringify({
    type: "subscribe",
    channel: "price",
    markets: ["TOKEN_ID_1"]
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.channel) {
    case "book":
      console.log("订单簿更新:", data.data);
      break;
    case "price":
      console.log("价格更新:", data.data);
      break;
    case "trade":
      console.log("成交:", data.data);
      break;
  }
};

// 心跳保持连接
setInterval(() => {
  ws.send(JSON.stringify({ type: "ping" }));
}, 30000);
```

---

## 7. Based.one 集成实现

### 7.1 集成架构

Based.one 作为 Polymarket 的**聚合前端**，提供：

```
┌─────────────────────────────────────────────────────────────┐
│                      Based.one                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  统一账户系统    │    │   统一 UI       │                │
│  │  - HyperLiquid  │    │   - Web         │                │
│  │  - Polymarket   │    │   - Desktop     │                │
│  └─────────────────┘    │   - Telegram    │                │
│          │              └─────────────────┘                │
│          ▼                                                  │
│  ┌─────────────────────────────────────────────┐           │
│  │            HyperLiquid Hypercore            │           │
│  │         (永续 ↔ 预测市场 资金互转)            │           │
│  └─────────────────────────────────────────────┘           │
│          │                          │                       │
│          ▼                          ▼                       │
│  ┌───────────────┐         ┌───────────────┐              │
│  │  HyperLiquid  │         │  Polymarket   │              │
│  │  Exchange API │         │  CLOB API     │              │
│  └───────────────┘         └───────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 资金流转机制

Based.one 利用 HyperLiquid 的 **hypercore** 实现资金在不同功能间的转移：

| 操作 | 说明 |
|------|------|
| **永续 → 预测市场** | 从 HyperLiquid 永续账户转入预测市场 |
| **预测市场 → 永续** | 从预测市场利润转回永续账户 |
| **即时转账** | 无需外部链上转账，内部结算 |

### 7.3 用户交易流程

```
1. 用户连接钱包 (Based.one)
        │
        ▼
2. 选择预测市场类型 (政治/体育/加密等)
        │
        ▼
3. 浏览市场列表 (Gamma API)
        │
        ▼
4. 选择具体市场
        │
        ▼
5. 查看订单簿和价格 (CLOB API)
        │
        ▼
6. 下单 (EIP-712 签名)
        │
        ▼
7. 订单撮合 (CLOB 链下)
        │
        ▼
8. 链上结算 (Polygon Exchange Contract)
        │
        ▼
9. 获得条件代币 (Yes/No Token)
```

### 7.4 多平台支持

Based.one 提供多种访问方式：

| 平台 | 特点 |
|------|------|
| **Web** | https://app.based.one/predict |
| **Desktop** | 桌面客户端 |
| **Telegram** | Bot 交易 |

---

## 8. 与 HyperLiquid HIP-3 对比

### 8.1 HIP-3 简介

**HIP-3** 是 HyperLiquid 社区提出的**原生预测市场**提案：

| 特性 | 说明 |
|------|------|
| 类型 | 永续合约形式的预测市场 |
| 结算 | 事件结果决定合约价格 |
| 优势 | 原生集成，无需跨协议 |

### 8.2 对比分析

| 特性 | Based.one (Polymarket) | HIP-3 (提案) |
|------|------------------------|--------------|
| 状态 | 已上线 | 提案阶段 |
| 底层 | Polymarket (Polygon) | HyperLiquid 原生 |
| 代币 | CTF (ERC-1155) | 永续合约 |
| 结算 | UMA Oracle | HyperLiquid 预言机 |
| 跨链 | 需要 (Polygon) | 无需 |
| 流动性 | Polymarket 流动性 | HyperLiquid 流动性 |

### 8.3 选择建议

| 场景 | 推荐方案 |
|------|----------|
| 需要立即使用 | Polymarket 集成 (Based.one 方式) |
| 追求原生体验 | 等待 HIP-3 实现 |
| 流动性优先 | Polymarket (更成熟) |
| 减少跨链复杂度 | HIP-3 (原生) |

---

## 9. 实现建议

如果要为 DEX 项目添加预测市场功能，有两种技术路线：

### 9.1 路线 A: 集成 Polymarket (推荐)

**优点**：
- 成熟的市场和流动性
- 完善的 API 文档
- 无需自建预言机

**实现步骤**：
1. 集成 Polymarket Gamma API 获取市场列表
2. 集成 Polymarket CLOB API 实现交易
3. 实现 EIP-712 签名
4. 设计资金互转机制

**依赖**：
```json
{
  "@polymarket/clob-client": "^x.x.x",
  "ethers": "^5.x.x"
}
```

### 9.2 路线 B: 等待 HIP-3

**优点**：
- 原生 HyperLiquid 集成
- 无跨链复杂度
- 统一的技术栈

**缺点**：
- 尚未实现
- 时间不确定

---

## 10. 参考资源

### 10.1 Polymarket 官方

- [Polymarket 官网](https://polymarket.com)
- [开发者文档](https://docs.polymarket.com)
- [CLOB Introduction](https://docs.polymarket.com/developers/CLOB/introduction)
- [CLOB Quickstart](https://docs.polymarket.com/developers/CLOB/quickstart)
- [Gamma API Overview](https://docs.polymarket.com/developers/gamma-markets-api/overview)
- [CTF Overview](https://docs.polymarket.com/developers/CTF/overview)
- [UMA Resolution](https://docs.polymarket.com/developers/resolution/UMA)

### 10.2 客户端库

- [TypeScript Client](https://www.npmjs.com/package/@polymarket/clob-client)
- [Python Client](https://github.com/Polymarket/py-clob-client)
- [CTF Exchange Contract](https://github.com/Polymarket/ctf-exchange)

### 10.3 UMA Protocol

- [UMA 文档](https://docs.uma.xyz)
- [Optimistic Oracle](https://docs.uma.xyz/protocol-overview/how-does-umas-oracle-work)

### 10.4 Based.one 相关

- [Based.one 预测市场](https://app.based.one/predict)
- [Based.one Polymarket 集成介绍](https://polymark.et/product/based)

### 10.5 第三方资源

- [Polymarket Wikipedia](https://en.wikipedia.org/wiki/Polymarket)
- [Polymarket - Britannica](https://www.britannica.com/money/Polymarket)
- [How Polymarket Works - RockNBlock](https://rocknblock.io/blog/how-polymarket-works-the-tech-behind-prediction-markets)
- [CoinGecko Guide](https://www.coingecko.com/learn/what-is-polymarket-decentralized-prediction-markets-guide)

---

## 更新日志

| 日期 | 更新内容 |
|------|---------|
| 2026-01-23 | 添加 Polymarket 平台详解、CTF 详解、UMA Oracle 详解 |
| 2026-01-23 | 初始版本 - Based.one 预测市场技术分析 |
