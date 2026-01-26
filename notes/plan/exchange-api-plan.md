# HyperLiquid Exchange API 文档整理计划

## 背景

**已完成（查询 API）：**

- `hyperliquid-query.http` - Info API 的 HTTP 测试和字段注释
- `api-page-mapping.md` - 页面-字段映射
- `src/types/hyperliquid/` - TypeScript 类型定义

**待整理（写操作 API）：**

- Exchange API（/exchange）- 所有交易操作接口

## 问题分析

| 特性     | Info API            | Exchange API               |
| -------- | ------------------- | -------------------------- |
| 端点     | POST /info          | POST /exchange             |
| 签名     | 不需要              | 需要 EIP-712 签名          |
| 测试方式 | HTTP 文件可直接执行 | 需要钱包签名，无法直接测试 |

**结论**：Exchange API 不适合用 `.http` 文件，改用 **Markdown 开发指南**。

---

## 需要覆盖的接口清单（共 16 个）

### 1. 订单操作（核心 - 5 个）

| 操作          | type            | 说明                        |
| ------------- | --------------- | --------------------------- |
| 下单          | `order`         | 永续/现货，限价/市价/条件单 |
| 撤单          | `cancel`        | 按订单ID                    |
| 按 cloid 撤单 | `cancelByCloid` | 按客户端订单ID              |
| 修改订单      | `modify`        | 修改价格/数量               |
| 批量修改      | `batchModify`   | 批量修改                    |

### 2. 账户操作（2 个）

| 操作           | type                   | 说明           |
| -------------- | ---------------------- | -------------- |
| 更新杠杆       | `updateLeverage`       | 杠杆倍数和模式 |
| 更新逐仓保证金 | `updateIsolatedMargin` | 增/减保证金    |

### 3. 资金操作（5 个）

| 操作       | type                 | 说明            |
| ---------- | -------------------- | --------------- |
| USDC 转账  | `usdSend`            | L2 内部转账     |
| 提现到 L1  | `withdraw3`          | 提现到 Arbitrum |
| 现货转账   | `spotSend`           | 现货代币转账    |
| 账户互转   | `usdClassTransfer`   | 永续↔现货       |
| 子账户转账 | `subAccountTransfer` | 主↔子账户       |

### 4. Vault 操作（2 个）

| 操作 | type            | 说明          |
| ---- | --------------- | ------------- |
| 存入 | `vaultDeposit`  | 投资 Vault    |
| 取出 | `vaultWithdraw` | 从 Vault 取出 |

### 5. 授权操作 - BuildCode 核心（2 个）

| 操作              | type                | 说明               |
| ----------------- | ------------------- | ------------------ |
| 授权 Builder 费率 | `approveBuilderFee` | **BuildCode 必需** |
| 授权 API 钱包     | `approveAgent`      | API 钱包代签       |

---

## 输出文件

### 1. Markdown 开发指南

`notes/hyperliquid/exchange-api-guide.md`

### 2. HTTP 参考文件（格式同 query.http）

`notes/hyperliquid/http/hyperliquid-exchange.http`

- 整理写接口的请求格式
- 签名参数保留（标注"需签名，无法直接执行"）
- 详细解释参数和返回值

### 3. TypeScript 类型检查

`src/types/hyperliquid/exchange.ts` - **已存在，需补充**

### 文档结构

```
# HyperLiquid Exchange API 开发指南

## 1. 概述
   - API 端点
   - 请求结构
   - 签名流程

## 2. 签名实现
   - EIP-712 原理
   - 两种签名方法
   - TypeScript 代码
   - 常见错误

## 3. 订单操作
   ### 3.1 下单 (order)
   - 参数详解
   - 永续开多/开空
   - 永续平仓
   - 现货买卖
   - 条件单 (TP/SL)

   ### 3.2 撤单 (cancel / cancelByCloid)
   ### 3.3 修改订单 (modify / batchModify)

## 4. 账户操作
   ### 4.1 更新杠杆 (updateLeverage)
   ### 4.2 更新逐仓保证金 (updateIsolatedMargin)

## 5. 资金操作
   ### 5.1 USDC 转账 (usdSend)
   ### 5.2 提现到 L1 (withdraw3)
   ### 5.3 现货转账 (spotSend)
   ### 5.4 账户互转 (usdClassTransfer)
   ### 5.5 子账户转账 (subAccountTransfer)

## 6. Vault 操作
   ### 6.1 存入 (vaultDeposit)
   ### 6.2 取出 (vaultWithdraw)

## 7. BuildCode 集成（重点）
   ### 7.1 授权 Builder 费率
   ### 7.2 订单附加 builder 参数

## 8. API 钱包授权 (approveAgent)

## 9. 响应处理

## 10. 错误处理

## 附录: 常见交易场景代码
```

