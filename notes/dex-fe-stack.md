# DEX 前端技术栈总结与推荐方案

> 基于 Based、dYdX、GMX、Lighter 的前端技术栈调研（2026-01-19）。本文以“推荐方案”为主，辅以简洁对比表。

---

## 一、对比表（简版）

| 维度 | Based | dYdX | GMX | Lighter |
| --- | --- | --- | --- | --- |
| 核心框架 | Next.js App Router + React | React 18 + Vite | React 18 + Vite | React + Vite |
| 路由 | Next.js Router | React Router v6 | React Router v5（需升级） | React Router |
| 状态管理 | 未明确 | Redux Toolkit + React Query + Socket | 多层 Context + SWR + React Query + Apollo | 未明确 |
| 样式 | Tailwind CSS | Tailwind + twin.macro + styled-components | Tailwind + SCSS（混用） | 自定义 CSS |
| UI 组件 | 未明确 | Radix UI + React Aria | Headless UI | 未明确 |
| Web3 | WalletConnect + Privy + RelaySDK | Wagmi + viem + Cosmos/Solana + Privy | Wagmi + viem + ethers（混用） | WalletConnect + Dynamic + RelaySDK |
| 图表 | TradingView | Visx | TradingView + Recharts | TradingView + Rive |
| 监控 | PostHog + Statsig | Datadog + Statsig | 未明确 | Sentry + Datadog + Mixpanel + Statsig |
| 国际化 | 未明确 | 内部语言包 | Lingui | i18next + Locize |
| 工程化 | 未明确 | ESLint + Prettier + Husky + Vitest + E2E | ESLint + Prettier + Husky + Vitest | 未明确 |


> GMX、DYDX 基于开源代码分析，Lighter、Based 基于页面分析。

---

## 二、各DEX技术栈
### Based 前端技术栈（页面分析）

#### 核心框架
- Next.js（App Router）+ React
- Webpack 由 Next.js 管理，Vercel 部署

#### 样式与字体
- Tailwind CSS
- Google Fonts：Source Code Pro

#### 图表
- TradingView Charting Library

#### Web3 与区块链
- WalletConnect、Privy
- RelaySDK、fun.xyz SDK
- Hyperliquid API

#### 数据分析与监控
- PostHog（用户分析、录屏、调研等）
- Statsig（功能开关与实验）

#### 其他
- Intercom 客服
- PWA 支持
- 地理位置检测与地理封锁

---

### dYdX 前端技术栈（开源代码分析）

#### 运行与构建
- Node.js 22 + pnpm
- Vite + TypeScript（ESNext/strict）
- 多入口构建与浏览器端 Polyfill

#### 架构与路由
- React 18
- React Router v6（支持 Browser/Hash 模式）
- React.lazy + Suspense 分包

#### 状态与数据
- Redux Toolkit + redux-persist + Reselect
- TanStack React Query
- socket.io-client + axios

#### 样式与 UI
- styled-components
- twin.macro + Tailwind CSS
- Radix UI + React Aria / React Stately
- Visx

#### Web3
- dYdX v4 SDK
- EVM：wagmi + viem
- Cosmos：@cosmjs + Keplr + Graz
- Solana：@solana/web3.js
- Privy、Turnkey、Skip SDK

#### 监控与实验
- Datadog Logs
- Statsig

#### 测试与工程化
- Vitest、WebdriverIO + Mocha、BrowserStack
- ESLint（Airbnb）+ Prettier（含 Tailwind 插件）
- Husky + Commitlint
- Typia + ts-patch、Ladle

---

### GMX 前端技术栈（开源代码分析）

#### 核心框架
- React 18.2.0 + TypeScript 5.4.2
- Vite 5.4+
- React Router v5.3.4（需升级 v6）

#### 构建与工具链
- Vite 插件：React、SVGR、tsconfig-paths、Lingui、包分析
- ESLint + Prettier + Husky + lint-staged
- Vitest + Testing Library + happy-dom

#### 状态管理
- 17 层 Context 嵌套（性能与可维护性风险）
- SWR + React Query + Apollo 混用
- Immer、Reselect、use-context-selector

#### Web3
- Wagmi + viem + RainbowKit
- ethers.js 与 viem 混用（84 处引用，建议迁移）
- Stargate + LayerZero 跨链

#### UI 与样式
- Headless UI、framer-motion、react-select
- Tailwind + SCSS 混用

#### 图表
- TradingView Charting Library
- Recharts

#### 国际化
- Lingui

---

### Lighter 前端技术栈（页面分析）

#### 核心框架与构建
- React + React Router
- Vite（ESM + modulepreload）

#### 样式与字体
- 自定义 CSS
- Inter、DM Sans

#### 图表
- TradingView Charting Library
- Rive 动画

#### Web3
- WalletConnect / Web3Modal
- Dynamic SDK
- RelaySDK
- fun.xyz SDK

#### 监控与分析
- Sentry
- Datadog
- Mixpanel
- Statsig

#### 国际化
- i18next + Locize

#### 其他
- Zod
- Smart Banner（移动应用推广）
- PWA 支持

---

### 共性与差异要点

#### 共性
- React 是主流核心框架
- TradingView 为交易图表首选
- Web3 侧多采用 WalletConnect 生态
- 监控与实验普遍采用 Statsig 或等价体系

