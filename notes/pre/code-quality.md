# 代码质量工具链设计方案

## 概述

本项目采用 **ESLint + Prettier + Husky + Commitlint + lint-staged** 的完整代码质量工具链，确保代码风格统一、提交规范化。

## 技术栈

| 工具          | 用途                           |
| ------------- | ------------------------------ |
| `ESLint`      | JavaScript/TypeScript 代码检查 |
| `Prettier`    | 代码格式化                     |
| `Husky`       | Git Hooks 管理                 |
| `lint-staged` | 仅检查暂存文件                 |
| `Commitlint`  | 提交信息规范校验               |

## 文件结构

```
项目根目录/
├── .husky/
│   ├── pre-commit       # 提交前检查
│   ├── commit-msg       # 提交信息校验
│   └── post-commit      # 提交后操作（CHANGELOG）
├── eslint.config.mjs    # ESLint 配置
├── .prettierrc          # Prettier 配置
├── .prettierignore      # Prettier 忽略
├── .lintstagedrc.js     # lint-staged 配置
└── commitlint.config.js # Commitlint 配置
```

## 工作流程

```
┌─────────────────────────────────────────────────────────────┐
│                     git add .                               │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  git commit -m "..."                        │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              .husky/pre-commit                              │
│                    ↓                                        │
│              lint-staged                                    │
│         ┌──────────┴──────────┐                             │
│         ▼                     ▼                             │
│   ESLint --fix          Prettier --write                    │
│         └──────────┬──────────┘                             │
│                    ▼                                        │
│            检查通过？                                        │
│         ┌────┴────┐                                         │
│         ▼         ▼                                         │
│        ✅        ❌ 阻止提交                                 │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              .husky/commit-msg                              │
│                    ↓                                        │
│              commitlint                                     │
│                    ↓                                        │
│         提交信息格式正确？                                   │
│         ┌────┴────┐                                         │
│         ▼         ▼                                         │
│        ✅        ❌ 阻止提交                                 │
└─────────────────────────────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              .husky/post-commit                             │
│                    ↓                                        │
│         自动更新 CHANGELOG.md                                │
└─────────────────────────────────────────────────────────────┘
```

## 配置详解

### 1. ESLint 配置

**文件**: `eslint.config.mjs`

```javascript
const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals', // Next.js 推荐规则
    'next/typescript', // TypeScript 规则
    'prettier' // 禁用与 Prettier 冲突的规则
  ),
  {
    rules: {
      // any 类型警告（不阻止）
      '@typescript-eslint/no-explicit-any': 'warn',

      // 未使用变量（以 _ 开头的忽略）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    // 忽略目录
    ignores: ['node_modules/**', '.next/**', 'public/static/**', 'charting_library/**'],
  },
];
```

### 2. Prettier 配置

**文件**: `.prettierrc`

```json
{
  "semi": true, // 使用分号
  "singleQuote": true, // 使用单引号
  "tabWidth": 2, // 缩进 2 空格
  "trailingComma": "es5", // 尾随逗号（ES5 兼容）
  "printWidth": 100, // 每行最大 100 字符
  "bracketSpacing": true, // 对象括号内空格
  "arrowParens": "always", // 箭头函数始终使用括号
  "endOfLine": "lf", // 使用 LF 换行符
  "jsxSingleQuote": false, // JSX 使用双引号
  "bracketSameLine": false // 多行 JSX 闭合标签换行
}
```

**文件**: `.prettierignore`

```
node_modules
.next
build
dist
out
public/static
charting_library
pnpm-lock.yaml
yarn.lock
package-lock.json
*.min.js
*.min.css
```

### 3. lint-staged 配置

**文件**: `.lintstagedrc.js`

```javascript
module.exports = {
  // JS/TS 文件：ESLint 修复 + Prettier 格式化
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],

  // 其他文件：仅 Prettier 格式化
  '*.{json,md,css,scss}': ['prettier --write'],
};
```

### 4. Commitlint 配置

