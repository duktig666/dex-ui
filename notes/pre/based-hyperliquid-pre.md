# based - hyperLiquid DEX

## Trade page

### HyperLiquid 交易API及相关资料
https://hyperliquid.gitbook.io/hyperliquid-docs/trading/builder-codes 这篇文章介绍了第三方如何通过BuildCode发送交易给HyperLiquid获取部分费用（收益）。
https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api 这个下面有很多和交易API相关的文档。
https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals 这篇文章介绍 perpetuals 相关查询的api
https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot 这篇文章介绍 spot 相关的api
https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint 这篇文章介绍了 HyperLiquid 相关交易的API
下面的文章和ws相关：
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/post-requests
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/timeouts-and-heartbeats
  下面的文章对概念和名词做了一些解释：
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/notation
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/tick-and-lot-size
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets
  以下文章是一些补充：
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/error-responses
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/signing
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/activation-gas-fee
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/optimizing-latency
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/bridge2
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets
- https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/hip-3-deployer-actions

上述是和HyperLiquid交易API相关的文档和资料。

### based
Based是HyperLiquid的第三方交易平台，使用HyperLiquid的BuildCode模式赚取收益。

### 需求
https://app.based.one/BTC  https://app.based.one/HYPE/USDC 再结合这两个页面
1. 分析这两个页面都用到HyperLiquid哪些api，如何使用这些api
2. 开发一个新的前端项目，如何使用HyperLiquid的这些api，实现BuildCode的功能，完成一个新的基于HyperLiquid的DEX
3. 主要实现 ①Perps Spot 交易页相关的功能 ②My Portfolio下个人余额相关的功能 ③Vault相关功能 ④钱包相关的功能。 其他功能低优先级，可以先暂时不考虑

### 结果
先生成plan输出到 dex-api/notes/plan 下，确认plan后再执行

---

#file:dex-fe-stack.md 打开浏览器分析网站 https://app.based.one/ 进行1:1复刻开发，技术栈可以考虑使用 #file:dex-fe-stack.md 并结合当前项目的技术栈。 着重注意k线图的复刻。 另外在当前项目首页的头部的trade的Perp增加跳转链接。 工作目录是 dex-ui

----------------

https://app.based.one/BTC  https://app.based.one/HYPE/USDC 再结合这两个页面
优先分析 ①Perps Spot 交易页相关的功能 ②My Portfolio下个人余额相关的功能 ③Vault相关功能 ④钱包相关的功能。 其他功能低优先级。
[dex-ui](../..) 是目前的前端实现，写出了https://app.based.one的静态页，还没有进行接入后端api的开发
1. 使用 analyst 分析主要实现哪些功能进行需求分析，写出一份prd文档输出到 notes下
2. 使用 architect + research 分析需要用到哪些HyperLiquid的交易API，才可以实现完善基于HyperLiquid的BuildCode的dex，写出一份架构设计和写出一份技术方案，输出到 notes下
3. 使用 architect + research 分析如何接入 HyperLiquid 的测试网，输出一份文档到 notes下
4. plan输出到 notes/plan 下

## HyperLiquid Testnet

问题：
1. HyperLiquid 测试网想要领取水龙头测试币，地址必须要在主网有存款才可以，需要存什么代币，存多少，有官方文档说明吗？
2. 测试网 BuildAddress 必须要在 HyperLiquid 存储一定金额的代币才可以吗？具体操作流程
结论完善到 dex-api/notes/hyperliquid-testnet-guide.md

---

HyperLiquid上领取了测试币usdc 1.怎么转移给其他地址 2.可以再metamask看到资产余额吗，怎么添加网络

https://testnet.based.one/HYPE/USDC （现货交易页面）
3. https://testnet.based.one/portfolio （个人投资组合及资产页面）

## 分析HyperLiquid API
打开浏览器分析网站 https://testnet.based.one/ （合约交易页面），可以打开现在已有的浏览器（非无痕浏览器，非无痕浏览器不能获得我现在的钱包连接状态）
需求：结合HyperLiquid的Docs和API 以及 prd.md，分析交易相关的功能（包括查询），详细写出实现方案 输出到 dex-ui/notes/hyperliquid/based-hyperliquid-api-tech.md。
方案重点关注： 具体说明功能和HyperLiquid API的对应关系，以及API的使用方式（给出示例）
我已经连接上钱包0xEfc3a654A44FACd6dA111f3114CDd65F16d9a681，网站是测试网，必要时可以进行下单撤单等交易进行模拟。
只写方案不开发代码
HyperLiquid 的API参考资料可以参看 CLAUDE.md

---

打开浏览器分析网站 
1. https://testnet.based.one/ （合约交易页面）
2. https://testnet.based.one/HYPE/USDC （现货交易页面）
3. https://testnet.based.one/portfolio （个人投资组合及资产页面）

需求：结合HyperLiquid的Docs和API 以及 prd.md，分析交易相关的功能（包括查询），详细写出实现方案 输出到 dex-ui/notes/hyperliquid/based-hyperliquid-api-tech-claude.md。
方案重点关注： 具体说明功能和HyperLiquid API的对应关系，以及API的使用方式（给出示例）
只写方案不开发代码
HyperLiquid 的API参考资料可以参看 CLAUDE.md

## 合约页面 API实现
dex-ui项目下已实现对网站 https://testnet.based.one/ 合约交易静态页面进行了1:1复刻。
现在打开浏览器 继续分析 https://testnet.based.one/ 基于HyperLiquid的API 结合文档 notes/hyperliquid/based-hyperliquid-api-tech-gpt.md 实现合约交易页面的功能。重点功能包括：K线数据的动态查询、合约币对相关数据的查询、订单簿、交易历史、个人用户持仓和订单信息、下单撤单 等功能的实现。页面上所有功能都要实现。 
BuildCode的地址是 0xEfc3a654A44FACd6dA111f3114CDd65F16d9a681
HyperLiquid的API资料可以参看 CLAUDE.md