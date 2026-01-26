## Based.one Testnet 交易页 API 技术方案（HyperLiquid 集成）

### 0. 范围与目标

- 覆盖 testnet.based.one 的 Perps/Spot/Portfolio 交易相关全部 API 调用与映射（不遗漏 Info/Exchange/WebSocket）
- 聚焦 HyperLiquid Testnet (`https://api.hyperliquid-testnet.xyz`, `wss://api.hyperliquid-testnet.xyz/ws`)，钱包地址 `0xEfc3a654A44FACd6dA111f3114CDd65F16d9a681` 已有 USDC 余额
- 仅技术方案与示例，不写业务代码；签名细节与构造参数给出可落地示例

### 1. 页面功能与 API 映射（Perps BTC 页面实测）

1. 市场初始化

- REST /info `allPerpMetas`：永续合约元数据（精度、maxLeverage、marginTableId）
- REST /info `perpDexs`：DEX 列表与 deployer、feeRecipient、assetToStreamingOiCap 等
- REST /info `candleSnapshot`：K 线初始数据（实测 5m，提供 startTime/endTime）
- REST /info `spotMeta`：现货元数据（Spot 页预加载）

2. 行情/图表/订单簿

- REST /info `candleSnapshot`：用于 TradingView 初始渲染
- WebSocket 订阅：`l2Book`, `trades`, `candle`, `allMids`（实时更新）

3. 账户与资产

- REST /info `clearinghouseState`（perps），`spotClearinghouseState`（spot）
- REST /info `userFills`（aggregateByTime=true 用于成交汇总）
- Portfolio 页补充：`openOrders`, `fundingHistory`, `orderHistory`（同 /info）

4. 下单/撤单/修改（需签名，Exchange 端点）

- REST /exchange `order`：下单（含 builder 费率字段）
- REST /exchange `cancel` 或 `cancelByCloid`
- REST /exchange `modify`：改单
- REST /exchange `updateLeverage`：切换逐仓/全仓或倍率
- REST /exchange 资金类：`spotTransfer`, `vaultTransfer`, `withdraw`, `approveBuilderFee`

5. BuildCode 与费用

- /info `maxBuilderFee`：查询用户对 builder 的授权上限
- /exchange `approveBuilderFee`：用户授权 builder 费率
- order 参数中的 `builder` 字段：`{"b": builderAddress, "f": feeInTenthsOfBps}`

### 2. REST /info 调用清单（需覆盖）

- 市场元数据：`meta`, `metaAndAssetCtxs`, `allPerpMetas`, `spotMeta`, `spotMetaAndAssetCtxs`, `perpDexs`
- 行情数据：`l2Book`, `candleSnapshot`, `openInterest`, `fundingHistory`, `userFunding`, `userStats`
- 账户数据：`clearinghouseState`, `spotClearinghouseState`, `openOrders`, `userFills`, `orderHistory`
- BuildCode 相关：`maxBuilderFee`
- 其他常用：`allMids`, `recentTrades`, `riskLimits`, `assetCtxs`（如需单资产上下文）

调用格式示例：

```json
POST /info
{ "type": "candleSnapshot", "req": { "coin": "BTC", "interval": "5m", "startTime": 1768821900000, "endTime": 1768972200000 } }
```

### 3. REST /exchange 调用与参数要点

- 端点：`POST https://api.hyperliquid-testnet.xyz/exchange`
- 通用字段：`signature`, `nonce`（毫秒时间戳，需在 T±(2d,1d) 窗口），`action` 对象
- 下单示例（限价买多）：

```json
{
  "action": {
    "type": "order",
    "orders": [
      {
        "a": 3, // asset id (BTC perp index=3, 示例，请根据 meta 对应)
        "b": true, // buy=true, sell=false
        "p": 89400.0, // price
        "s": 0.001, // size
        "tif": "Gtc", // Gtc / Ioc / Alo / FaK / FoK
        "cloid": "client-123",
        "builder": { "b": "0xBUILDER", "f": 10 } // 10 = 1 bps = 0.01%
      }
    ]
  },
  "nonce": 1768972500000,
  "signature": "0x..." // EIP-712 sign_l1_action
}
```

