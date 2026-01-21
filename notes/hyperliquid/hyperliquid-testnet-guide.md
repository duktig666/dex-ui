# HyperLiquid 测试网接入指南

## 1. 概述

HyperLiquid 提供完整的测试网环境，用于开发和测试。测试网与主网功能基本一致，但资产 ID 和某些参数有所不同。

### 1.1 网络信息

#### HyperCore（交易 API）

| 项目 | 主网 (Mainnet) | 测试网 (Testnet) |
|------|---------------|-----------------|
| REST API | `https://api.hyperliquid.xyz` | `https://api.hyperliquid-testnet.xyz` |
| WebSocket | `wss://api.hyperliquid.xyz/ws` | `wss://api.hyperliquid-testnet.xyz/ws` |
| Web 应用 | `https://app.hyperliquid.xyz` | `https://app.hyperliquid-testnet.xyz` |
| Chain ID (签名) | 42161 (Arbitrum) | 421614 (Arbitrum Sepolia) |

#### HyperEVM（EVM 兼容链）

| 项目 | 主网 (Mainnet) | 测试网 (Testnet) |
|------|---------------|-----------------|
| RPC URL | `https://rpc.hyperliquid.xyz/evm` | `https://rpc.hyperliquid-testnet.xyz/evm` |
| Chain ID | 999 | 998 |
| Currency Symbol | HYPE | HYPE |
| Block Explorer | `https://hyperevmscan.io` | `https://testnet.hyperevmscan.io` |

### 1.2 HyperCore vs HyperEVM

**重要区别**：

| 层 | 用途 | 资产存储 | MetaMask 可见 |
|---|------|---------|--------------|
| **HyperCore** | 交易（perps/spot） | 交易账户 USDC | ❌ 不可见 |
| **HyperEVM** | EVM 智能合约 | EVM 钱包 HYPE | ✅ 可见 |

- 水龙头领取的 USDC 在 **HyperCore** 上，用于交易
- MetaMask 只能看到 **HyperEVM** 上的资产

---

## 2. 环境配置

### 2.1 环境变量

```bash
# .env.local

# 网络选择
NEXT_PUBLIC_NETWORK=testnet  # mainnet | testnet

# Builder 配置
NEXT_PUBLIC_BUILDER_ADDRESS=0xYOUR_BUILDER_ADDRESS
```

### 2.2 API 配置代码

```typescript
// lib/hyperliquid/constants.ts

export const NETWORKS = {
  mainnet: {
    restUrl: 'https://api.hyperliquid.xyz',
    wsUrl: 'wss://hyperliquid.hyperliquid.xyz/ws',
    appUrl: 'https://app.hyperliquid.xyz',
    chainId: 42161,
    signatureChainId: '0xa4b1'
  },
  testnet: {
    restUrl: 'https://api.hyperliquid-testnet.xyz',
    wsUrl: 'wss://hyperliquid.hyperliquid-testnet.xyz/ws',
    appUrl: 'https://app.hyperliquid-testnet.xyz',
    chainId: 421614,
    signatureChainId: '0x66eee'
  }
} as const;

export const CURRENT_NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
  ? NETWORKS.mainnet
  : NETWORKS.testnet;

export const IS_MAINNET = process.env.NEXT_PUBLIC_NETWORK === 'mainnet';
```

### 2.3 动态网络切换

```typescript
// lib/hyperliquid/client.ts

class HyperliquidClient {
  private baseUrl: string;

  constructor(network: 'mainnet' | 'testnet' = 'testnet') {
    this.baseUrl = NETWORKS[network].restUrl;
  }

  // 切换网络
  setNetwork(network: 'mainnet' | 'testnet') {
    this.baseUrl = NETWORKS[network].restUrl;
  }

  async post(endpoint: string, body: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response.json();
  }
}
```

---

## 3. 获取测试币

### 3.1 前置条件：主网账户激活

**重要：使用测试网水龙头前，必须先在主网激活账户。**

#### 主网激活方式

| 方式 | 要求 | 说明 |
|------|------|------|
| **方式一：存入 USDC** | 至少 $5 USDC | 从 Arbitrum 发送 USDC 到 HyperLiquid 桥接地址 |
| **方式二：持有 HYPE** | 至少 0.1 HYPE | 在主网 HyperLiquid 账户持有 HYPE |

#### 主网激活操作步骤

