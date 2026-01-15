# Hermes DEX 官网实现计划

> **品牌定制**: 所有 "Based" Logo 和品牌元素替换为 **Hermes**
> **目标平台**: Web 桌面端（暂不考虑移动端和平板端）

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 15.x | 核心框架，App Router |
| **React** | 19.x | UI 组件库 |
| **TypeScript** | 5.x | 类型安全 |
| **Tailwind CSS** | 3.x | 样式框架 |
| **Lenis** | 1.x | 平滑滚动效果 |
| **Framer Motion** | 11.x | 动画效果 |

## 项目结构

```
dex-ui/
├── app/
│   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页（整合所有区块）
│   └── globals.css          # 全局样式 + CSS 变量
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx   # 导航栏 + 下拉菜单
│   │   └── Footer.tsx       # 页脚
│   ├── sections/
│   │   ├── Hero.tsx         # Hero 区块（动画 HERMES Logo）
│   │   ├── Stats.tsx        # 统计数据（动画计数器）
│   │   ├── Partners.tsx     # 合作伙伴 Logo
│   │   ├── TradeCrypto.tsx  # Trade 区块
│   │   ├── Predictions.tsx  # 预测市场
│   │   ├── BorderlessCard.tsx # Cards 区块
│   │   ├── Features.tsx     # 功能展示
│   │   └── Community.tsx    # 社区区块
│   ├── ui/
│   │   ├── Button.tsx       # 按钮组件
│   │   └── HermesLogo.tsx   # Hermes 动画 Logo
│   └── providers/
│       └── LenisProvider.tsx # 平滑滚动 Provider
├── lib/
│   ├── lenis.ts             # Lenis 配置
│   └── utils.ts             # 工具函数 (cn, formatNumber)
├── public/
│   ├── fonts/               # 字体文件
│   └── images/              # 图片资源
├── notes/
│   └── plan/                # 计划文档
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 页面结构

```
┌─────────────────────────────────────────┐
│              Navigation                 │
├─────────────────────────────────────────┤
│                                         │
│               Hero Section              │
│         (THE FUTURE IS HERMES)          │
│                                         │
├─────────────────────────────────────────┤
│              Stats Section              │
│   Trading Volume | Users | Affiliate    │
├─────────────────────────────────────────┤
│            Partners Section             │
│     (Backed by: Ethena, Spartan...)     │
├─────────────────────────────────────────┤
│           TradeCrypto Section           │
│          Trade Crypto 24/7              │
├─────────────────────────────────────────┤
│          Predictions Section            │
│      Hermes Predictions Market          │
├─────────────────────────────────────────┤
│         BorderlessCard Section          │
│         Borderless Spending             │
├─────────────────────────────────────────┤
│           Features Section              │
│    HyENA | Trading | Wallet | Multi     │
├─────────────────────────────────────────┤
│           Community Section             │
│         Discord | Twitter               │
├─────────────────────────────────────────┤
│               Footer                    │
│   Products | Resources | Legal | Social │
└─────────────────────────────────────────┘
```

## 设计规范

### 颜色方案 (深色主题)

```css
:root {
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-card: #111111;
  --text-primary: #ffffff;
  --text-secondary: #888888;
  --accent-green: #00ff88;
  --accent-red: #ff4444;
  --border-color: #1a1a1a;
}
```

### 字体

- **Space Grotesk** - 主标题（替代 Gilroy）
- **Inter** - 正文
- **Source Code Pro** - 代码/数字

### 目标分辨率

- 最小支持宽度: 1024px
- 推荐设计宽度: 1440px
- 内容最大宽度: 1200px (居中显示)

## 启动项目

```bash
cd dex-ui
npm install
npm run dev
```

访问 http://localhost:3000 查看效果。

## 实现状态

- [x] 项目初始化 (Next.js 15 + React 19)
- [x] Tailwind CSS 配置
- [x] Lenis 平滑滚动集成
- [x] 导航栏组件
- [x] 页脚组件
- [x] Hero 区块
- [x] Stats 统计区块
- [x] Partners 合作伙伴区块
- [x] TradeCrypto 区块
- [x] Predictions 预测市场区块
- [x] BorderlessCard 卡片区块
- [x] Features 功能展示区块
- [x] Community 社区区块
- [x] 首页整合
- [ ] 视觉细节完善
- [ ] 滚动动画优化

