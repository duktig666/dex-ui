# HyperLiquid Trading API
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
需求： 以一种友好直观的方式去梳理 交易（包括查询）的API 和 WS相关的调用，并形成文档。可考虑swagger，并推荐一些其他更好用的形式做选择。
最终目标：借助HyperLiquid的API，定义一套DEX（perpetuals和spot）交易的API（rust语言）和api文档。

---

https://based.one/ 是HyperLiquid的第三方平台，通过buildCode方式交易获得收益。
需求：
1. 分析其使用总结的哪些API完成整个平台功能 
2. 分析其前端使用的架构和技术栈 
3. 如何1:1复刻based的前端和UI形成我们的DEX前端交易平台。