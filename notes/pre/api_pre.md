
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

---

