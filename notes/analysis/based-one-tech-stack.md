# Based.one 前端技术栈分析报告

> 分析时间: 2026-01-15
> 目标网站: https://app.based.one/

## 1. 核心框架

| 技术 | 版本/说明 |
|------|----------|
| **Next.js** | React SSR/SSG 框架，页面使用 App Router |
| **React** | 核心 UI 库，使用 Suspense、Fragment 等现代特性 |

**识别依据:**
- 全局变量 `__next_f`、`__next_s`
- 动态 chunk 加载模式 `.js?dpl=`
- React Server Components 流式渲染

## 2. 样式方案

| 技术 | 说明 |
|------|------|
| **Tailwind CSS** | Utility-first CSS 框架 |
| **CSS Variables** | 自定义主题变量系统 |

**Tailwind 特征类名:**
```
font-inter, text-trading-textPrimary, bg-background, antialiased
```

**主题 CSS 变量示例:**
```css
--brand-primary
--bg-secondary
--text-primary
--bg-background
```

## 3. 字体系统

| 字体 | 用途 |
|------|------|
| **Inter** | 主要 UI 字体 |
| **Source Code Pro** | 代码/数字展示字体 |

**加载优化:**
- Google Fonts CDN 加载
- `font-display: swap` 防止 FOIT
- `requestIdleCallback` 延迟加载非关键字体

## 4. 图表库

| 技术 | 说明 |
|------|------|
| **TradingView Charting Library** | 专业交易图表组件 |

**预加载资源:**
```
charting_library/bundles/runtime.js
charting_library/bundles/library.js
```

## 5. 多租户/品牌配置系统

网站使用动态配置注入，支持多品牌定制:

```javascript
window.__TENANT_BRANDING__   // 品牌配置
window.__TENANT_CSS_VARS__   // 主题变量
window.__TENANT_PLUGINS__    // 功能插件开关
```

**插件系统功能:**
- HIP3
- Affiliate (联盟营销)
- Airdrop (空投)
- 其他可配置功能模块

## 6. 国际化 (i18n)

- 使用 i18n Provider 组件
- 支持多语言切换
- 动态语言包加载

## 7. 技术架构总结

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js (App Router)                  │
├─────────────────────────────────────────────────────────┤
│  React Components + Server Components + Suspense        │
├─────────────────────────────────────────────────────────┤
│  Tailwind CSS + CSS Variables (主题系统)                │
├─────────────────────────────────────────────────────────┤
│  TradingView Charts │ i18n │ 多租户配置系统              │
└─────────────────────────────────────────────────────────┘
```

## 8. 复刻建议

### 8.1 推荐技术选型

| 层级 | 推荐方案 | 理由 |
|------|----------|------|
| 框架 | Next.js 14+ (App Router) | 与原站一致，SSR/SSG 支持好 |
| UI | React 18+ | 支持 Server Components |
| 样式 | Tailwind CSS 3.x | 快速开发，与原站风格一致 |
| 图表 | TradingView Lightweight Charts 或完整 Charting Library | 专业交易图表 |
| 状态管理 | Zustand / Jotai | 轻量级，适合交易应用 |
| 国际化 | next-intl / react-i18next | Next.js 友好 |

### 8.2 项目结构建议

```
src/
├── app/                    # Next.js App Router 页面
├── components/             # React 组件
│   ├── ui/                 # 基础 UI 组件
│   ├── trading/            # 交易相关组件
│   └── charts/             # 图表组件
├── lib/                    # 工具函数
├── hooks/                  # 自定义 Hooks
├── stores/                 # 状态管理
├── styles/                 # 全局样式 + Tailwind 配置
├── i18n/                   # 国际化配置
└── config/                 # 主题/品牌配置
```

### 8.3 关键功能模块

1. **交易图表** - K线图、深度图、成交历史
2. **订单簿** - 实时买卖盘展示
3. **交易面板** - 下单、仓位管理
4. **钱包连接** - Web3 钱包集成
5. **主题系统** - 深色/浅色主题切换
6. **响应式布局** - 移动端适配

### 8.4 需要注意的点

- TradingView Charting Library 需要商业授权
- 可考虑使用开源替代方案 (Lightweight Charts)
- 多租户系统如非必要可简化
- 交易数据需要 WebSocket 实时推送
