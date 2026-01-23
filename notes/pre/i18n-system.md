# 国际化 (i18n) 系统设计方案

## 概述

本项目采用 **i18next** 作为国际化解决方案，配合 **i18next-scanner** 自动提取翻译文案。使用 **CRC32 哈希** 作为翻译 key，原始文本作为默认值。

## 技术栈

| 依赖                               | 用途               |
| ---------------------------------- | ------------------ |
| `i18next`                          | 核心国际化库       |
| `react-i18next`                    | React 绑定         |
| `i18next-browser-languagedetector` | 自动检测浏览器语言 |
| `i18next-http-backend`             | 动态加载翻译文件   |
| `i18next-scanner`                  | 自动扫描提取文案   |
| `crc-32`                           | 生成 key 哈希      |

## 文件结构

```
lib/i18n/
└── index.ts              # 导出 I18nProvider

components/providers/
└── I18nProvider.tsx      # i18n 初始化 Provider

public/locales/
├── en/
│   └── translation.json  # 英文翻译
└── zh/
    └── translation.json  # 中文翻译

i18next-scanner.config.js # 扫描配置
```

## 设计特点

### CRC32 哈希 Key

```
原始文本: "Connect Wallet"
哈希 Key: "Kd3a2f1b8"
```

**优点：**

- Key 短小，减少包体积
- 自动生成，无需手动命名
- 避免 key 命名冲突
- 原始文本作为默认值，开发体验好

### 翻译文件格式

```json
// public/locales/en/translation.json
{
  "Kd3a2f1b8": "Connect Wallet",
  "K1a2b3c4d": "Trade Now",
  "K5e6f7a8b": "Your balance: {{amount}}"
}

// public/locales/zh/translation.json
{
  "Kd3a2f1b8": "连接钱包",
  "K1a2b3c4d": "立即交易",
  "K5e6f7a8b": "您的余额: {{amount}}"
}
```

## 使用方式

### 1. 在组件中使用

```tsx
'use client';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      {/* 简单文本 */}
      <h1>{t('Connect Wallet')}</h1>

      {/* 带变量 */}
      <p>{t('Your balance: {{amount}}', { amount: '1,234.56' })}</p>

      {/* 带默认值（文案不存在时显示） */}
      <span>{t('New Feature', { defaultValue: 'New Feature' })}</span>
    </div>
  );
}
```

### 2. 切换语言

```tsx
'use client';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('zh')}>中文</button>
    </div>
  );
}
```

### 3. 获取当前语言

```tsx
const { i18n } = useTranslation();

console.log(i18n.language); // 'en' | 'zh'
console.log(i18n.languages); // ['en', 'zh']
console.log(i18n.resolvedLanguage); // 实际使用的语言
```

## 添加新文案流程

### Step 1: 在代码中使用 t()

```tsx
// 直接写原始文本
<button>{t('New Button Text')}</button>

// 带变量
<span>{t('Hello, {{name}}!', { name: userName })}</span>
```

### Step 2: 运行扫描命令

```bash
yarn i18n:scan
```

**输出示例：**

```
i18next-scanner: count=3, file="components/trading/TradeForm.tsx"
i18next-scanner: count=5, file="components/layout/Navigation.tsx"
```

### Step 3: 翻译文件自动更新

扫描后 `public/locales/` 中的 JSON 文件会自动更新：

```json
// public/locales/en/translation.json
{
  "Kabc12345": "New Button Text",
  "Kdef67890": "Hello, {{name}}!"
}
```

### Step 4: 补充其他语言翻译

编辑 `public/locales/zh/translation.json`：

```json
{
  "Kabc12345": "新按钮文本",
  "Kdef67890": "你好，{{name}}！"
}
```

## 命令说明

| 命令             | 说明                              |
| ---------------- | --------------------------------- |
| `yarn i18n:scan` | 扫描代码，提取翻译 key，更新 JSON |

## 配置详解

### i18next-scanner.config.js