---

## TypeScript 类型覆盖检查

现有 `exchange.ts` 已定义 **18 个动作类型**：

| 类别  | 类型                       | 状态                 |
| ----- | -------------------------- | -------------------- |
| 订单  | OrderAction                | ✓                    |
| 订单  | CancelAction               | ✓                    |
| 订单  | CancelByCloidAction        | ✓                    |
| 订单  | ModifyAction               | ✓                    |
| 订单  | BatchModifyAction          | ✓                    |
| 账户  | UpdateLeverageAction       | ✓                    |
| 账户  | UpdateIsolatedMarginAction | ✓                    |
| 资金  | UsdSendAction              | ✓                    |
| 资金  | Withdraw2Action            | ✓ (需改为 withdraw3) |
| 资金  | SpotSendAction             | ✓                    |
| 资金  | UsdClassTransferAction     | ✓                    |
| 资金  | SubAccountTransferAction   | ✓                    |
| Vault | VaultDepositAction         | ✓                    |
| Vault | VaultWithdrawAction        | ✓                    |
| 授权  | ApproveBuilderFeeAction    | ✓                    |
| 授权  | ApproveAgentAction         | ✓                    |
| 推荐  | SetReferrerAction          | ✓                    |
| 推荐  | CreateReferralCodeAction   | ✓                    |

**待补充**：

- `Withdraw2Action` → `Withdraw3Action` (API 已更新)
- 可选：`scheduleCancel`、`twapOrder` 等高级功能

---

## HTTP 文件结构预览

```http
### HyperLiquid Exchange API (写操作)
### ============================================================================
### 注意: 以下请求需要 EIP-712 签名，无法直接执行
### 仅作为请求格式参考，signature 字段需要通过钱包签名生成
### ============================================================================

###############################################################################
# 1. 订单操作
###############################################################################

### 1.1 下单 (order)
#
# 请求参数:
#   action.type: "order"         - 固定值
#   action.orders[]: array       - 订单数组
#     .a: number                 - 资产索引 (永续=index, 现货=10000+index)
#     .b: boolean                - 方向: true=买入/开多, false=卖出/开空
#     .p: string                 - 限价 (移除尾随零)
#     .s: string                 - 数量
#     .r: boolean                - 是否仅减仓
#     .t: object                 - 订单类型
#     .c: string                 - 客户端订单ID (可选)
#   action.grouping: string      - "na" | "normalTpsl" | "positionTpsl"
#   action.builder: object       - Builder 费用 (可选)
#   nonce: number                - 时间戳 (毫秒)
#   signature: object            - EIP-712 签名 {r, s, v}
#
# 响应结构:
#   status: "ok" | "err"
#   response.type: "order"
#   response.data.statuses[]:
#     .status: "filled" | "resting" | "error"
#     .filled: { totalSz, avgPx, oid }     - 成交信息
#     .resting: { oid }                    - 挂单信息
#     .error: string                       - 错误信息
#
POST {{baseUrl}}/exchange
Content-Type: application/json

{
  "action": {
    "type": "order",
    "orders": [{
      "a": 0,
      "b": true,
      "p": "95000",
      "s": "0.001",
      "r": false,
      "t": { "limit": { "tif": "Gtc" } }
    }],
    "grouping": "na"
  },
  "nonce": {{$timestamp}},
  "signature": { "r": "0x...", "s": "0x...", "v": 28 }
}
```

---

## 执行步骤

1. **创建 hyperliquid-exchange.http** - HTTP 参考文件（格式同 query.http）
2. **创建 exchange-api-guide.md** - Markdown 开发指南
3. **补充 exchange.ts** - 更新 withdraw3，添加缺失类型
4. **更新 notes/README.md** - 整理文档索引，添加 Exchange API 文档链接

---

## 验证方式

1. HTTP 文件覆盖全部 18 个写操作
2. 参数说明与官方文档一致
3. TypeScript 类型与 HTTP 文件参数匹配
