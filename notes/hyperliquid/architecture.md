# HyperLiquid DEX 架构设计文档

## 1. 系统概述

### 1.1 架构目标

- **高性能**：实时数据更新，低延迟交易
- **可维护**：清晰的分层架构，模块化设计
- **可扩展**：易于添加新功能和新交易对
- **安全性**：所有交易操作需用户签名确认

### 1.2 技术栈

| 层级     | 技术选型                | 说明             |
| -------- | ----------------------- | ---------------- |
| 框架     | Next.js 15 (App Router) | React 服务端渲染 |
| UI 库    | React 19                | 最新 React 特性  |
| 状态管理 | Zustand                 | 轻量级全局状态   |
| 数据获取 | React Query (TanStack)  | 服务端状态缓存   |
| 钱包     | wagmi v2 + viem         | 以太坊钱包连接   |
| 钱包 UI  | @reown/appkit           | 钱包选择器       |
| 图表     | TradingView             | 专业交易图表     |
| 样式     | Tailwind CSS            | 原子化 CSS       |
| 组件     | Radix UI                | 无障碍基础组件   |

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              dex-ui 前端                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                          页面层 (Pages)                          │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │  /trade  │ │/portfolio│ │  /vault  │ │  /spot   │           │    │
│  │  │ 永续交易 │ │ 投资组合 │ │  Vault   │ │ 现货交易 │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         组件层 (Components)                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │OrderBook │ │TradeForm │ │  Chart   │ │ Account  │           │    │
│  │  │ 订单簿   │ │ 下单表单 │ │  图表    │ │ 账户面板 │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │PriceBar  │ │ Position │ │ Orders   │ │  Vault   │           │    │
│  │  │ 价格条   │ │ 持仓列表 │ │ 订单列表 │ │ Vault卡片│           │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                       Hooks 层 (Custom Hooks)                    │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │    │
│  │  │useOrderBook│ │usePositions│ │ useOrders  │ │ useTrades  │   │    │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │    │
│  │  │useMarket   │ │ useVault   │ │ useAccount │                  │    │
│  │  └────────────┘ └────────────┘ └────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      状态层 (State Management)                   │    │
│  │  ┌────────────────────────────────────────────────────────┐    │    │
│  │  │                    Zustand Stores                       │    │    │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐│    │    │
│  │  │  │marketStore│ │ userStore │ │orderStore │ │settings ││    │    │
│  │  │  │ 市场数据  │ │ 用户状态  │ │ 订单状态  │ │ UI设置  ││    │    │
│  │  │  └───────────┘ └───────────┘ └───────────┘ └─────────┘│    │    │
│  │  └────────────────────────────────────────────────────────┘    │    │
│  │  ┌────────────────────────────────────────────────────────┐    │    │
│  │  │                   React Query Cache                     │    │    │
│  │  │  用户状态 | 元数据 | 订单历史 | Vault数据               │    │    │
│  │  └────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         服务层 (Services)                        │    │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐  │    │
│  │  │ REST Client│ │ WS Manager │ │     Signing Service        │  │    │
│  │  │  API 请求  │ │ WebSocket  │ │  EIP-712 签名 + Builder    │  │    │
│  │  └────────────┘ └────────────┘ └────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        钱包层 (Wallet)                           │    │
│  │  ┌────────────────────────────────────────────────────────┐    │    │
│  │  │            wagmi + viem + @reown/appkit                 │    │    │
│  │  │  连接管理 | 签名请求 | 网络切换 | 账户变更监听          │    │    │
│  │  └────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTPS / WSS
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          HyperLiquid API                                 │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐       │
│  │      REST API               │ │       WebSocket             │       │
│  │  POST /info   (查询)        │ │  wss://api.hyperliquid.xyz  │       │
│  │  POST /exchange (交易)      │ │  订阅：l2Book, trades,      │       │
│  │                             │ │  candle, orderUpdates...    │       │
│  └─────────────────────────────┘ └─────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 目录结构

### 3.1 现有结构