- 撤单：`{ "type": "cancel", "cancels": [{"a": 3, "o": 123456}] }`
- 按 cloid 撤单：`{ "type": "cancelByCloid", "cancels": [{"asset": 3, "cloid": "client-123"}] }`
- 修改：`{ "type": "modify", "modifies": [{"oid": 123456, "p": 89350.0, "s": 0.002}] }`
- 杠杆：`{ "type": "updateLeverage", "asset": 3, "isCross": false, "leverage": 20 }`
- Builder 授权：`{ "type": "approveBuilderFee", "builder": "0xBUILDER", "maxFeeRate": 100 }`（100=0.1% 上限）
- 资金转移（示例 spot -> perps）：`{ "type": "spotTransfer", "coin": "USDC", "sz": 100 }`

### 4. WebSocket 订阅（wss://api.hyperliquid-testnet.xyz/ws）

核心订阅类型与用途：

- `l2Book`：订单簿增量
- `trades`：逐笔成交
- `candle`：K 线实时
- `allMids`：全市场中间价（行情快照）
- `orderUpdates`：用户订单状态（下单/部分成交/取消）
- `userFills`：用户成交推送
- `clearinghouseState`：账户权益/保证金实时
- `openOrders`：挂单实时
- `balanceState`：Spot 余额（若启用）

订阅示例：

```json
{ "method": "subscribe", "subscription": { "type": "l2Book", "coin": "BTC" } }
```

### 5. 签名实现（EIP-712）

- 两类签名：
  1. `sign_l1_action`：交易类（/exchange 下单/撤单/杠杆/资金转移）
  2. `sign_user_signed_action`：用户授权类（builder 费率、提现等）
- Domain（测试网）：`name: "Exchange"`, `chainId: 421614`, `verifyingContract: 0x0000000000000000000000000000000000000000`
- 注意事项：
  - 地址需小写；数字需去除尾随零（floatToWire）；nonce 为毫秒时间戳；字段顺序严格按规范
  - msgpack 序列化时字段顺序固定，避免 trailing zero / 大写地址导致签名验失败

### 6. Builder Fee / BuildCode 集成

- 查询：`/info` `maxBuilderFee`，入参 `{type: "maxBuilderFee", user, builder}`
- 授权：`/exchange` `approveBuilderFee`，`maxFeeRate` 单位是 tenths of bps；上限 0.1% perps / 1% spot
- 下单携带：`builder: { b: builderAddress, f: feeInTenthsOfBps }`

### 7. 资产 ID 规则（简化提示）

- 永续：index 即资产序号（来自 allPerpMetas.universe）
- 现货：`10000 + index`
- 自定义 DEX 永续：`100000 + perp_dex_index * 10000 + index`

### 8. 现网请求样例（截取实测）

- `POST /info {"type":"allPerpMetas"}` → 返回所有 perp 元数据（含 szDecimals, maxLeverage）
- `POST /info {"type":"perpDexs"}` → 返回 DEX 列表与 deployer、feeRecipient
- `POST /info {"type":"candleSnapshot", "req": {"coin":"BTC","interval":"5m",...}}` → K 线列表
- `POST /info {"type":"userFills","user":wallet,"aggregateByTime":true}` → []（无成交）
- `POST /info {"type":"spotClearinghouseState","user":wallet,"dex":""}` → {"balances": []}

### 9. 实装建议（dex-ui 接入）

- 数据拉取层：统一封装 /info typed 请求；按页面需要选择订阅 WebSocket，使用 topic 复用与去抖
- 签名层：封装 sign_l1_action / sign_user_signed_action，确保 floatToWire、nonce、EIP-712 域常量可配置（主网/测试网）
- Builder：首次下单前检查 maxBuilderFee；未授权则走 approveBuilderFee 流程
- 账户流：登录后并行拉取 clearinghouseState、openOrders、userFills；定期或事件驱动刷新
- 行情流：首次加载用 candleSnapshot + l2Book/trades 订阅；K 线可用 ws `candle` 补增量
- 失败与重试：对 /info 做指数退避；对 ws 保持心跳、自动重连

### 10. 已知限制与后续

- 浏览器自动化无法控制 MetaMask 扩展，实际签名需在前端集成钱包 SDK 完成
- 测试单未真实提交，但已确认请求模板、必需字段与签名流程；正式联调需前端钱包完成签名
