# HyperLiquid API Test Suite

HyperLiquid 测试网 API 测试项目，使用 TypeScript + Vitest。

## 项目结构

```
hyperliquid-api-test/
├── package.json              # 项目配置和依赖
├── tsconfig.json             # TypeScript 配置
├── vitest.config.ts          # Vitest 测试框架配置
├── .env.example              # 环境变量模板
├── .gitignore                # Git 忽略规则
├── README.md                 # 本文件
│
├── src/                      # 源代码
│   ├── config/
│   │   └── index.ts          # 测试网配置 (API 端点、Chain ID)
│   │
│   ├── types/
│   │   ├── index.ts          # 类型导出
│   │   ├── info.ts           # Info API 请求/响应类型
│   │   └── exchange.ts       # Exchange API 请求/响应类型
│   │
│   ├── utils/
│   │   ├── index.ts          # 工具导出
│   │   ├── http-client.ts    # HTTP 请求封装
│   │   ├── signer.ts         # EIP-712 签名工具
│   │   └── helpers.ts        # 辅助函数 (格式化、时间戳等)
│   │
│   └── api/
│       ├── index.ts          # API 导出
│       ├── info.ts           # Info API 客户端封装
│       └── exchange.ts       # Exchange API 客户端封装
│
└── tests/                    # 测试文件
    ├── setup.ts              # 测试环境设置 (钱包、API 客户端)
    │
    ├── info/                 # Info API 测试 (无需签名，可直接运行)
    │   ├── perp-meta.test.ts     # 永续合约元数据
    │   ├── spot-meta.test.ts     # 现货元数据
    │   ├── orderbook.test.ts     # 订单簿
    │   ├── candles.test.ts       # K线数据
    │   ├── trades.test.ts        # 成交和中间价
    │   ├── perp-account.test.ts  # 永续账户状态
    │   ├── spot-account.test.ts  # 现货账户状态
    │   ├── history.test.ts       # 历史订单和成交
    │   └── builder.test.ts       # Builder 和推荐
    │
    └── exchange/             # Exchange API 测试 (需要私钥签名)
        ├── signature.test.ts     # 签名工具单元测试
        ├── leverage.test.ts      # 杠杆设置
        ├── order.test.ts         # 下单/撤单/改单
        ├── transfer.test.ts      # 资金转账
        └── builder-auth.test.ts  # Builder 授权
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
# 或 npm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置测试网私钥：

```env
PRIVATE_KEY=your_testnet_private_key_here
```

> ⚠️ 警告：请勿使用主网私钥！仅用于测试网测试。

### 3. 运行测试

```bash
# 运行所有测试
pnpm test
# 或 npm test

# 仅运行 Info API 测试 (无需私钥)
pnpm test:info
# 或 npm run test:info

# 仅运行 Exchange API 测试 (需要私钥)
pnpm test:exchange
# 或 npm run test:exchange

# 监视模式
pnpm test:watch
# 或 npm run test:watch

# 类型检查
pnpm typecheck
# 或 npm run typecheck
```

## 测试文件结构

```
tests/
├── setup.ts                  # 测试环境设置
├── info/                     # Info API 测试 (无需签名)
│   ├── perp-meta.test.ts     # meta, metaAndAssetCtxs
│   ├── spot-meta.test.ts     # spotMeta, spotMetaAndAssetCtxs
│   ├── orderbook.test.ts     # l2Book
│   ├── candles.test.ts       # candleSnapshot
│   ├── trades.test.ts        # recentTrades, allMids
│   ├── perp-account.test.ts  # clearinghouseState, openOrders
│   ├── spot-account.test.ts  # spotClearinghouseState
│   ├── history.test.ts       # historicalOrders, userFills
│   └── builder.test.ts       # maxBuilderFee, referral
│
└── exchange/                 # Exchange API 测试 (需签名)
    ├── signature.test.ts     # 签名工具单元测试
    ├── leverage.test.ts      # updateLeverage
    ├── order.test.ts         # order, cancel, modify
    ├── transfer.test.ts      # usdClassTransfer
    └── builder-auth.test.ts  # approveBuilderFee