```
dex-ui/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 根布局
│   ├── page.tsx                   # 首页
│   └── trade/
│       ├── layout.tsx             # 交易页布局
│       └── page.tsx               # 交易页
├── components/
│   ├── trading/                   # 交易相关组件
│   │   ├── TradeForm.tsx          # 下单表单
│   │   ├── OrderBook.tsx          # 订单簿
│   │   ├── TradingViewChart.tsx   # K线图表
│   │   ├── AccountPanel.tsx       # 账户面板
│   │   ├── AccountSidebar.tsx     # 账户侧边栏
│   │   ├── PriceBar.tsx           # 价格条
│   │   ├── TradeHeader.tsx        # 交易头部
│   │   └── StatusBar.tsx          # 状态栏
│   ├── layout/                    # 布局组件
│   ├── sections/                  # 首页板块
│   ├── ui/                        # 基础 UI 组件
│   └── providers/                 # Context Providers
│       ├── Web3Provider.tsx       # 钱包 Provider
│       └── LenisProvider.tsx      # 滚动 Provider
├── lib/
│   ├── tradingview/               # TradingView 配置
│   │   ├── datafeed.ts            # 数据源（待改造）
│   │   ├── config.ts              # 图表配置
│   │   └── mockData.ts            # Mock 数据
│   ├── wagmi/
│   │   └── config.ts              # wagmi 配置
│   └── utils.ts                   # 工具函数
└── types/                         # TypeScript 类型
```

### 3.2 新增结构

```
lib/
├── hyperliquid/                   # HyperLiquid API 集成
│   ├── client.ts                  # REST API 客户端
│   ├── websocket.ts               # WebSocket 管理器
│   ├── signing.ts                 # EIP-712 签名
│   ├── types.ts                   # API 类型定义
│   ├── constants.ts               # 常量（端点、资产ID）
│   └── utils.ts                   # 价格/数量格式化
│
├── stores/                        # Zustand 状态管理
│   ├── marketStore.ts             # 市场数据状态
│   ├── userStore.ts               # 用户状态
│   ├── orderStore.ts              # 订单状态
│   └── settingsStore.ts           # UI 设置
│
└── hooks/                         # 自定义 Hooks
    ├── useOrderBook.ts            # 订单簿订阅
    ├── usePositions.ts            # 持仓订阅
    ├── useOrders.ts               # 订单订阅
    ├── useTrades.ts               # 成交订阅
    ├── useMarketData.ts           # 市场数据
    ├── useVault.ts                # Vault 数据
    └── useBuilder.ts              # Builder 授权

app/
├── portfolio/                     # 新增：投资组合页
│   └── page.tsx
├── vault/                         # 新增：Vault 页
│   ├── page.tsx                   # Vault 列表
│   └── [address]/
│       └── page.tsx               # Vault 详情
└── spot/                          # 新增：现货交易页
    └── [pair]/
        └── page.tsx               # 如 /spot/HYPE-USDC
```

---

## 4. 数据流设计

### 4.1 数据流概览

```
┌──────────────────────────────────────────────────────────────────┐
│                         数据流架构                                │
└──────────────────────────────────────────────────────────────────┘

                        ┌─────────────┐
                        │   用户操作   │
                        └──────┬──────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   查看行情    │    │    下单操作    │    │   订阅数据    │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  REST /info   │    │ REST /exchange│    │   WebSocket   │
│  (React Query)│    │  (+ 签名)     │    │  (Zustand)    │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌───────────────┐
                    │  状态更新     │
                    │ Zustand/Query │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   UI 渲染     │
                    │  React 组件   │
                    └───────────────┘
```

### 4.2 REST API 数据流

```typescript
// 使用 React Query 进行数据获取和缓存
const { data: userState } = useQuery({
  queryKey: ['clearinghouseState', address],
  queryFn: () => hyperliquidClient.getClearinghouseState(address),
  enabled: !!address,
  refetchInterval: 30000, // 30秒刷新
});
```

### 4.3 WebSocket 数据流

```typescript
// WebSocket 数据直接更新 Zustand Store
wsManager.subscribe('l2Book', { coin: 'BTC' }, (data) => {
  useMarketStore.getState().updateOrderBook('BTC', data);
});
```

### 4.4 交易数据流

```
用户下单 → TradeForm 组件 → useSubmitOrder Hook
    │
    ├─→ 构建订单参数
    │
    ├─→ 调用签名服务 (signing.ts)
    │      │
    │      ├─→ 构建 EIP-712 数据
    │      ├─→ 添加 Builder 参数
    │      └─→ 请求钱包签名
    │
    ├─→ 提交到 /exchange 端点
    │
    └─→ 更新本地状态
           │
           ├─→ 添加到 pending orders
           └─→ 等待 WebSocket 确认
```

---

## 5. 状态管理设计

### 5.1 Zustand Stores

#### marketStore.ts

