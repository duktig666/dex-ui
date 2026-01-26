# 技术栈

dex-ui前端技术栈：

1. 核心框架使用React
2. App路由 Next.js Router
3. 状态管理 Zustand
4. 样式+UI框架 shadcn/ui + Tailwind + Stitches 组合
5. k线和图表 tradeview
6. 钱包 Reown Appkit钱包链接 + wagmi
7. 多语言: i18n
8. 语法规范 eslint+ prettier

将上述技术栈 简介的整理到 CLAUDE.md

---

遵循cursor的规范 将CLAUDE.md的规范整理和输出到 .cursorrules

# HyperLiquid Query API 梳理

```
### 查看商户信息
GET {{BASE_URL}}/tenant/info
Content-Type: application/json
Cookie: SESSION={{SESSION}}

### 查看商户配置的 链、RWA协议、合规规则 列表
POST {{BASE_URL}}/tenant/config/chains
Content-Type: application/json
Cookie: SESSION={{SESSION}}

### 查看国家列表
POST {{BASE_URL}}/tenant/config/areas/en_US
Content-Type: application/json
Cookie: SESSION={{SESSION}}
```

上述格式是.http文件写法的示例，可以再ide中发送http请求。
参看dex-ui/notes/hyperliquid/based-hyperliquid-api-tech-claude.md文件，将查询方法 以http的方式写出调用示例写入到文件 dex-ui/notes/hyperliquid/http/hyperliquid-query.http
我想要用http调用的方式测试hyperliquid-api以及查看其api结构和响应

---

现在Hyperliquid的查询API已经梳理到 dex-ui/notes/hyperliquid/based-hyperliquid-api-tech-claude.md 和 dex-ui/notes/hyperliquid/http/hyperliquid-query.http，但是其响应的结构比较复杂。
最终的需求是复刻based对接Hyperliquid使用buildcode实现dex平台，我需要理解每个接口参数字段和返回值字段的含义，并且可以对应到页面上的展示，并有文档可以输出对应。
怎样的形式比较好解决这些需求和问题？

参看 [api-plan.md](../plan/api-plan.md)

---

根据生成的文件清单、http文件、page字段映射文件，以及notes下对前端开发或使用api有帮助的文件 写一个总览，推荐阅读和参看的指南 放到notes下

# HyperLiquid Exchange API 梳理

当前已完成HyperLiquid查询API的梳理。
dex-ui/notes/hyperliquid/http/hyperliquid-query.http 以http的方式梳理了API，并解释了参数和字段的含义。
dex-ui/notes/hyperliquid/api-page-mapping.md 做了字段和页面元素的映射
现在想要梳理HyperLiquid关于合约和现货 下单、撤单、平仓、开仓等等写接口的功能，需要有文档可以参看方便开发，
但是下单需要钱包签名，直接http的请求并不合适，怎么方式比较推荐和整理
最终的需求是复刻based对接Hyperliquid使用buildcode实现dex平台，所以需要全面梳理写接口

先写计划再整理

---

md文档需要梳理，可以再在hyperliquid-exchange.http整理写的接口，签名参数可以保留
，并且需要解释参数和返回值，格式参看hyperliquid-query.http。再确认下dex-ui/src/
types/hyperliquid对写接口的类型定义是否完全。
梳理完成后整理 dex-ui/notes/README.md

HyperLiquid API http调用参看notes/hyperliquid/http
exchange-api-guide.md 交易api的使用
prd 参看prd.md
