# HyperLiquid API 页面-字段映射

本文档整理了 HyperLiquid API 字段与 DEX 平台页面组件的对应关系，用于指导前端开发。

## 目录

1. [交易页面](#1-交易页面)
2. [Portfolio 页面](#2-portfolio-页面)
3. [市场总览页面](#3-市场总览页面)
4. [Vault 页面](#4-vault-页面)
5. [设置/账户页面](#5-设置账户页面)

---

## 1. 交易页面

交易页面路由: `/BTC`, `/ETH` (永续) 或 `/HYPE/USDC` (现货)

### 1.1 价格头部

| UI 元素    | 字段路径                 | API                 | 计算/格式化                             |
| ---------- | ------------------------ | ------------------- | --------------------------------------- |
| 当前价格   | `mids[symbol]`           | WS: allMids         | 直接显示                                |
| 24h 涨跌%  | -                        | metaAndAssetCtxs    | `(midPx - prevDayPx) / prevDayPx × 100` |
| 24h 最高   | `candle.h`               | candleSnapshot (1d) | 取当日 K 线最高价                       |
| 24h 最低   | `candle.l`               | candleSnapshot (1d) | 取当日 K 线最低价                       |
| 24h 成交额 | `assetCtxs[i].dayNtlVlm` | metaAndAssetCtxs    | 格式化为 K/M/B                          |
| 资金费率   | `assetCtxs[i].funding`   | metaAndAssetCtxs    | `× 100%` 显示                           |
| 标记价格   | `assetCtxs[i].markPx`    | metaAndAssetCtxs    | 直接显示                                |
| 预言机价格 | `assetCtxs[i].oraclePx`  | metaAndAssetCtxs    | 直接显示                                |
| 倒计时     | -                        | predictedFundings   | 到下次结算的时间差                      |

**数据来源优先级:**

1. 实时价格: WebSocket `allMids` 订阅
2. 初始数据: `metaAndAssetCtxs` 接口

### 1.2 订单簿

| UI 元素  | 字段路径          | API    | 说明         |
| -------- | ----------------- | ------ | ------------ |
| 买盘价格 | `levels[0][i].px` | l2Book | 降序排列     |
| 买盘数量 | `levels[0][i].sz` | l2Book | 累加显示深度 |
| 卖盘价格 | `levels[1][i].px` | l2Book | 升序排列     |
| 卖盘数量 | `levels[1][i].sz` | l2Book | 累加显示深度 |
| 订单数   | `levels[x][i].n`  | l2Book | 可选显示     |
| 更新时间 | `time`            | l2Book | 毫秒时间戳   |

**数据更新:**

- 初始: `l2Book` REST 接口
- 实时: WebSocket `l2Book` 订阅

### 1.3 最近成交

| UI 元素 | 字段路径   | API          | 说明               |
| ------- | ---------- | ------------ | ------------------ |
| 价格    | `[i].px`   | recentTrades | -                  |
| 数量    | `[i].sz`   | recentTrades | -                  |
| 方向    | `[i].side` | recentTrades | `B`=绿色, `A`=红色 |
| 时间    | `[i].time` | recentTrades | 格式化为 HH:mm:ss  |

**数据更新:**

- 初始: `recentTrades` REST 接口
- 实时: WebSocket `trades` 订阅

### 1.4 K 线图

| UI 元素 | 字段路径 | API            | 说明       |
| ------- | -------- | -------------- | ---------- |
| 时间    | `[i].t`  | candleSnapshot | X 轴坐标   |
| 开盘价  | `[i].o`  | candleSnapshot | K 线体     |
| 收盘价  | `[i].c`  | candleSnapshot | K 线体     |
| 最高价  | `[i].h`  | candleSnapshot | 上影线     |
| 最低价  | `[i].l`  | candleSnapshot | 下影线     |
| 成交量  | `[i].v`  | candleSnapshot | 底部柱状图 |

**数据更新:**

- 初始: `candleSnapshot` REST 接口
- 实时: WebSocket `candle` 订阅

### 1.5 下单面板

| UI 元素  | 数据来源                      | API                    | 说明           |
| -------- | ----------------------------- | ---------------------- | -------------- |
| 可用余额 | `withdrawable`                | clearinghouseState     | 永续可用       |
| 可用余额 | `balances[USDC].total - hold` | spotClearinghouseState | 现货可用       |
| 杠杆选择 | `universe[i].maxLeverage`     | meta                   | 最大杠杆限制   |
| 数量精度 | `universe[i].szDecimals`      | meta                   | 输入验证       |
| 当前杠杆 | `position.leverage.value`     | clearinghouseState     | 有持仓时显示   |
| 杠杆模式 | `position.leverage.type`      | clearinghouseState     | cross/isolated |

### 1.6 当前持仓 (交易页)

| UI 元素 | 字段路径                  | API                | 说明            |
| ------- | ------------------------- | ------------------ | --------------- |
| 币种    | `position.coin`           | clearinghouseState | -               |
| 数量    | `position.szi`            | clearinghouseState | 正=多, 负=空    |
| 开仓价  | `position.entryPx`        | clearinghouseState | -               |
| 标记价  | 从 metaAndAssetCtxs 获取  | metaAndAssetCtxs   | markPx          |
| 盈亏    | `position.unrealizedPnl`  | clearinghouseState | 带颜色          |
| 收益率  | `position.returnOnEquity` | clearinghouseState | `× 100%`        |
| 清算价  | `position.liquidationPx`  | clearinghouseState | null 则显示 "-" |
| 杠杆    | `position.leverage.value` | clearinghouseState | -               |

### 1.7 当前挂单 (交易页)

| UI 元素 | 字段路径        | API                | 说明             |
| ------- | --------------- | ------------------ | ---------------- |
| 币种    | `[i].coin`      | frontendOpenOrders | -                |
| 方向    | `[i].side`      | frontendOpenOrders | B=买/绿, A=卖/红 |
| 类型    | `[i].orderType` | frontendOpenOrders | Limit/Stop 等    |
| 价格    | `[i].limitPx`   | frontendOpenOrders | -                |
| 数量    | `[i].sz`        | frontendOpenOrders | 剩余数量         |
| 已成交  | `origSz - sz`   | frontendOpenOrders | 计算得出         |
| 时间    | `[i].timestamp` | frontendOpenOrders | -                |
| 触发价  | `[i].triggerPx` | frontendOpenOrders | 条件单显示       |

**数据更新:**

- 实时: WebSocket `orderUpdates` 订阅

---

## 2. Portfolio 页面

### 2.1 账户概览

| UI 元素    | 字段路径                        | API                | 说明                         |
| ---------- | ------------------------------- | ------------------ | ---------------------------- |
| 账户净值   | `marginSummary.accountValue`    | clearinghouseState | 永续账户                     |
| 已用保证金 | `marginSummary.totalMarginUsed` | clearinghouseState | -                            |
| 可用余额   | `withdrawable`                  | clearinghouseState | 可提取金额                   |
| 持仓价值   | `marginSummary.totalNtlPos`     | clearinghouseState | 名义价值                     |
| 账户杠杆   | 计算                            | -                  | `totalNtlPos / accountValue` |

### 2.2 永续持仓列表

| UI 元素    | 字段路径                           | API                | 说明          |
| ---------- | ---------------------------------- | ------------------ | ------------- |
| 币种       | `assetPositions[i].position.coin`  | clearinghouseState | -             |
| 方向       | `szi > 0` ? "多" : "空"            | clearinghouseState | 根据 szi 判断 |
| 数量       | `abs(szi)`                         | clearinghouseState | 取绝对值      |
| 开仓价     | `entryPx`                          | clearinghouseState | -             |
| 标记价     | 从 metaAndAssetCtxs 获取           | metaAndAssetCtxs   | -             |
| 持仓价值   | `positionValue`                    | clearinghouseState | USD           |
| 未实现盈亏 | `unrealizedPnl`                    | clearinghouseState | 带颜色        |
| 收益率     | `returnOnEquity × 100%`            | clearinghouseState | -             |
| 清算价     | `liquidationPx`                    | clearinghouseState | null = "-"    |
| 杠杆       | `leverage.value` + `leverage.type` | clearinghouseState | 如 "10x 全仓" |
| 保证金     | `marginUsed`                       | clearinghouseState | -             |

### 2.3 现货资产列表

| UI 元素 | 字段路径           | API                    | 说明                      |
| ------- | ------------------ | ---------------------- | ------------------------- |
| 币种    | `balances[i].coin` | spotClearinghouseState | -                         |
| 总量    | `total`            | spotClearinghouseState | -                         |
| 可用    | `total - hold`     | spotClearinghouseState | 计算                      |
| 冻结    | `hold`             | spotClearinghouseState | 挂单占用                  |
| 估值    | `total × midPx`    | 计算                   | 需要 spotMetaAndAssetCtxs |
| 成本    | `entryNtl`         | spotClearinghouseState | -                         |
| 盈亏    | `估值 - entryNtl`  | 计算                   | -                         |

### 2.4 历史订单

| UI 元素 | 字段路径        | API              | 说明            |
| ------- | --------------- | ---------------- | --------------- |
| 币种    | `[i].coin`      | historicalOrders | -               |
| 方向    | `[i].side`      | historicalOrders | B/A             |
| 类型    | `[i].orderType` | historicalOrders | -               |
| 委托价  | `[i].limitPx`   | historicalOrders | -               |
| 委托量  | `[i].origSz`    | historicalOrders | -               |
| 成交量  | `[i].sz`        | historicalOrders | -               |
| 状态    | `[i].status`    | historicalOrders | filled/canceled |
| 时间    | `[i].timestamp` | historicalOrders | -               |
| 盈亏    | `[i].closedPnl` | historicalOrders | 平仓单显示      |

### 2.5 成交记录

| UI 元素 | 字段路径        | API       | 说明                  |
| ------- | --------------- | --------- | --------------------- |
| 币种    | `[i].coin`      | userFills | -                     |
| 方向    | `[i].side`      | userFills | B/A                   |
| 类型    | `[i].dir`       | userFills | Open/Close Long/Short |
| 成交价  | `[i].px`        | userFills | -                     |
| 数量    | `[i].sz`        | userFills | -                     |
| 手续费  | `[i].fee`       | userFills | -                     |
| 盈亏    | `[i].closedPnl` | userFills | 平仓显示              |
| 时间    | `[i].time`      | userFills | -                     |
| Taker   | `[i].crossed`   | userFills | true=吃单             |

### 2.6 资金费用历史

| UI 元素 | 字段路径          | API         | 说明             |
| ------- | ----------------- | ----------- | ---------------- |
| 时间    | `[i].time`        | userFunding | -                |
| 币种    | `[i].coin`        | userFunding | -                |
| 金额    | `[i].usdc`        | userFunding | 正=收取, 负=支付 |
| 持仓    | `[i].szi`         | userFunding | 当时持仓量       |
| 费率    | `[i].fundingRate` | userFunding | -                |

### 2.7 账户流水

| UI 元素 | 字段路径         | API                         | 说明                |
| ------- | ---------------- | --------------------------- | ------------------- |
| 时间    | `[i].time`       | userNonFundingLedgerUpdates | -                   |
| 类型    | `[i].delta.type` | userNonFundingLedgerUpdates | deposit/withdraw 等 |
| 金额    | `[i].delta.usdc` | userNonFundingLedgerUpdates | -                   |
| 手续费  | `[i].delta.fee`  | userNonFundingLedgerUpdates | 提款时              |

---

## 3. 市场总览页面

### 3.1 永续市场列表

| UI 元素    | 字段路径                    | API              | 说明                          |
| ---------- | --------------------------- | ---------------- | ----------------------------- |
| 交易对     | `universe[i].name`          | metaAndAssetCtxs | -                             |
| 当前价     | `assetCtxs[i].midPx`        | metaAndAssetCtxs | 或 markPx                     |
| 24h 涨跌   | 计算                        | metaAndAssetCtxs | `(midPx-prevDayPx)/prevDayPx` |
| 24h 成交额 | `assetCtxs[i].dayNtlVlm`    | metaAndAssetCtxs | 格式化                        |
| 资金费率   | `assetCtxs[i].funding`      | metaAndAssetCtxs | `× 100%`                      |
| 未平仓量   | `assetCtxs[i].openInterest` | metaAndAssetCtxs | -                             |
| 最大杠杆   | `universe[i].maxLeverage`   | metaAndAssetCtxs | -                             |

### 3.2 现货市场列表

| UI 元素    | 字段路径                         | API                  | 说明 |
| ---------- | -------------------------------- | -------------------- | ---- |
| 交易对     | `universe[i].name`               | spotMetaAndAssetCtxs | -    |
| 当前价     | `assetCtxs[i].midPx`             | spotMetaAndAssetCtxs | -    |
| 24h 涨跌   | 计算                             | spotMetaAndAssetCtxs | -    |
| 24h 成交额 | `assetCtxs[i].dayNtlVlm`         | spotMetaAndAssetCtxs | -    |
| 流通量     | `assetCtxs[i].circulatingSupply` | spotMetaAndAssetCtxs | -    |

### 3.3 代币详情

| UI 元素  | 字段路径            | API          | 说明 |
| -------- | ------------------- | ------------ | ---- |
| 名称     | `name`              | tokenDetails | -    |
| 当前价   | `midPx`             | tokenDetails | -    |
| 最大供应 | `maxSupply`         | tokenDetails | -    |
| 总供应   | `totalSupply`       | tokenDetails | -    |
| 流通供应 | `circulatingSupply` | tokenDetails | -    |
| 部署者   | `deployer`          | tokenDetails | 可选 |
| 部署时间 | `deployTime`        | tokenDetails | 可选 |

---

## 4. Vault 页面

### 4.1 Vault 列表

| UI 元素  | 字段路径   | API          | 说明       |
| -------- | ---------- | ------------ | ---------- |
| 名称     | `name`     | vaultDetails | -          |
| 管理者   | `leader`   | vaultDetails | -          |
| APR      | `apr`      | vaultDetails | 年化收益率 |
| 是否关闭 | `isClosed` | vaultDetails | -          |

### 4.2 Vault 详情

| UI 元素  | 字段路径      | API          | 说明     |
| -------- | ------------- | ------------ | -------- |
| 名称     | `name`        | vaultDetails | -        |
| 描述     | `description` | vaultDetails | -        |
| 管理者   | `leader`      | vaultDetails | -        |
| 持仓组合 | `portfolio`   | vaultDetails | 复杂对象 |
| 收益曲线 | `pnlHistory`  | vaultDetails | 图表数据 |

### 4.3 我的 Vault 投资

| UI 元素    | 字段路径            | API               | 说明   |
| ---------- | ------------------- | ----------------- | ------ |
| Vault 名称 | `[i].vaultName`     | userVaultEquities | -      |
| 当前价值   | `[i].equity`        | userVaultEquities | -      |
| 投入金额   | `[i].initialEquity` | userVaultEquities | -      |
| 累计盈亏   | `[i].allTimePnl`    | userVaultEquities | -      |
| 锁定期     | `[i].lockupUntil`   | userVaultEquities | 时间戳 |

---

## 5. 设置/账户页面

### 5.1 推荐系统

| UI 元素    | 字段路径                  | API      | 说明    |
| ---------- | ------------------------- | -------- | ------- |
| 推荐人     | `referredBy`              | referral | null=无 |
| 累计交易量 | `cumVlm`                  | referral | -       |
| 待领取奖励 | `unclaimedRewards`        | referral | -       |
| 已领取奖励 | `claimedRewards`          | referral | -       |
| 我的推荐码 | `referrerState.code`      | referral | 如有    |
| 被推荐人数 | `referrerState.nReferred` | referral | -       |

### 5.2 子账户管理

| UI 元素    | 字段路径                 | API         | 说明     |
| ---------- | ------------------------ | ----------- | -------- |
| 子账户地址 | `[i].subAccountUser`     | subAccounts | -        |
| 子账户名称 | `[i].name`               | subAccounts | -        |
| 账户状态   | `[i].clearinghouseState` | subAccounts | 可选展开 |

### 5.3 API 状态

| UI 元素    | 字段路径           | API           | 说明     |
| ---------- | ------------------ | ------------- | -------- |
| 累计交易量 | `cumVlm`           | userRateLimit | VIP 等级 |
| 已用请求数 | `nRequestsUsed`    | userRateLimit | -        |
| 请求上限   | `nRequestsCap`     | userRateLimit | -        |
| 剩余请求   | `nRequestsSurplus` | userRateLimit | -        |

### 5.4 Builder 授权

| UI 元素  | 字段路径           | API           | 说明        |
| -------- | ------------------ | ------------- | ----------- |
| 授权状态 | 返回值             | maxBuilderFee | 0=未授权    |
| 授权费率 | 返回值 / 100 + "%" | maxBuilderFee | bp 转百分比 |

---

## WebSocket 订阅映射

| 页面/组件 | 订阅类型       | 数据用途      |
| --------- | -------------- | ------------- |
| 价格头部  | `allMids`      | 实时价格更新  |
| 订单簿    | `l2Book`       | 实时深度更新  |
| 最近成交  | `trades`       | 实时成交推送  |
| K 线图    | `candle`       | 实时 K 线更新 |
| 持仓/账户 | `webData2`     | 组合数据推送  |
| 挂单列表  | `orderUpdates` | 订单状态更新  |
| 成交通知  | `userFills`    | 用户成交推送  |

---

## 数据刷新策略

| 数据类型 | 初始加载                | 实时更新    | 刷新频率        |
| -------- | ----------------------- | ----------- | --------------- |
| 元数据   | REST metaAndAssetCtxs   | -           | 启动时/切换网络 |
| 价格     | REST allMids            | WS allMids  | 实时            |
| 订单簿   | REST l2Book             | WS l2Book   | 实时            |
| K 线     | REST candleSnapshot     | WS candle   | 实时            |
| 账户状态 | REST clearinghouseState | WS webData2 | 实时            |
| 历史数据 | REST userFills 等       | -           | 用户触发        |