**文件**: `commitlint.config.js`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 允许的 type 类型
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档更新
        'style', // 代码格式（不影响功能）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试相关
        'chore', // 构建工具或辅助工具变动
        'revert', // 回滚
        'build', // 构建系统变更
        'ci', // CI 配置变更
      ],
    ],
    // 允许中文 subject
    'subject-case': [0],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // type 不能为空
    'type-empty': [2, 'never'],
  },
};
```

### 5. Husky Hooks

**文件**: `.husky/pre-commit`

```bash
npx lint-staged
```

**文件**: `.husky/commit-msg`

```bash
npx --no -- commitlint --edit "$1"
```

## 命令说明

| 命令                | 说明                       |
| ------------------- | -------------------------- |
| `yarn lint`         | 运行 ESLint 检查           |
| `yarn lint:fix`     | ESLint 自动修复            |
| `yarn format`       | Prettier 格式化所有文件    |
| `yarn format:check` | 检查格式是否正确（不修改） |

## 提交信息规范

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 常用示例

```bash
# 新功能
git commit -m "feat: 添加用户登录功能"
git commit -m "feat(auth): 实现 OAuth2 认证"

# 修复 bug
git commit -m "fix: 修复订单金额计算错误"
git commit -m "fix(trading): 修复价格显示精度问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 代码格式
git commit -m "style: 调整代码缩进"

# 重构
git commit -m "refactor: 重构用户模块"
git commit -m "refactor(hooks): 优化 useTrading hook"

# 性能优化
git commit -m "perf: 优化列表渲染性能"

# 构建/工具
git commit -m "chore: 更新依赖版本"
git commit -m "chore(deps): 升级 next 到 15.0"
```

### Type 说明

| Type       | 说明                         |
| ---------- | ---------------------------- |
| `feat`     | 新功能                       |
| `fix`      | 修复 bug                     |
| `docs`     | 文档更新                     |
| `style`    | 代码格式（不影响功能）       |
| `refactor` | 重构（不新增功能或修复 bug） |
| `perf`     | 性能优化                     |
| `test`     | 测试相关                     |
| `chore`    | 构建工具或辅助工具变动       |
| `revert`   | 回滚                         |
| `build`    | 构建系统或外部依赖变更       |
| `ci`       | CI 配置变更                  |

## 最佳实践

### 1. 忽略未使用变量

```typescript
// ✅ 以下划线开头的变量会被忽略
function handleClick(_event: MouseEvent) {
  // 不使用 event 参数
}

const [_value, setValue] = useState(0);
```

### 2. 禁用特定规则

```typescript
// 单行禁用
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = {};

// 块级禁用
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
/* eslint-enable @typescript-eslint/no-require-imports */
```

### 3. Prettier 忽略

```typescript
// prettier-ignore
const matrix = [
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
];
```

### 4. 跳过 Hooks 检查（紧急情况）

```bash
# 跳过所有 hooks（不推荐）
git commit -m "fix: 紧急修复" --no-verify

# 或简写
git commit -m "fix: 紧急修复" -n
```

## 常见问题

### Q: 提交被拒绝，提示 ESLint 错误？

A: 运行 `yarn lint:fix` 自动修复，或手动修复错误后重新提交。

### Q: 提交信息格式错误？

A: 使用正确的格式，例如：

```bash
# ❌ 错误
git commit -m "修复了一个 bug"

# ✅ 正确
git commit -m "fix: 修复了一个 bug"
```

### Q: 如何查看 Prettier 格式差异？

```bash
yarn format:check
```

### Q: 新项目如何初始化 Husky？

```bash
yarn prepare
```

## 依赖安装

```bash
# 核心依赖
yarn add -D eslint prettier husky lint-staged

# Commitlint
yarn add -D @commitlint/cli @commitlint/config-conventional

# ESLint 插件
yarn add -D eslint-config-prettier eslint-plugin-prettier
```

## 相关文件

- [eslint.config.mjs](../../eslint.config.mjs) - ESLint 配置
- [.prettierrc](../../.prettierrc) - Prettier 配置
- [.prettierignore](../../.prettierignore) - Prettier 忽略
- [.lintstagedrc.js](../../.lintstagedrc.js) - lint-staged 配置
- [commitlint.config.js](../../commitlint.config.js) - Commitlint 配置
- [.husky/pre-commit](../../.husky/pre-commit) - 提交前 Hook
- [.husky/commit-msg](../../.husky/commit-msg) - 提交信息 Hook
- [.husky/post-commit](../../.husky/post-commit) - 提交后 Hook
