# HyperLiquid API 测试项目实现计划

## 项目概述

在 `example/hyperliquid-api-test` 目录创建 TypeScript 测试项目，使用 Vitest 测试框架，通过测试用例验证 HyperLiquid 测试网 API 的使用。

## 目录结构

```
example/hyperliquid-api-test/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
├── .gitignore
│
├── src/
│   ├── config/
│   │   └── index.ts              # 配置常量 (端点, chainId)
│   ├── types/
│   │   ├── index.ts
│   │   ├── info.ts               # Info API 类型
│   │   └── exchange.ts           # Exchange API 类型
│   ├── utils/
│   │   ├── http-client.ts        # HTTP 请求封装
│   │   ├── signer.ts             # EIP-712 签名工具
│   │   └── helpers.ts            # 辅助函数
│   └── api/
│       ├── info.ts               # Info API 客户端
│       └── exchange.ts           # Exchange API 客户端
│
└── tests/
    ├── setup.ts                  # 测试环境设置
    ├── info/                     # Info API 测试 (无需签名)
    │   ├── perp-meta.test.ts     # meta, metaAndAssetCtxs
    │   ├── spot-meta.test.ts     # spotMeta, spotMetaAndAssetCtxs
    │   ├── orderbook.test.ts     # l2Book
    │   ├── candles.test.ts       # candleSnapshot
    │   ├── trades.test.ts        # recentTrades, allMids
    │   ├── perp-account.test.ts  # clearinghouseState
    │   ├── spot-account.test.ts  # spotClearinghouseState
    │   ├── history.test.ts       # historicalOrders, userFills
    │   └── builder.test.ts       # maxBuilderFee
    │
    └── exchange/                 # Exchange API 测试 (需签名)
        ├── signature.test.ts     # 签名生成单元测试
        ├── leverage.test.ts      # updateLeverage
        ├── order.test.ts         # order, cancel, modify
        ├── transfer.test.ts      # usdClassTransfer
        └── builder-auth.test.ts  # approveBuilderFee
```

## 依赖配置

```json
{
  "devDependencies": {
    "@types/node": "^22.10.5",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8",
    "dotenv": "^16.4.5"
  },
  "dependencies": {
    "viem": "^2.44.4",
    "@msgpack/msgpack": "^3.1.3"
  }
}
```

## 实现步骤

### Phase 1: 项目初始化
1. 创建目录结构
2. 配置 package.json, tsconfig.json, vitest.config.ts
3. 创建 .env.example (PRIVATE_KEY) 和 .gitignore

### Phase 2: 类型定义
从现有项目复制并适配类型：
- `src/types/hyperliquid/info.ts` → Info API 响应类型
- `src/types/hyperliquid/exchange.ts` → Exchange API 请求/响应类型

### Phase 3: 工具类实现
1. **http-client.ts**: HTTP 请求封装，支持 /info 和 /exchange 端点
2. **signer.ts**: EIP-712 签名
   - `signL1Action`: order, cancel, updateLeverage 等
   - `signUserSignedAction`: approveBuilderFee, usdSend 等
   - `parseSignature`: 将 hex 签名解析为 {r, s, v}
3. **helpers.ts**: 数值格式化、时间戳等辅助函数

### Phase 4: API 客户端
1. **InfoAPI**: 封装所有查询接口
2. **ExchangeAPI**: 封装所有交易接口（含自动签名）

### Phase 5: Info API 测试 (9个测试文件)
| 文件 | 测试内容 |
|------|---------|
| perp-meta.test.ts | meta, metaAndAssetCtxs |
| spot-meta.test.ts | spotMeta, spotMetaAndAssetCtxs |
| orderbook.test.ts | l2Book (永续/现货) |
| candles.test.ts | candleSnapshot (多周期) |
| trades.test.ts | recentTrades, allMids |
| perp-account.test.ts | clearinghouseState, frontendOpenOrders |
| spot-account.test.ts | spotClearinghouseState |
| history.test.ts | historicalOrders, userFills, userFunding |
| builder.test.ts | maxBuilderFee |

### Phase 6: Exchange API 测试 (5个测试文件)
| 文件 | 测试内容 |
|------|---------|
| signature.test.ts | signL1Action, signUserSignedAction 单元测试 |
| leverage.test.ts | updateLeverage (全仓/逐仓) |
| order.test.ts | placeOrder, cancelOrder, modifyOrder |
| transfer.test.ts | usdClassTransfer |
| builder-auth.test.ts | approveBuilderFee |

## 关键配置

```typescript
// 测试网配置
const CONFIG = {
  REST_API: 'https://api.hyperliquid-testnet.xyz',
  CHAIN_ID: 421614,  // Arbitrum Sepolia
  DOMAIN: {
    name: 'HyperliquidSignTransaction',
    version: '1',
    chainId: 421614,
    verifyingContract: '0x0000000000000000000000000000000000000000',
  },
};
```

## 关键参考文件

| 文件 | 用途 |
|------|------|
| src/types/hyperliquid/info.ts | Info API 类型定义 |
| src/types/hyperliquid/exchange.ts | Exchange API 类型定义 |
| notes/hyperliquid/exchange-api-guide.md | API 开发指南 |
| notes/hyperliquid/http/hyperliquid-query.http | Info API 示例 |
| notes/hyperliquid/http/hyperliquid-exchange.http | Exchange API 示例 |

## 验证方式

1. **Info API 测试**: `pnpm test:info` - 无需私钥，直接运行
2. **Exchange API 测试**: `pnpm test:exchange` - 需设置 PRIVATE_KEY 环境变量
3. **全部测试**: `pnpm test`

## 注意事项

- Exchange API 测试需要测试网账户有 USDC 余额
- 下单测试会使用远离市价的限价单，避免实际成交
- 私钥从 `.env` 文件的 `PRIVATE_KEY` 环境变量读取
