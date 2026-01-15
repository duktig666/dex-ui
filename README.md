# Hermes DEX Landing Page

基于 based.one 设计风格复刻的 Hermes DEX 官网，使用现代前端技术栈构建。

## 技术栈

- **Next.js 15** - React 框架，App Router
- **React 19** - UI 组件库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS 框架
- **Framer Motion** - 动画库
- **Lenis** - 平滑滚动

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 项目结构

```
dex-ui/
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
│   ├── layout/          # 布局组件 (Nav, Footer)
│   ├── sections/        # 页面区块组件
│   ├── ui/              # 基础 UI 组件
│   └── providers/       # Context Providers
├── lib/                 # 工具函数
├── public/              # 静态资源
└── notes/               # 项目文档
```

## 页面区块

1. **Hero** - 动画 HERMES Logo
2. **Stats** - 统计数据展示
3. **Partners** - 合作伙伴 Logo
4. **TradeCrypto** - 交易功能介绍
5. **Predictions** - 预测市场
6. **BorderlessCard** - 无边界支付卡
7. **Features** - 功能特性
8. **Community** - 社区链接

## 设计规范

- **主题**: 深色模式
- **主色调**: 黑色背景 (#000000)
- **强调色**: 绿色 (#00ff88)
- **目标分辨率**: 1024px - 1920px+

## 开发

```bash
# 代码检查
npm run lint

# 类型检查
npx tsc --noEmit
```

## 许可证

MIT