1. 访问 [https://app.hyperliquid.xyz](https://app.hyperliquid.xyz)
2. 连接你的钱包（MetaMask 等）
3. 点击 "Deposit" 进行跨链存款
4. 选择 USDC，输入至少 $5（或任意金额）
5. 在 Arbitrum 网络确认交易
6. 等待存款到账（通常几分钟）

> **官方文档**: [Testnet Faucet](https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/testnet-faucet)

### 3.2 领取测试币

主网账户激活后，可以领取测试币：

1. 访问 [https://app.hyperliquid-testnet.xyz/drip](https://app.hyperliquid-testnet.xyz/drip)
2. 使用**同一个钱包地址**连接（与主网激活使用的地址相同）
3. 点击领取按钮
4. 获得 **1,000 mock USDC**

### 3.3 领取限制

| 项目 | 说明 |
|------|------|
| 领取金额 | 1,000 mock USDC |
| 领取次数 | 每个地址只能领取一次 |
| 代币用途 | 仅限测试网交易，无实际价值 |

### 3.4 第三方水龙头（备选）

如果官方水龙头无法使用，可以尝试：

| 平台 | 链接 | 要求 |
|------|------|------|
| QuickNode | [faucet.quicknode.com/hyperliquid](https://faucet.quicknode.com/hyperliquid) | 主网持有 0.05 HYPE |
| Chainstack | [faucet.chainstack.com/hyperliquid-testnet-faucet](https://faucet.chainstack.com/hyperliquid-testnet-faucet) | 每 24 小时可领取 1 HYPE |

### 3.5 注意事项

- 测试网 USDC 无实际价值
- **必须使用相同地址**：主网激活和测试网领取需要使用同一钱包地址
- 如果使用 Privy 邮箱登录，主网和测试网会生成不同地址，需要导出主网钱包私钥到 MetaMask
- 测试网数据可能定期清除

---

## 3.6 测试网 Builder 设置

### Builder 要求

**测试网 Builder 同样需要满足以下条件**：

| 要求 | 说明 |
|------|------|
| 最低资金 | 测试网 perps 账户需有 **100+ mock USDC** |
| 资金来源 | 从测试网水龙头领取 |

> **官方文档**: [Builder Codes](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes)

### 测试网 Builder 设置步骤

```
1. 主网激活账户（存入至少 $5 USDC）
         ↓
2. 测试网领取 1,000 mock USDC
         ↓
3. Builder 地址在测试网保持 100+ mock USDC
         ↓
4. 可以开始测试 BuildCode 功能
```

### 具体操作流程

1. **准备 Builder 钱包**
   - 创建一个新的以太坊钱包（或使用现有钱包）
   - 记录地址作为 `BUILDER_ADDRESS`

2. **主网激活**
   ```
   访问: https://app.hyperliquid.xyz
   操作: Deposit 至少 $5 USDC
   ```

3. **测试网领取测试币**
   ```
   访问: https://app.hyperliquid-testnet.xyz/drip
   操作: 使用同一地址领取 1,000 mock USDC
   ```

4. **验证 Builder 资格**
   ```typescript
   // 检查 Builder 地址的账户余额
   const state = await client.post('/info', {
     type: 'clearinghouseState',
     user: BUILDER_ADDRESS
   });

   const accountValue = parseFloat(state.marginSummary.accountValue);
   console.log('Account Value:', accountValue);
   // 需要 >= 100 才能作为 Builder
   ```

5. **配置环境变量**
   ```bash
   # .env.local
   NEXT_PUBLIC_BUILDER_ADDRESS=0xYOUR_BUILDER_ADDRESS
   ```

---

## 4. 资产 ID 差异

### 4.1 HYPE Token

| 网络 | Token ID | Spot ID |
|------|----------|---------|
| 主网 | 150 | 107 |
| 测试网 | 1105 | 1035 |

### 4.2 处理方式

```typescript
// lib/hyperliquid/assets.ts

// 资产 ID 映射 (测试网特殊处理)
export const ASSET_OVERRIDES: Record<string, Record<string, number>> = {
  testnet: {
    'HYPE_TOKEN': 1105,
    'HYPE_SPOT': 1035
  },
  mainnet: {
    'HYPE_TOKEN': 150,
    'HYPE_SPOT': 107
  }
};

// 获取资产 ID
export function getAssetId(
  assetName: string,
  assetType: 'perp' | 'spot',
  meta: Meta,
  network: 'mainnet' | 'testnet'
): number {
  // 检查是否有覆盖配置
  const override = ASSET_OVERRIDES[network]?.[`${assetName}_${assetType.toUpperCase()}`];
  if (override !== undefined) {
    return override;
  }

  // 使用标准计算方式
  if (assetType === 'perp') {
    return meta.universe.findIndex(u => u.name === assetName);
  } else {
    const spotIndex = meta.spotUniverse?.findIndex(u => u.name.startsWith(assetName));
    return spotIndex !== undefined ? 10000 + spotIndex : -1;
  }
}
```

### 4.3 查询资产信息

```typescript
// 获取完整的资产列表
async function fetchAssetInfo() {
  const [perpMeta, spotMeta] = await Promise.all([
    client.post('/info', { type: 'meta' }),
    client.post('/info', { type: 'spotMeta' })
  ]);

  console.log('永续合约资产:');
  perpMeta.universe.forEach((asset, index) => {
    console.log(`  ${index}: ${asset.name}`);
  });

  console.log('现货资产:');
  spotMeta.universe.forEach((pair, index) => {
    console.log(`  ${10000 + index}: ${pair.name}`);
  });
}
```

---

## 5. 签名配置

### 5.1 签名参数差异

| 参数 | 主网 | 测试网 |
|------|------|--------|
| hyperliquidChain | `"Mainnet"` | `"Testnet"` |
| signatureChainId | `"0xa4b1"` | `"0x66eee"` |
| EIP-712 chainId | 42161 | 421614 |

### 5.2 签名代码

```typescript
// lib/hyperliquid/signing.ts

export function getSigningConfig(isMainnet: boolean) {
  return {
    hyperliquidChain: isMainnet ? 'Mainnet' : 'Testnet',
    signatureChainId: isMainnet ? '0xa4b1' : '0x66eee',
    eip712ChainId: isMainnet ? 42161 : 421614
  };
}

export async function signApproveBuilderFee(
  walletClient: WalletClient,
  builder: string,
  maxFeeRate: string,
  nonce: number,
  isMainnet: boolean
) {
  const config = getSigningConfig(isMainnet);

  const action = {
    type: 'approveBuilderFee',
    hyperliquidChain: config.hyperliquidChain,
    signatureChainId: config.signatureChainId,
    builder: builder.toLowerCase(),
    maxFeeRate,
    nonce
  };

  // ... 签名逻辑
}
```

---

## 6. 开发流程

### 6.1 推荐流程

```
1. 本地开发 (测试网)
   ↓
2. 测试网完整测试
   ↓
3. 代码审查
   ↓
4. 切换到主网
   ↓
5. 主网小额测试
   ↓
6. 正式上线
```

### 6.2 测试清单

- [ ] 钱包连接正常
- [ ] Builder 费率授权正常
- [ ] 查询元数据正常
- [ ] 查询用户状态正常
- [ ] WebSocket 订阅正常
- [ ] 下限价单正常
- [ ] 下市价单正常
- [ ] 取消订单正常
- [ ] 修改订单正常
- [ ] 持仓更新正常
- [ ] 订单状态更新正常

---

## 7. 调试技巧

### 7.1 API 调试

```typescript
// 添加请求/响应日志
class HyperliquidClient {
  private debug = process.env.NODE_ENV === 'development';

  async post(endpoint: string, body: any) {
    if (this.debug) {
      console.log(`[HyperLiquid] POST ${endpoint}`, body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (this.debug) {
      console.log(`[HyperLiquid] Response:`, data);
    }

    return data;
  }
}
```

### 7.2 WebSocket 调试

```typescript
// WebSocket 消息日志
class HyperliquidWebSocket {
  private debug = process.env.NODE_ENV === 'development';

  private handleMessage(event: MessageEvent) {
    const message = JSON.parse(event.data);

    if (this.debug) {
      console.log(`[WS] Received:`, message);
    }

    // ... 处理消息
  }

  send(data: any) {
    if (this.debug) {
      console.log(`[WS] Send:`, data);
    }
    this.ws?.send(JSON.stringify(data));
  }
}
```

### 7.3 签名调试

```typescript
// 签名验证
export async function debugSignature(
  action: any,
  signature: { r: string; s: string; v: number },
  expectedSigner: string
) {
  // 使用 viem 验证签名
  const recoveredAddress = await recoverTypedDataAddress({
    domain: getDomain(IS_MAINNET),
    types: getTypes(action.type),
    primaryType: action.type,
    message: action,
    signature: `${signature.r}${signature.s.slice(2)}${signature.v.toString(16)}`
  });

  console.log('Expected signer:', expectedSigner);
  console.log('Recovered signer:', recoveredAddress);
  console.log('Match:', recoveredAddress.toLowerCase() === expectedSigner.toLowerCase());
}
```

### 7.4 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 签名失败 | 地址未小写 | 使用 `.toLowerCase()` |
| 签名失败 | 尾随零未移除 | 使用 `floatToWire()` |
| Nonce 错误 | 时间不同步 | 使用 `Date.now()` |
| 资产 ID 错误 | 主网/测试网混淆 | 检查网络配置 |
| WebSocket 断开 | 心跳超时 | 实现 ping/pong |

---

## 8. 浏览器开发者工具

### 8.1 Network 面板

监控 API 请求：
- 筛选 `api.hyperliquid-testnet.xyz`
- 查看请求体和响应
- 检查状态码

### 8.2 WebSocket 调试

1. 打开开发者工具 → Network → WS
2. 找到 WebSocket 连接
3. 查看 Messages 标签页
4. 可以看到发送和接收的消息

### 8.3 控制台调试

```javascript
// 在控制台手动测试 API
fetch('https://api.hyperliquid-testnet.xyz/info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'meta' })
}).then(r => r.json()).then(console.log);
```

---

## 9. 环境切换脚本

### 9.1 package.json

```json
{
  "scripts": {
    "dev": "NEXT_PUBLIC_NETWORK=testnet next dev",
    "dev:mainnet": "NEXT_PUBLIC_NETWORK=mainnet next dev",
    "build": "NEXT_PUBLIC_NETWORK=mainnet next build",
    "build:testnet": "NEXT_PUBLIC_NETWORK=testnet next build"
  }
}
```

### 9.2 使用方式

```bash
# 开发环境 (默认测试网)
pnpm dev

# 开发环境 (主网)
pnpm dev:mainnet

# 构建 (主网)
pnpm build

# 构建 (测试网)
pnpm build:testnet
```

---

## 10. 上线检查清单

### 10.1 切换主网前

- [ ] 所有测试在测试网通过
- [ ] 环境变量配置正确
- [ ] Builder 地址在主网有 100+ USDC
- [ ] 签名参数使用主网配置
- [ ] 资产 ID 使用主网数据
- [ ] WebSocket 地址切换到主网

### 10.2 主网小额测试

- [ ] 连接钱包
- [ ] 授权 Builder 费用
- [ ] 下一笔小额限价单
- [ ] 取消订单
- [ ] 下一笔小额市价单
- [ ] 确认 Builder 费用到账

### 10.3 监控

- [ ] 设置错误监控 (Sentry 等)
- [ ] 设置性能监控
- [ ] 设置 API 调用监控
- [ ] 设置 WebSocket 连接监控

---

## 11. 内部转账（USDC Transfer）

### 11.1 转账方式

HyperLiquid 支持在 HyperCore 上进行内部 USDC 转账。

#### 方式一：通过 Web 界面

1. 访问 [https://app.hyperliquid-testnet.xyz](https://app.hyperliquid-testnet.xyz)
2. 点击右上角账户图标
3. 找到 **Transfer** 或 **Send** 选项
4. 输入目标地址和金额
5. 签名确认

#### 方式二：通过 API

```typescript
// POST https://api.hyperliquid-testnet.xyz/exchange
{
  "action": {
    "type": "usdSend",
    "hyperliquidChain": "Testnet",  // 主网使用 "Mainnet"
    "signatureChainId": "0x66eee",   // 主网使用 "0xa4b1"
    "destination": "0x目标地址",
    "amount": "100",                 // USDC 金额（字符串）
    "time": 1700000000000            // 时间戳 nonce
  },
  "nonce": 1700000000000,
  "signature": { "r": "...", "s": "...", "v": 27 }
}
```

### 11.2 转账限制

| 项目 | 说明 |
|------|------|
| 最小金额 | 无明确限制 |
| 手续费 | 内部转账免费 |
| 确认时间 | 即时到账 |

> **参考文档**: [USDC Transfer API](https://docs.chainstack.com/reference/hyperliquid-exchange-usd-send)

---

## 12. MetaMask 网络配置

### 12.1 重要说明

**HyperCore 和 HyperEVM 是两个不同的层**：

| 层 | 资产类型 | MetaMask 可见 |
|---|---------|--------------|
| HyperCore | 交易账户 USDC（水龙头领取） | ❌ 不可见 |
| HyperEVM | EVM 钱包 HYPE | ✅ 可见 |

**水龙头领取的 USDC 在 HyperCore 上，无法在 MetaMask 中直接查看。**

### 12.2 添加 HyperEVM 到 MetaMask

如需使用 HyperEVM（部署合约、持有 HYPE 等）：

#### 主网配置

| 参数 | 值 |
|------|-----|
| Network Name | `Hyperliquid EVM` |
| RPC URL | `https://rpc.hyperliquid.xyz/evm` |
| Chain ID | `999` |
| Currency Symbol | `HYPE` |
| Block Explorer | `https://hyperevmscan.io` |

#### 测试网配置

| 参数 | 值 |
|------|-----|
| Network Name | `Hyperliquid EVM Testnet` |
| RPC URL | `https://rpc.hyperliquid-testnet.xyz/evm` |
| Chain ID | `998` |
| Currency Symbol | `HYPE` |
| Block Explorer | `https://testnet.hyperevmscan.io` |

### 12.3 添加方式

#### 方式一：ChainList（推荐）

1. 访问 [chainlist.org](https://chainlist.org/chain/999)
2. 搜索 "HyperEVM"
3. 点击 "Add to MetaMask"
4. 确认添加

#### 方式二：手动添加

1. 打开 MetaMask
2. 设置 → 网络 → 添加网络
3. 填入上述参数
4. 保存

### 12.4 HyperCore → HyperEVM 转账

如果需要在 MetaMask 中看到资产：

```
1. 在 HyperLiquid 官网用 USDC 购买 HYPE
   └─ https://app.hyperliquid.xyz (永续或现货)

2. 将 HYPE 从 HyperCore 转到 HyperEVM
   └─ 在官网找到 "Transfer to EVM" 选项

3. MetaMask 添加 HyperEVM 网络
   └─ 此时可以看到 HYPE 余额
```

### 12.5 相关文档

- [HyperEVM 官方文档](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/hyperevm)
- [How to use HyperEVM](https://hyperliquid.gitbook.io/hyperliquid-docs/onboarding/how-to-use-the-hyperevm)
- [ChainList - HyperEVM](https://chainlist.org/chain/999)

---

## 13. Builder Code 机制详解

### 13.1 概述

Builder Code 允许第三方平台（Builder）通过代发交易获取部分手续费。这是 HyperLiquid 支持第三方前端的核心机制。

### 13.2 签名机制说明

Builder Code 机制涉及两个不同的签名场景：

#### ApproveBuilderFee（需要用户主钱包签名）

| 项目 | 说明 |
|------|------|
| 签名要求 | **必须由用户主钱包签名** |
| Agent/API 钱包 | ❌ 不可用 |
| 操作频率 | 一次性授权，后续无需重复 |
| 用途 | 用户授权 Builder 从其交易中收取最大费率 |

#### 订单中的 builder 参数（不需要单独签名）

| 项目 | 说明 |
|------|------|
| 参数格式 | `{"b": "0x...", "f": 10}` |
| `b` 字段 | Builder 地址（必须小写） |
| `f` 字段 | 费用，以十分之一基点为单位（10 = 1bp = 0.01%） |
| 签名方式 | 作为订单的一部分，随订单一起签名 |
| 单独签名 | ❌ **buildAddress 本身不需要单独签名** |

### 13.3 费率限制

| 交易类型 | 最大费率 |
|---------|---------|
| 永续合约 (Perps) | 0.1% (10 bp) |
| 现货 (Spot) | 1% (100 bp) |

### 13.4 Builder 要求

| 要求 | 说明 |
|------|------|
| 最低资金 | perps 账户需有 **100+ USDC** |
| 地址格式 | 42 字符十六进制，必须小写 |

---

## 14. ApproveBuilderFee 操作指南

### 14.1 操作流程

```
用户首次使用 Builder 服务
         ↓
调用 ApproveBuilderFee（主钱包签名）
         ↓
授权成功，记录最大费率
         ↓
后续订单可携带 builder 参数
         ↓
Builder 从成交中收取费用
```

### 14.2 API 请求格式

```typescript
// POST https://api.hyperliquid.xyz/exchange (主网)
// POST https://api.hyperliquid-testnet.xyz/exchange (测试网)

{
  "action": {
    "type": "approveBuilderFee",
    "hyperliquidChain": "Mainnet",      // 测试网使用 "Testnet"
    "signatureChainId": "0xa4b1",       // 测试网使用 "0x66eee"
    "builder": "0x...",                 // Builder 地址（42字符，小写）
    "maxFeeRate": "0.01%",              // 最大授权费率（字符串格式）
    "nonce": 1700000000000              // 时间戳 (毫秒)
  },
  "nonce": 1700000000000,
  "signature": {
    "r": "0x...",
    "s": "0x...",
    "v": 27
  }
}
```

### 14.3 参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `type` | string | 固定值 `"approveBuilderFee"` |
| `hyperliquidChain` | string | `"Mainnet"` 或 `"Testnet"` |
| `signatureChainId` | string | 主网 `"0xa4b1"`，测试网 `"0x66eee"` |
| `builder` | string | Builder 地址，必须小写 |
| `maxFeeRate` | string | 最大费率，如 `"0.01%"` 或 `"0.001%"` |
| `nonce` | number | 当前时间戳（毫秒） |

### 14.4 Python SDK 示例

```python
from hyperliquid.utils import constants
from hyperliquid.exchange import Exchange
from hyperliquid.info import Info
from eth_account import Account

def approve_builder_fee_example():
    # 设置钱包（必须使用主钱包，不能用 Agent 钱包）
    secret_key = "your_private_key"
    account = Account.from_key(secret_key)

    # 初始化（测试网）
    info = Info(constants.TESTNET_API_URL, skip_ws=True)
    exchange = Exchange(account, constants.TESTNET_API_URL)

    # 验证是主钱包
    if exchange.account_address != exchange.wallet.address:
        raise Exception("Only the main wallet has permission to approve a builder fee")

    # 授权 Builder 费率
    builder_address = "0x8c967e73e7b15087c42a10d344cff4c96d877f1d"  # 必须小写
    max_fee_rate = "0.01%"  # 最大允许 Builder 收取 0.01%

    result = exchange.approve_builder_fee(builder_address, max_fee_rate)
    print("Approve result:", result)

    return result

if __name__ == "__main__":
    approve_builder_fee_example()
```

### 14.5 TypeScript/JavaScript 实现

```typescript
import { ethers } from 'ethers';

interface ApproveBuilderFeeAction {
  type: 'approveBuilderFee';
  hyperliquidChain: 'Mainnet' | 'Testnet';
  signatureChainId: string;
  builder: string;
  maxFeeRate: string;
  nonce: number;
}

async function approveBuilderFee(
  wallet: ethers.Wallet,
  builderAddress: string,
  maxFeeRate: string,
  isMainnet: boolean = false
) {
  const baseUrl = isMainnet
    ? 'https://api.hyperliquid.xyz'
    : 'https://api.hyperliquid-testnet.xyz';

  const nonce = Date.now();

  const action: ApproveBuilderFeeAction = {
    type: 'approveBuilderFee',
    hyperliquidChain: isMainnet ? 'Mainnet' : 'Testnet',
    signatureChainId: isMainnet ? '0xa4b1' : '0x66eee',
    builder: builderAddress.toLowerCase(),
    maxFeeRate,
    nonce
  };

  // EIP-712 签名
  const domain = {
    name: 'HyperliquidSignTransaction',
    version: '1',
    chainId: isMainnet ? 42161 : 421614,
    verifyingContract: '0x0000000000000000000000000000000000000000'
  };

  const types = {
    'HyperliquidTransaction:ApproveBuilderFee': [
      { name: 'hyperliquidChain', type: 'string' },
      { name: 'maxFeeRate', type: 'string' },
      { name: 'builder', type: 'address' },
      { name: 'nonce', type: 'uint64' }
    ]
  };

  const signature = await wallet._signTypedData(domain, types, {
    hyperliquidChain: action.hyperliquidChain,
    maxFeeRate: action.maxFeeRate,
    builder: action.builder,
    nonce: action.nonce
  });

  const { r, s, v } = ethers.utils.splitSignature(signature);

  const response = await fetch(`${baseUrl}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action,
      nonce,
      signature: { r, s, v }
    })
  });

  return response.json();
}

// 使用示例
async function main() {
  const wallet = new ethers.Wallet('your_private_key');
  const builderAddress = '0x8c967e73e7b15087c42a10d344cff4c96d877f1d';

  const result = await approveBuilderFee(
    wallet,
    builderAddress,
    '0.01%',   // 最大费率
    false      // 测试网
  );

  console.log('Result:', result);
}
```

### 14.6 查询已授权的 Builder 费率

```typescript
// POST /info
{
  "type": "maxBuilderFee",
  "user": "0x用户地址",
  "builder": "0xBuilder地址"
}

// 响应示例
{
  "maxFeeRate": "0.01%"  // 已授权的最大费率，如未授权则返回 null
}
```

### 14.7 授权后下单示例

```typescript
// 授权后，订单可携带 builder 参数
const orderAction = {
  type: 'order',
  orders: [{
    a: 0,                    // 资产 ID
    b: true,                 // 买入
    p: '50000',              // 价格
    s: '0.001',              // 数量
    r: false,                // 非 reduce-only
    t: { limit: { tif: 'Gtc' } }
  }],
  grouping: 'na',
  builder: {
    b: '0x8c967e73e7b15087c42a10d344cff4c96d877f1d',  // Builder 地址
    f: 1                                              // 费用: 1 = 0.1bp = 0.001%
  }
};
```

### 14.8 注意事项

| 事项 | 说明 |
|------|------|
| 钱包要求 | **必须使用主钱包**，Agent/API 钱包无权限 |
| 地址格式 | Builder 地址必须**全部小写** |
| 费率格式 | 字符串格式，如 `"0.01%"` |
| 撤销授权 | 可随时重新授权更低费率或 `"0%"` 来撤销 |
| 生效范围 | 授权仅对指定 Builder 生效 |

### 14.9 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `Not authorized` | 使用了 Agent 钱包 | 切换到主钱包签名 |
| `Invalid builder address` | 地址格式错误 | 确保 42 字符且小写 |
| `Fee rate too high` | 费率超出限制 | Perps ≤0.1%, Spot ≤1% |
| `Builder not eligible` | Builder 资金不足 | Builder 需 100+ USDC |

### 14.10 参考资料

- [Builder Codes 官方文档](https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes)
- [Exchange Endpoint API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint)
- [Python SDK 示例](https://github.com/hyperliquid-dex/hyperliquid-python-sdk/blob/master/examples/basic_builder_fee.py)
- [签名说明](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing)

---

## 15. 第三方 DEX 测试网支持情况

### 15.1 Based.one

**Based.one 目前不支持 HyperLiquid 测试网。**

| 调研项目 | 结论 |
|---------|------|
| 网络切换选项 | ❌ 前端无可见的网络切换 UI |
| 测试网域名 | ❌ `testnet.based.one` 重定向至主网 |
| 后端支持 | ⚠️ 代码中有 `onlyTestnet: false` 配置 |
| 用户入口 | ❌ 无公开的测试网入口 |

#### 分析

- Based.one 的前端代码包含 `"onlyTestnet": false` 配置项
- 说明后端架构上预留了测试网支持能力
- 但前端界面未暴露网络切换选项
- 普通用户无法使用 Based.one 连接测试网

### 15.2 测试网开发方案

如果需要在测试网环境开发和测试，有以下方案：

| 方案 | 说明 | 适用场景 |
|------|------|---------|
| **HyperLiquid 官方测试网** | [app.hyperliquid-testnet.xyz](https://app.hyperliquid-testnet.xyz) | 功能验证、API 测试 |
| **自建 DEX 前端** | 基于本项目文档实现 | 完整开发、自定义功能 |

### 15.3 自建 DEX 的优势

相比依赖第三方平台，基于 BuildCode 自建 DEX 有以下优势：

| 优势 | 说明 |
|------|------|
| **测试网支持** | 可自由切换主网/测试网 |
| **环境变量控制** | `NEXT_PUBLIC_NETWORK=testnet` |
| **完整调试能力** | 可查看所有 API 请求/响应 |
| **自定义 Builder 费率** | 完全控制费率设置 |
| **功能定制** | 不受第三方平台限制 |

### 15.4 相关配置

测试网配置已在本文档 [第 2 节](#2-环境配置) 详细说明：

```typescript
// 通过环境变量切换网络
const CURRENT_NETWORK = process.env.NEXT_PUBLIC_NETWORK === 'mainnet'
  ? NETWORKS.mainnet
  : NETWORKS.testnet;
```

```bash
# 开发命令
pnpm dev           # 默认测试网
pnpm dev:mainnet   # 主网
```
