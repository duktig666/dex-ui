# 主题系统设计方案

## 概述

本项目采用 **单一数据源** 的主题系统设计，通过 `lib/theme/tokens.ts` 统一管理所有主题配置，自动同步到 Tailwind CSS、Stitches 和 CSS 变量。支持 **12 种预设主题**，可通过设置模态框即时切换。

## 可用主题

| 主题 Key         | 名称            | 描述                 |
| ---------------- | --------------- | -------------------- |
| `basedOrange`    | Based Orange    | 默认主题，橙色强调   |
| `dark`           | Dark            | 经典暗黑主题         |
| `light`          | Light           | 浅色主题             |
| `tokyoNight`     | Tokyo Night     | 东京之夜配色         |
| `dracula`        | Dracula         | 德古拉吸血鬼主题     |
| `atomOneDark`    | Atom One Dark   | Atom 编辑器风格      |
| `monokaiPro`     | Monokai Pro     | Monokai Pro 配色     |
| `monokaiClassic` | Monokai Classic | 经典 Monokai 配色    |
| `terminal`       | Terminal        | 终端/黑客风格        |
| `binance`        | Binance         | 币安风格（黄色强调） |
| `ocean`          | Ocean           | 海洋蓝配色           |
| `purple`         | Purple          | 紫色梦幻风格         |

## 架构设计

```
lib/theme/tokens.ts (唯一数据源)
        |
        v
+-------+-------+-------+
|       |       |       |
v       v       v       v
Tailwind  Stitches  globals.css  ThemeProvider
config.ts config.ts  :root {}    (动态切换)
        |       |       |
        +-------+-------+
                |
                v
           CSS 变量
          var(--xxx)
```

## 文件结构

```
lib/theme/
├── tokens.ts      # 主题 Token 定义 + 生成器函数
├── provider.tsx   # ThemeProvider 组件
└── index.ts       # 统一导出

components/ui/
└── SettingsModal.tsx  # 设置模态框（含主题切换）

scripts/
└── generate-theme-css.js  # CSS 变量生成脚本
```

## 核心文件说明

### 1. tokens.ts - 主题定义

```typescript
// 颜色 Token 接口
export interface ColorTokens {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentGreen: string;
  accentRed: string;
  accentBlue: string;
  accentYellow: string;
  borderColor: string;
  borderLight: string;
  long: string; // 做多颜色
  short: string; // 做空颜色
}

// 默认主题
export const defaultThemeKey: ThemeKey = 'basedOrange';

// 主题配置
export const themeTokens = {
  basedOrange: { name: 'Based Orange', colors: { ... } },
  dark: { name: 'Dark', colors: { ... } },
  light: { name: 'Light', colors: { ... } },
  tokyoNight: { name: 'Tokyo Night', colors: { ... } },
  dracula: { name: 'Dracula', colors: { ... } },
  // ...
};
```

### 2. provider.tsx - 主题切换

```typescript
// 动态更新 CSS 变量
function applyTheme(themeKey: ThemeKey) {
  const { colors } = themeTokens[themeKey];
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${toKebab(key)}`, value);
  });
}
```

### 3. 生成器函数

| 函数                       | 用途          | 输出格式                                |
| -------------------------- | ------------- | --------------------------------------- |
| `generateTailwindColors()` | Tailwind 配置 | `{ 'bg-primary': 'var(--bg-primary)' }` |
| `generateStitchesColors()` | Stitches 配置 | `{ bgPrimary: 'var(--bg-primary)' }`    |
| `generateCSSVariables()`   | CSS 变量      | `{ '--bg-primary': '#000000' }`         |
| `generateCSSString()`      | CSS 字符串    | `--bg-primary: #000000;`                |

## 使用方式

### 在组件中使用主题

```tsx
'use client';
import { useTheme } from '@/lib/theme';

function Component() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="bg-bg-primary text-text-primary">
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        {themes.map((t) => (
          <option key={t.key} value={t.key}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### 通过设置模态框切换

```tsx
import { SettingsModal } from '@/components/ui/SettingsModal';

// 在导航栏或其他地方使用
<SettingsModal
  trigger={
    <button>
      <Settings className="w-5 h-5" />
    </button>
  }
/>;
```

### Tailwind 类名

```tsx
// 背景色
<div className="bg-bg-primary bg-bg-secondary bg-bg-card bg-bg-hover" />

// 文字颜色
<span className="text-text-primary text-text-secondary text-text-muted" />

// 强调色
<button className="bg-accent-green text-accent-red border-accent-blue" />

// 交易颜色
<span className="text-long">+2.5%</span>
<span className="text-short">-1.2%</span>

// 边框
<div className="border border-border-color" />
```

### Stitches styled 组件

```typescript
import { styled } from '@/lib/stitches.config';

const Card = styled('div', {
  backgroundColor: '$bgCard',
  border: '1px solid $borderColor',
  color: '$textPrimary',

  '&:hover': {
    backgroundColor: '$bgHover',
  },
});

