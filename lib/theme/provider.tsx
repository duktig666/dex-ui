'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { themeTokens, type ThemeKey, availableThemes, defaultThemeKey } from './tokens';

interface ThemeContextValue {
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  themes: typeof availableThemes;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'dex-theme';

// 将主题 token 转换为 CSS 变量
function applyTheme(themeKey: ThemeKey) {
  const { colors } = themeTokens[themeKey];
  const root = document.documentElement;

  // 转换 camelCase 为 kebab-case
  const toKebab = (str: string) => str.replace(/([A-Z])/g, '-$1').toLowerCase();

  // 应用所有颜色变量
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${toKebab(key)}`, value);
  });

  // 设置 data 属性用于 CSS 选择器
  root.setAttribute('data-theme', themeKey);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>(defaultThemeKey);
  const [mounted, setMounted] = useState(false);

  // 初始化：从 localStorage 读取
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeKey | null;
    if (stored && themeTokens[stored]) {
      setThemeState(stored);
      applyTheme(stored);
    } else {
      applyTheme(defaultThemeKey);
    }
    setMounted(true);
  }, []);

  // 主题切换
  const setTheme = useCallback((newTheme: ThemeKey) => {
    if (!themeTokens[newTheme]) return;

    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, []);

  // 避免 SSR 水合问题
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