```typescript
interface MarketState {
  // 当前选中的市场
  currentSymbol: string;
  marketType: 'perp' | 'spot';

  // 订单簿
  orderBooks: Record<string, OrderBook>;

  // 最近成交
  trades: Record<string, Trade[]>;

  // 元数据
  perpMeta: PerpMeta | null;
  spotMeta: SpotMeta | null;

  // Actions
  setCurrentSymbol: (symbol: string) => void;
  updateOrderBook: (symbol: string, data: OrderBook) => void;
  addTrade: (symbol: string, trade: Trade) => void;
}
```

#### userStore.ts

```typescript
interface UserState {
  // 连接状态
  address: string | null;
  isConnected: boolean;

  // Builder 授权
  builderApproved: boolean;

  // 账户状态
  clearinghouseState: ClearinghouseState | null;
  spotState: SpotClearinghouseState | null;

  // Actions
  setAddress: (address: string | null) => void;
  setBuilderApproved: (approved: boolean) => void;
  updateClearinghouseState: (state: ClearinghouseState) => void;
}
```

#### orderStore.ts

```typescript
interface OrderState {
  // 当前挂单
  openOrders: Order[];

  // 待确认订单
  pendingOrders: Order[];

  // 持仓
  positions: Position[];

  // Actions
  addPendingOrder: (order: Order) => void;
  confirmOrder: (oid: string) => void;
  removeOrder: (oid: string) => void;
  updatePositions: (positions: Position[]) => void;
}
```

### 5.2 React Query 配置

```typescript
// 用于不频繁变化的数据
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30秒
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});
```

---

## 6. 组件设计

### 6.1 组件职责

| 组件               | 职责             | 数据来源                         |
| ------------------ | ---------------- | -------------------------------- |
| `OrderBook`        | 显示买卖盘深度   | `useOrderBook` (WebSocket)       |
| `TradeForm`        | 下单表单和操作   | `useSubmitOrder`                 |
| `TradingViewChart` | K线图表          | TradingView + `candle` WebSocket |
| `AccountPanel`     | 持仓和订单列表   | `usePositions`, `useOrders`      |
| `PriceBar`         | 当前价格和涨跌幅 | `marketStore`                    |
| `PositionTable`    | 持仓详情表格     | `orderStore.positions`           |
| `OrderTable`       | 挂单列表         | `orderStore.openOrders`          |

### 6.2 组件改造计划

#### OrderBook 改造

```typescript
// 改造前：使用 mock 数据
const [orderBook, setOrderBook] = useState(generateMockOrderBook());

// 改造后：使用 WebSocket 实时数据
const { bids, asks, spread } = useOrderBook(symbol);
```

#### TradeForm 改造

```typescript
// 改造前：静态展示
<button>Connect Wallet</button>

// 改造后：接入交易逻辑
const { submitOrder, isLoading } = useSubmitOrder();
const { address, isConnected } = useAccount();

const handleSubmit = async () => {
  await submitOrder({
    symbol,
    side,
    orderType,
    price,
    amount,
    leverage,
    // ...
  });
};
```

---

## 7. WebSocket 管理

### 7.1 WebSocket 管理器设计

```typescript
class HyperliquidWebSocket {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void;
  disconnect(): void;
  subscribe(type: string, params: object, callback: Function): () => void;
  unsubscribe(type: string, params: object): void;
  private handleMessage(event: MessageEvent): void;
  private handleReconnect(): void;
}
```

### 7.2 订阅管理

```typescript
// 组件挂载时订阅
useEffect(() => {
  const unsubscribe = wsManager.subscribe('l2Book', { coin: symbol }, (data) => {
    updateOrderBook(data);
  });

  return () => unsubscribe();
}, [symbol]);
```

---

## 8. 安全设计

### 8.1 签名安全

- 所有交易操作需用户在钱包中确认签名
- 使用 EIP-712 类型化数据签名，用户可清晰看到签名内容
- 不在前端存储私钥

### 8.2 Builder 授权

- 首次交易前提示用户授权 Builder 费用
- 用户可随时在 HyperLiquid 官网撤销授权
- 费率透明显示

### 8.3 数据验证

- 前端验证用户输入（价格、数量范围）
- 显示清晰的错误信息
- 确认弹窗显示交易详情

---

## 9. 性能优化

### 9.1 数据更新优化

- 订单簿使用增量更新而非全量更新
- 使用 `useMemo` 和 `useCallback` 避免不必要的重渲染
- WebSocket 消息批量处理

### 9.2 渲染优化

- 虚拟列表渲染大量订单/成交记录
- 图表组件懒加载
- 代码分割减少初始加载大小

### 9.3 网络优化

- WebSocket 断线自动重连
- REST API 请求去重和缓存
- 错误重试机制
