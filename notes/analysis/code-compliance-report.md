# 代码合规性扫描报告

**扫描时间**: 2026-01-23 12:08:21

## 📊 总体状态

| 检查项              | 状态    | 说明         |
| ------------------- | ------- | ------------ | --------------------- |
| TypeScript 类型检查 | ✅ 通过 | 无类型错误   |
| ESLint 检查         | ✅ 通过 | 无警告或错误 |
| Prettier 格式检查   | ✅ 通过 | 代码格式规范 |
| i18n 覆盖率         | ✅ 完成 | EN: 167 个   | ZH: 167/167 个 (100%) |

---

## 🔧 快速修复命令

```bash
# 修复 ESLint 问题
yarn lint:fix

# 修复 Prettier 格式
yarn format

# 扫描并更新 i18n
yarn i18n:scan
```

---

## ✅ 技术栈合规

| 技术                    | 状态 | 版本                                |
| ----------------------- | ---- | ----------------------------------- |
| Next.js 15 (App Router) | ✅   | 15.x                                |
| React 19                | ✅   | 19.x                                |
| shadcn/ui               | ✅   | 已配置                              |
| Stitches                | ✅   | @stitches/react@1.2.8               |
| Tailwind CSS            | ✅   | 已配置                              |
| Zustand                 | ✅   | 5.0.10                              |
| TanStack Query          | ✅   | 5.90.19                             |
| Wagmi + Viem            | ✅   | wagmi@3.3.4, viem@2.44.4            |
| TradingView 图表        | ✅   | 已集成                              |
| Lenis + Framer Motion   | ✅   | lenis@1.1.18, framer-motion@11.15.0 |
| WebSocket               | ✅   | reconnecting-websocket              |
| i18next + scanner       | ✅   | i18next@25.8.0, i18next-scanner     |
| ESLint + Prettier       | ✅   | 已配置                              |
| Husky + Commitlint      | ✅   | 已配置                              |

---

## 📝 代码工程化

| 项目                          | 状态 |
| ----------------------------- | ---- |
| ESLint 配置                   | ✅   |
| Prettier 配置                 | ✅   |
| Husky pre-commit              | ✅   |
| Husky post-commit (CHANGELOG) | ✅   |
| Commitlint                    | ✅   |
| lint-staged                   | ✅   |

---

_报告由 `scripts/check-compliance.js` 自动生成_
