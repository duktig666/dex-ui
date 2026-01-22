
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

