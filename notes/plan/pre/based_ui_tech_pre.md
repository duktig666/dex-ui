# based - hyperLiquid 分析复刻
## plan1 - 复刻首页
https://based.one/  用浏览器，打开这个网址，复刻所有页面元素形成一个一模一样的网页；需要做一个前端的工程，技术栈全部用当前网站的技术栈；给出实现计划，形成md文档，放在dex-api下

## plan2 - Perps和Spot的分析和复刻 - 结合调用HyperLiquid

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
1. 