```

## API 覆盖范围

### Info API (查询接口)

| 接口 | 测试文件 | 说明 |
|------|---------|------|
| meta | perp-meta.test.ts | 永续合约元数据 |
| metaAndAssetCtxs | perp-meta.test.ts | 永续 + 实时数据 |
| spotMeta | spot-meta.test.ts | 现货元数据 |
| spotMetaAndAssetCtxs | spot-meta.test.ts | 现货 + 实时数据 |
| l2Book | orderbook.test.ts | 订单簿 |
| candleSnapshot | candles.test.ts | K线数据 |
| recentTrades | trades.test.ts | 最近成交 |
| allMids | trades.test.ts | 所有中间价 |
| clearinghouseState | perp-account.test.ts | 永续账户状态 |
| spotClearinghouseState | spot-account.test.ts | 现货余额 |
| openOrders | perp-account.test.ts | 当前挂单 |
| frontendOpenOrders | perp-account.test.ts | 挂单详情 |
| historicalOrders | history.test.ts | 历史订单 |
| userFills | history.test.ts | 成交记录 |
| userFunding | history.test.ts | 资金费历史 |
| maxBuilderFee | builder.test.ts | Builder 授权状态 |
| referral | builder.test.ts | 推荐状态 |

### Exchange API (交易接口)

| 接口 | 测试文件 | 说明 |
|------|---------|------|
| updateLeverage | leverage.test.ts | 更新杠杆 |
| order | order.test.ts | 下单 |
| cancel | order.test.ts | 撤单 |
| modify | order.test.ts | 修改订单 |
| usdClassTransfer | transfer.test.ts | 永续/现货互转 |
| usdSend | transfer.test.ts | USDC 转账 |
| withdraw3 | transfer.test.ts | 提现到 L1 |
| approveBuilderFee | builder-auth.test.ts | 授权 Builder |

## 源码结构

```
src/
├── config/
│   └── index.ts          # 测试网配置
├── types/
│   ├── info.ts           # Info API 类型
│   └── exchange.ts       # Exchange API 类型
├── utils/
│   ├── http-client.ts    # HTTP 客户端
│   ├── signer.ts         # EIP-712 签名
│   └── helpers.ts        # 辅助函数
└── api/
    ├── info.ts           # Info API 封装
    └── exchange.ts       # Exchange API 封装
```

## 测试网配置

- **REST API**: `https://api.hyperliquid-testnet.xyz`
- **WebSocket**: `wss://api.hyperliquid-testnet.xyz/ws`
- **Chain ID**: 421614 (Arbitrum Sepolia)

## 注意事项

1. **Exchange 测试需要余额**: 下单、转账等测试需要测试网账户有 USDC 余额
2. **订单价格**: 测试会使用远离市价的限价单，避免实际成交
3. **签名格式**: 使用 EIP-712 签名，结果为 `{r, s, v}` 对象格式
4. **地址格式**: 所有地址需要小写

## Exchange API 建议测试顺序

Exchange API 测试存在依赖关系，建议按以下顺序执行：

```
1. signature.test.ts     # 签名工具单元测试（纯本地，无 API 调用）
       ↓
2. leverage.test.ts      # 杠杆设置（交易前置条件）
       ↓
3. builder-auth.test.ts  # Builder 授权（BuildCode 集成前置）
       ↓
4. order.test.ts         # 下单/撤单/改单（核心交易功能）
       ↓
5. transfer.test.ts      # 资金转账（可能影响账户余额）
```

### 顺序说明

| 顺序 | 测试文件 | 原因 |
|:---:|---------|------|
| 1 | signature.test.ts | 纯单元测试，验证签名逻辑正确性，无需账户余额 |
| 2 | leverage.test.ts | 独立的账户配置 API，与下单 API 分离 |
| 3 | builder-auth.test.ts | 授权 Builder 后才能在订单中附加 builder 参数 |
| 4 | order.test.ts | 核心交易功能（下单/撤单/改单） |
| 5 | transfer.test.ts | 资金转账可能改变账户余额，放最后避免影响其他测试 |

### 为什么杠杆设置是独立的 API？

HyperLiquid 的设计中，**杠杆设置和下单是两个独立的 API**：

```
updateLeverage API          order API
      ↓                        ↓
设置某交易对的杠杆倍数    →    下单时自动使用已设置的杠杆
（持久化到账户配置）          （不包含杠杆参数）
```

**原因**：
1. **关注点分离**：杠杆是账户级别的风险配置，订单是具体的交易指令
2. **配置持久化**：设置一次后，该交易对的所有后续订单都使用这个杠杆，无需重复指定
3. **减少签名复杂度**：订单结构更简洁，签名数据更少

**对比其他交易所**：部分 CEX 允许在下单时指定杠杆，但 HyperLiquid 选择分离设计。

### 单独运行某个测试

```bash
# 运行签名测试
pnpm test tests/exchange/signature.test.ts

# 运行杠杆测试
pnpm test tests/exchange/leverage.test.ts

# 运行订单测试
pnpm test tests/exchange/order.test.ts
```

## 相关文档

- [HyperLiquid API 文档](https://hyperliquid.gitbook.io/hyperliquid-docs/)
- [Exchange API 开发指南](../../notes/hyperliquid/exchange-api-guide.md)
- [API 签名格式](../../notes/hyperliquid/api-signature-format.md)