#### 差异
- dYdX 工程化与数据流最完善
- GMX 技术债较多（Context 过深、库混用）
- Lighter 监控与 i18n 最完整
- Based 采用 Next.js（App Router + SSR 友好）


## 三、各项目技术要点与问题总结

### 1. Based
- **优势**：Next.js App Router + Vercel 部署，性能优化思路成熟；TradingView 图表专业。
- **风险点**：状态管理与工程化配置不明确，后续维护成本不可控。

### 2. dYdX
- **优势**：架构最成熟；Redux Toolkit + React Query + Socket 的数据流清晰；多链支持（EVM + Cosmos + Solana）；工程化与测试最完备。
- **风险点**：体系复杂度高，上手成本较高，但可控。

### 3. GMX
- **优势**：Vite 构建、工程化工具齐全、TradingView 图表能力强。
- **明显问题**：
  - 17 层 Context 嵌套，性能与可维护性风险高。
  - ethers 与 viem 混用，技术栈割裂。
  - Tailwind 与 SCSS 并存，样式体系不统一。
  - Router v5 过时，应升级至 v6。
  - 数据获取方案多头并行（SWR + React Query + Apollo）。

### 4. Lighter
- **优势**：监控体系最完善（Sentry + Datadog + Mixpanel + Statsig），i18n 最完整（i18next + Locize），Vite 构建。
- **风险点**：样式体系偏“自定义 CSS”，对团队协作与扩展不友好；WalletConnect 初始化重复需要优化。

---

## 四、推荐前端技术栈（重点）

以下方案兼顾 **性能、可维护性、扩展性、工程化成熟度**，结合 DEX 特点（高频交易、链上交互、可观测性）：

### 1. 核心框架与构建
- **推荐**：React 18 + Vite
- **原因**：Vite 构建速度快、生态成熟；React 18 兼容性好。
- **可选**：若有强 SEO/多页面需求，考虑 Next.js App Router；否则默认 Vite。

### 2. 路由
- **推荐**：React Router v6
- **原因**：路由能力完善、社区标准；避免 v5 过时带来的迁移成本。

### 3. 状态管理与数据流
- **推荐**：Redux Toolkit + TanStack React Query + WebSocket
- **原因**：
  - Redux 负责稳定全局状态（用户、权限、设置、行情配置）。
  - React Query 专注服务端数据缓存与刷新。
  - WebSocket 支持订单簿/行情的实时推送。
- **避免**：多种数据请求库混用（SWR + React Query + Apollo）。

### 4. 样式与 UI
- **推荐**：Tailwind CSS + Radix UI
- **原因**：
  - Tailwind 统一设计语言，提高开发效率。
  - Radix UI 提供无障碍基础组件与交互原语。
- **避免**：Tailwind 与传统 SCSS 混用造成设计体系割裂。

### 5. Web3 集成
- **推荐**：Wagmi + viem + WalletConnect
- **原因**：
  - viem 是现代 TypeScript 优先的链上交互库。
  - Wagmi 生态成熟，连接体验好。
- **可选**：多链支持时补充 Cosmos/Solana 适配（参考 dYdX）。
- **避免**：ethers 与 viem 混用。

### 6. 图表与可视化
- **推荐**：TradingView Charting Library
- **原因**：交易体验行业标准，功能最完整。
- **补充**：普通图表可选 Visx 或 Recharts（但应避免多个图表库并存）。

### 7. 监控与实验体系
- **推荐**：
  - 错误与性能：Sentry
  - 日志与 RUM：Datadog
  - 功能开关与实验：Statsig
- **原因**：可观测性是交易类产品稳定性的核心保障。

### 8. 国际化（i18n）
- **推荐**：i18next + Locize
- **原因**：生态完善、翻译管理平台成熟，适合多语种快速迭代。

### 9. 工程化与测试
- **推荐**：ESLint + Prettier + Husky + Vitest + E2E（WebdriverIO 或 Playwright）
- **原因**：保证代码质量与关键交易链路的回归安全。

---

## 五、推荐方案落地优先级

**P0（必须）**
- React 18 + Vite
- React Router v6
- Redux Toolkit + React Query
- Tailwind CSS
- Wagmi + viem

**P1（高优先）**
- TradingView 图表
- Sentry + Datadog + Statsig
- ESLint + Prettier + Husky + Vitest

**P2（按需）**
- i18next + Locize
- E2E 测试体系
- 多链扩展（Cosmos/Solana 适配）

---

## 六、常见问题与避坑指南

1. **避免 Context 层级过深**：复杂业务需转向 Redux Toolkit 或 domain store。
2. **避免多数据源框架并存**：统一数据请求与缓存方案。
3. **避免链上库混用**：统一到 viem 体系。
4. **避免样式体系割裂**：统一 Tailwind 或 CSS-in-JS。
5. **避免缺乏监控**：交易系统必须具备可观测性。

---

## 七、结论

**最佳推荐路径**：以 dYdX 为主样板（数据流与工程化），吸收 Based 的性能优化思路、Lighter 的监控与 i18n 方案，规避 GMX 的技术债（多 Context/多数据源/多链上库混用）。

最终建议采用：

> **React 18 + Vite + React Router v6 + Redux Toolkit + React Query + Tailwind + Radix UI + Wagmi + viem + TradingView + Sentry/Datadog/Statsig + i18next/Locize + ESLint/Prettier/Vitest**

该组合兼顾开发效率、维护性、性能与交易稳定性，适合中长期演进的 DEX 前端架构。