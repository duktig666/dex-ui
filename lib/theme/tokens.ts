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
  // Based Orange - 橙色主题
  basedOrange: {
    name: 'Based Orange',
    colors: {
      bgPrimary: '#0d0d0d',
      bgSecondary: '#1a1a1a',
      bgCard: '#141414',
      bgHover: '#252525',
      textPrimary: '#ffffff',
      textSecondary: '#888888',
      textMuted: '#666666',
      accentGreen: '#0ecb81',
      accentRed: '#f6465d',
      accentBlue: '#ff6b35',
      accentYellow: '#ff6b35',
      borderColor: '#2a2a2a',
      borderLight: '#333333',
      long: '#0ecb81',
      short: '#f6465d',
    },
  },

  // Tokyo Night - 东京之夜
  tokyoNight: {
    name: 'Tokyo Night',
    colors: {
      bgPrimary: '#1a1b26',
      bgSecondary: '#16161e',
      bgCard: '#1f2335',
      bgHover: '#292e42',
      textPrimary: '#c0caf5',
      textSecondary: '#9aa5ce',
      textMuted: '#565f89',
      accentGreen: '#9ece6a',
      accentRed: '#f7768e',
      accentBlue: '#7aa2f7',
      accentYellow: '#e0af68',
      borderColor: '#292e42',
      borderLight: '#3b4261',
      long: '#9ece6a',
      short: '#f7768e',
    },
  },

  // Dracula - 德古拉
  dracula: {
    name: 'Dracula',
    colors: {
      bgPrimary: '#282a36',
      bgSecondary: '#21222c',
      bgCard: '#2d2f3f',
      bgHover: '#44475a',
      textPrimary: '#f8f8f2',
      textSecondary: '#bd93f9',
      textMuted: '#6272a4',
      accentGreen: '#50fa7b',
      accentRed: '#ff5555',
      accentBlue: '#8be9fd',
      accentYellow: '#f1fa8c',
      borderColor: '#44475a',
      borderLight: '#6272a4',
      long: '#50fa7b',
      short: '#ff5555',
    },
  },

  // Light - 浅色主题
  light: {
    name: 'Light',
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f5f5f5',
      bgCard: '#ffffff',
      bgHover: '#f0f0f0',
      textPrimary: '#1a1a2e',
      textSecondary: '#666666',
      textMuted: '#999999',
      accentGreen: '#00a86b',
      accentRed: '#dc3545',
      accentBlue: '#4f6ef7',
      accentYellow: '#f0b90b',
      borderColor: '#e0e0e0',
      borderLight: '#f0f0f0',
      long: '#00a86b',
      short: '#dc3545',
    },
  },

  // Atom One Dark
  atomOneDark: {
    name: 'Atom One Dark',
    colors: {
      bgPrimary: '#282c34',
      bgSecondary: '#21252b',
      bgCard: '#2c313a',
      bgHover: '#3e4451',
      textPrimary: '#abb2bf',
      textSecondary: '#828997',
      textMuted: '#5c6370',
      accentGreen: '#98c379',
      accentRed: '#e06c75',
      accentBlue: '#61afef',
      accentYellow: '#e5c07b',
      borderColor: '#3e4451',
      borderLight: '#4b5263',
      long: '#98c379',
      short: '#e06c75',
    },
  },

  // Monokai Pro
  monokaiPro: {
    name: 'Monokai Pro',
    colors: {
      bgPrimary: '#2d2a2e',
      bgSecondary: '#221f22',
      bgCard: '#353236',
      bgHover: '#403e41',
      textPrimary: '#fcfcfa',
      textSecondary: '#c1c0c0',
      textMuted: '#727072',
      accentGreen: '#a9dc76',
      accentRed: '#ff6188',
      accentBlue: '#78dce8',
      accentYellow: '#ffd866',
      borderColor: '#403e41',
      borderLight: '#5b595c',
      long: '#a9dc76',
      short: '#ff6188',
    },
  },

  // Monokai Classic
  monokaiClassic: {
    name: 'Monokai Classic',
    colors: {
      bgPrimary: '#272822',
      bgSecondary: '#1e1f1c',
      bgCard: '#2f302a',
      bgHover: '#3e3d32',
      textPrimary: '#f8f8f2',
      textSecondary: '#cfcfc2',
      textMuted: '#75715e',
      accentGreen: '#a6e22e',
      accentRed: '#f92672',
      accentBlue: '#66d9ef',
      accentYellow: '#e6db74',
      borderColor: '#3e3d32',
      borderLight: '#49483e',
      long: '#a6e22e',
      short: '#f92672',
    },
  },

  // Terminal - 终端绿
  terminal: {
    name: 'Terminal',
    colors: {
      bgPrimary: '#0c0c0c',
      bgSecondary: '#1a1a1a',
      bgCard: '#121212',
      bgHover: '#252525',
      textPrimary: '#00ff00',
      textSecondary: '#00cc00',
      textMuted: '#009900',
      accentGreen: '#00ff00',
      accentRed: '#ff0000',
      accentBlue: '#00ffff',
      accentYellow: '#ffff00',
      borderColor: '#003300',
      borderLight: '#004400',
      long: '#00ff00',
      short: '#ff0000',
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

// 默认主题 Key
export const defaultThemeKey: ThemeKey = 'basedOrange';

// 获取默认主题的颜色（用于 SSR）
export const defaultColors = themeTokens[defaultThemeKey].colors;

// ============ 生成器函数 ============

/**
 * 生成 CSS 变量对象
 * 用于 globals.css 的 :root
 */
export function generateCSSVariables(themeKey: ThemeKey = defaultThemeKey): Record<string, string> {
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
export function generateCSSString(themeKey: ThemeKey = defaultThemeKey): string {
  const vars = generateCSSVariables(themeKey);
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join(';\n  ');
}
