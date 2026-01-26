# Hermes DEX

基于 HyperLiquid API 的去中心化交易所前端，采用现代前端技术栈构建。

## 技术栈

| 分类     | 技术                                   |
| -------- | -------------------------------------- |
| 框架     | Next.js 15 (App Router) + React 19     |
| 语言     | TypeScript                             |
| 样式     | Tailwind CSS + Stitches + shadcn/ui    |
| 状态管理 | Zustand                                |
| 数据请求 | TanStack Query                         |
| Web3     | Wagmi + Viem + Reown AppKit            |
| 图表     | TradingView Charting Library           |
| 动画     | Framer Motion + Lenis                  |
| 国际化   | i18next + i18next-scanner              |
| 代码质量 | ESLint + Prettier + Husky + Commitlint |

## 环境要求

- Node.js >= 18
- Yarn >= 1.22

## 快速开始

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# Testnet 环境
yarn dev:testnet

# Mainnet 环境
yarn dev:mainnet

# 构建生产版本
yarn build
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 项目结构

```
dex-ui/
├── app/                    # Next.js App Router 页面
│   └── trade/              # 交易页面
├── components/
│   ├── layout/             # 布局组件 (Navigation, Footer)
│   ├── sections/           # 首页区块组件
│   ├── trading/            # 交易相关组件
│   ├── providers/          # Context Providers
│   └── ui/                 # 基础 UI 组件 (shadcn/ui)
├── hooks/                  # 自定义 Hooks
├── lib/
│   ├── hyperliquid/        # HyperLiquid API 客户端
│   ├── i18n/               # 国际化配置
│   ├── tradingview/        # TradingView 配置
│   └── wagmi/              # Wagmi 配置
├── stores/                 # Zustand 状态管理
├── public/
│   └── locales/            # 多语言文件
├── scripts/                # 自动化脚本
└── notes/                  # 项目文档
```

## 开发命令

```bash
# 代码检查
yarn lint
yarn lint:fix

# 代码格式化
yarn format
yarn format:check

# 类型检查
npx tsc --noEmit

# i18n 扫描
yarn i18n:scan

# 代码合规检查
yarn compliance
```

## 自动化工作流

| 触发时机        | 任务                | 说明                         |
| --------------- | ------------------- | ---------------------------- |
| `git commit` 前 | 代码格式校验 + Lint | Husky + lint-staged 自动执行 |
| `git commit` 时 | 提交信息规范校验    | Conventional Commits 格式    |
| `git commit` 后 | CHANGELOG 自动生成  | 自动追加变更记录             |
| 手动执行        | i18n 文案提取       | `yarn i18n:scan` 扫描并翻译  |
| 手动执行        | 代码合规检查        | `yarn compliance` 生成报告   |

## Git 提交规范

```bash
# 格式: <type>(<scope>): <description>

feat: 新增功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
perf: 性能优化
test: 测试相关
chore: 构建/工具变更
```

## 设计规范

- **主题**: 深色模式
- **主色调**: 黑色背景 (#000000)
- **强调色**: 绿色 (#00ff88)
- **做多**: 绿色 (#22c55e)
- **做空**: 红色 (#ef4444)

## 相关文档

- [CLAUDE.md](./CLAUDE.md) - AI 开发规范
- [前端规范](./notes/pre/前端规范.md) - 技术规范详情
- [HyperLiquid API](./notes/hyperliquid/) - API 文档

## 许可证

MIT