const PriceChange = styled('span', {
  variants: {
    direction: {
      up: { color: '$long' },
      down: { color: '$short' },
    },
  },
});
```

## 添加新主题流程

### Step 1: 定义主题

在 `lib/theme/tokens.ts` 的 `themeTokens` 中添加：

```typescript
export const themeTokens: Record<string, ThemeConfig> = {
  // ... 现有主题

  myTheme: {
    name: 'My Custom Theme',
    colors: {
      bgPrimary: '#1a1a2e',
      bgSecondary: '#16213e',
      bgCard: '#0f3460',
      bgHover: '#1a4a73',
      textPrimary: '#e8e8e8',
      textSecondary: '#a0a0a0',
      textMuted: '#6b6b6b',
      accentGreen: '#00ff9f',
      accentRed: '#ff6b6b',
      accentBlue: '#4d9fff',
      accentYellow: '#ffd700',
      borderColor: '#2a4a6a',
      borderLight: '#3a5a7a',
      long: '#00ff9f',
      short: '#ff6b6b',
    },
  },
};
```

### Step 2: 同步 CSS 变量（可选）

如果需要更新 `globals.css` 中的默认值：

```bash
# 预览生成的 CSS
yarn theme:sync

# 自动更新 globals.css
yarn theme:write
```

### Step 3: 完成

- Tailwind 和 Stitches **自动同步**，无需手动更新
- 新主题会自动出现在 `useTheme().themes` 列表中
- 设置模态框会自动显示新主题选项

## TradingView 图表主题集成

TradingView 图表颜色也会随主题动态变化：

```typescript
// lib/tradingview/config.ts
export function getChartOverrides(colors: ColorTokens) {
  return {
    'paneProperties.background': colors.bgPrimary,
    'paneProperties.vertGridProperties.color': colors.borderColor,
    'scalesProperties.textColor': colors.textSecondary,
    'mainSeriesProperties.candleStyle.upColor': colors.long,
    'mainSeriesProperties.candleStyle.downColor': colors.short,
  };
}

// components/trading/TradingViewChart.tsx
const { theme: currentThemeKey } = useTheme();
const currentThemeColors = themeTokens[currentThemeKey].colors;

const widgetOptions = {
  overrides: getChartOverrides(currentThemeColors),
  studies_overrides: getStudiesOverrides(currentThemeColors),
  loading_screen: getLoadingScreenConfig(currentThemeColors),
};
```

## 命令说明

| 命令               | 说明                               |
| ------------------ | ---------------------------------- |
| `yarn theme:sync`  | 预览 CSS 变量（不写入文件）        |
| `yarn theme:write` | 自动更新 globals.css 中的 CSS 变量 |

## 配置文件关系

### tailwind.config.ts

```typescript
import { generateTailwindColors } from './lib/theme/tokens';

const themeColors = generateTailwindColors();

const config = {
  theme: {
    extend: {
      colors: {
        ...themeColors, // 自动生成
      },
    },
  },
};
```

### lib/stitches.config.ts

```typescript
import { generateStitchesColors } from './theme/tokens';

const themeColors = generateStitchesColors();

export const { styled } = createStitches({
  theme: {
    colors: {
      ...themeColors, // 自动生成
    },
  },
});
```

### app/globals.css

```css
:root {
  /* 主题颜色变量（由 ThemeProvider 动态更新） */
  --bg-primary: #0d0d0d;
  --bg-secondary: #151515;
  --accent-blue: #ff6600;
  /* ... 其他变量 */
}
```

## 最佳实践

### 1. 颜色命名规范

| 类型   | 命名            | 示例                         |
| ------ | --------------- | ---------------------------- |
| 背景色 | `bg*`           | `bgPrimary`, `bgCard`        |
| 文字色 | `text*`         | `textPrimary`, `textMuted`   |
| 强调色 | `accent*`       | `accentGreen`, `accentRed`   |
| 边框色 | `border*`       | `borderColor`, `borderLight` |
| 交易色 | `long`, `short` | 做多/做空                    |

### 2. 使用场景

| 场景                | 推荐方案                   |
| ------------------- | -------------------------- |
| 快速布局/间距       | Tailwind 类名              |
| 主题颜色            | Tailwind (`bg-bg-primary`) |
| 复杂组件样式        | Stitches `styled()`        |
| 条件样式 (variants) | Stitches variants          |
| 动画                | Stitches keyframes         |

### 3. 不要做的事

- 在组件中硬编码颜色值（如 `#ff0000`）
- 直接修改 tailwind.config.ts 的颜色
- 直接修改 stitches.config.ts 的颜色
- 创建多个 CSS 变量来源

### 4. 应该做的事

- 所有颜色定义在 `tokens.ts`
- 使用 CSS 变量或生成的类名
- 新增主题时运行 `yarn theme:sync` 检查
- 保持颜色命名一致性

## 主题持久化

主题选择会自动保存到 `localStorage`，下次访问时自动恢复：

```typescript
// 保存
localStorage.setItem('hermes-theme', themeKey);

// 读取
const saved = localStorage.getItem('hermes-theme');
```

## 相关文件

- [tokens.ts](../../lib/theme/tokens.ts) - 主题定义
- [provider.tsx](../../lib/theme/provider.tsx) - 主题切换逻辑
- [SettingsModal.tsx](../../components/ui/SettingsModal.tsx) - 设置模态框
- [stitches.config.ts](../../lib/stitches.config.ts) - Stitches 配置
- [tailwind.config.ts](../../tailwind.config.ts) - Tailwind 配置
- [lib/tradingview/config.ts](../../lib/tradingview/config.ts) - TradingView 主题配置
