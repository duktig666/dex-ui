/**
 * 设计 Token 定义 - 单一数据源
 * 所有主题配置从这里生成
 */

// ============ 颜色 Token 类型 ============
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
  long: string;
  short: string;
}

export interface ThemeConfig {
  name: string;
  colors: ColorTokens;
}

// ============ 主题定义 ============
export const themeTokens: Record<string, ThemeConfig> = {
  dark: {
    name: 'Dark',
    colors: {
      bgPrimary: '#000000',
      bgSecondary: '#0a0a0a',
      bgCard: '#111111',
      bgHover: '#1a1a1a',
      textPrimary: '#ffffff',
      textSecondary: '#888888',
      textMuted: '#666666',
      accentGreen: '#00ff88',
      accentRed: '#ff4444',
      accentBlue: '#2962ff',
      accentYellow: '#f0b90b',
      borderColor: '#1a1a1a',
      borderLight: '#2a2a2a',
      long: '#0ecb81',
      short: '#f6465d',
    },
  },

  light: {
    name: 'Light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f5f5f5',
      bgCard: '#ffffff',
      bgHover: '#f0f0f0',
      textPrimary: '#000000',
      textSecondary: '#666666',
      textMuted: '#999999',
      accentGreen: '#00cc66',
      accentRed: '#dc3545',
      accentBlue: '#0066ff',
      accentYellow: '#ffc107',
      borderColor: '#e0e0e0',
      borderLight: '#f0f0f0',
      long: '#00a86b',
      short: '#dc3545',
    },
  },

  binance: {
    name: 'Binance',
    colors: {
      bgPrimary: '#0b0e11',
      bgSecondary: '#1e2329',
      bgCard: '#181a20',
      bgHover: '#2b3139',
      textPrimary: '#eaecef',
      textSecondary: '#848e9c',
      textMuted: '#5e6673',
      accentGreen: '#0ecb81',
      accentRed: '#f6465d',
      accentBlue: '#1890ff',
      accentYellow: '#f0b90b',
      borderColor: '#2b3139',
      borderLight: '#363c45',
      long: '#0ecb81',
      short: '#f6465d',
    },
  },

  ocean: {
    name: 'Ocean',
    colors: {
      bgPrimary: '#0a1628',
      bgSecondary: '#0d1d31',
      bgCard: '#112240',
      bgHover: '#1a3a5c',
      textPrimary: '#ccd6f6',
      textSecondary: '#8892b0',
      textMuted: '#495670',
      accentGreen: '#64ffda',
      accentRed: '#ff6b6b',
      accentBlue: '#57cbff',
      accentYellow: '#ffd93d',
      borderColor: '#1a3a5c',
      borderLight: '#233554',
      long: '#64ffda',
      short: '#ff6b6b',
    },
  },

  purple: {
    name: 'Purple Night',
    colors: {
      bgPrimary: '#13111c',
      bgSecondary: '#1a1625',
      bgCard: '#211d2e',
      bgHover: '#2d2640',
      textPrimary: '#e8e6f0',
      textSecondary: '#9d95b8',
      textMuted: '#6b6085',
      accentGreen: '#4ade80',
      accentRed: '#f43f5e',
      accentBlue: '#a78bfa',
      accentYellow: '#fbbf24',
      borderColor: '#2d2640',
      borderLight: '#3d3455',
      long: '#4ade80',
      short: '#f43f5e',
    },
  },
};

export type ThemeKey = keyof typeof themeTokens;

// ============ 工具函数 ============

// camelCase -> kebab-case
export const toKebabCase = (str: string): string => str.replace(/([A-Z])/g, '-$1').toLowerCase();

// 获取所有可用主题
export const availableThemes = Object.entries(themeTokens).map(([key, value]) => ({
  key: key as ThemeKey,
  name: value.name,
}));

// 获取默认主题的颜色（用于 SSR）
export const defaultColors = themeTokens.dark.colors;

// ============ 生成器函数 ============

/**
 * 生成 CSS 变量对象
 * 用于 globals.css 的 :root
 */
export function generateCSSVariables(themeKey: ThemeKey = 'dark'): Record<string, string> {
  const { colors } = themeTokens[themeKey];
  const vars: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    vars[`--${toKebabCase(key)}`] = value;
  });

  return vars;
}

/**
 * 生成 Tailwind 颜色配置
 * 用于 tailwind.config.ts
 */
export function generateTailwindColors(): Record<string, string> {
  const colors: Record<string, string> = {};

  // 使用 CSS 变量，这样主题切换时自动更新
  Object.keys(defaultColors).forEach((key) => {
    colors[toKebabCase(key)] = `var(--${toKebabCase(key)})`;
  });

  return colors;
}

/**
 * 生成 Stitches 主题配置
 * 用于 stitches.config.ts
 */
export function generateStitchesColors(): Record<string, string> {
  const colors: Record<string, string> = {};

  // 使用 CSS 变量
  Object.keys(defaultColors).forEach((key) => {
    colors[key] = `var(--${toKebabCase(key)})`;
  });

  return colors;
}

/**
 * 生成 CSS 变量字符串
 * 用于内联样式或动态注入
 */
export function generateCSSString(themeKey: ThemeKey = 'dark'): string {
  const vars = generateCSSVariables(themeKey);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';\n  ');
}