```javascript
module.exports = {
  // 扫描路径
  input: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
  ],

  options: {
    // 支持的语言
    lngs: ['en', 'zh'],

    // 命名空间
    ns: ['translation'],

    // 输出路径
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/locales/{{lng}}/{{ns}}.json',
    },

    // 禁用 key 分隔符（支持 key 中包含 . 和 :）
    keySeparator: false,
    nsSeparator: false,

    // 移除未使用的 key
    removeUnusedKeys: true,
  },

  // 自定义转换：CRC32 哈希 key
  transform: function (file, enc, done) {
    parser.parseFuncFromString(content, { list: ['t'] }, (key, options) => {
      const hashKey = `K${(crc32.str(key) >>> 0).toString(16)}`;
      options.defaultValue = key;
      parser.set(hashKey, options);
    });
    done();
  },
};
```

### I18nProvider.tsx

```typescript
i18n
  .use(Backend) // HTTP 加载翻译文件
  .use(LanguageDetector) // 自动检测语言
  .use(initReactI18next) // React 绑定
  .init({
    fallbackLng: 'en', // 回退语言
    supportedLngs: ['en', 'zh'],

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });
```

## 最佳实践

### 1. 文案编写规范

```tsx
// ✅ 好的写法
t('Connect Wallet');
t('Trade {{symbol}}', { symbol: 'BTC' });
t('You have {{count}} orders', { count: 5 });

// ❌ 避免的写法
t(`Trade ${symbol}`); // 不要用模板字符串
t(variable); // 不要用变量作为 key
t('trade_button'); // 不要用自定义 key（会失去自动扫描优势）
```

### 2. 变量命名

```tsx
// 使用有意义的变量名
t('Balance: {{amount}} {{currency}}', { amount: '100', currency: 'USDT' });

// 复数处理
t('{{count}} item', { count: 1 });
t('{{count}} items', { count: 5 });
```

### 3. 组件使用

```tsx
// 服务端组件不能使用 useTranslation
// 需要用 'use client' 指令

'use client';
import { useTranslation } from 'react-i18next';

function ClientComponent() {
  const { t } = useTranslation();
  return <span>{t('Hello')}</span>;
}
```

### 4. 语言持久化

语言选择会自动保存到 `localStorage`，下次访问时自动恢复。

```typescript
// 检测顺序
detection: {
  order: ['localStorage', 'navigator', 'htmlTag'],
  caches: ['localStorage'],
  lookupLocalStorage: 'i18nextLng',
}
```

## 添加新语言流程

### Step 1: 更新配置

```javascript
// i18next-scanner.config.js
options: {
  lngs: ['en', 'zh', 'ja'],  // 添加日语
}
```

```typescript
// components/providers/I18nProvider.tsx
export const supportedLngs = ['en', 'zh', 'ja'] as const;
```

### Step 2: 创建翻译文件

```bash
mkdir -p public/locales/ja
touch public/locales/ja/translation.json
echo '{}' > public/locales/ja/translation.json
```

### Step 3: 运行扫描

```bash
yarn i18n:scan
```

### Step 4: 翻译文案

编辑 `public/locales/ja/translation.json`，将英文值替换为日文。

## 常见问题

### Q: 为什么使用 CRC32 哈希而不是 UUID？

A: CRC32 生成的 key 更短（8 个字符），且基于内容生成，相同文本会生成相同 key，便于去重。

### Q: 如何处理动态内容？

A: 使用插值变量：

```tsx
t('Hello, {{name}}!', { name: userName });
```

### Q: 扫描后 key 丢失了？

A: `removeUnusedKeys: true` 会移除代码中不再使用的 key。如需保留，设置为 `false`。

### Q: 服务端组件如何国际化？

A: 目前 i18next 主要用于客户端。服务端组件可以：

1. 将需要国际化的部分抽成客户端组件
2. 或使用 next-intl 等支持 RSC 的库

## 相关文件

- [I18nProvider.tsx](../../components/providers/I18nProvider.tsx) - 初始化配置
- [i18next-scanner.config.js](../../i18next-scanner.config.js) - 扫描配置
- [public/locales/en/translation.json](../../public/locales/en/translation.json) - 英文翻译
- [public/locales/zh/translation.json](../../public/locales/zh/translation.json) - 中文翻译
