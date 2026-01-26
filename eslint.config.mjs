import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'prettier' // 添加 prettier 配置，禁用与 prettier 冲突的规则
  ),
  {
    rules: {
      // 允许使用 any 类型（根据项目需要可调整）
      '@typescript-eslint/no-explicit-any': 'warn',
      // 允许未使用的变量以下划线开头
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
    // 忽略特定目录
    ignores: ['node_modules/**', '.next/**', 'public/static/**', 'charting_library/**'],
  },
];

export default eslintConfig;
