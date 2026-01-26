/**
 * Stitches 主题配置
 * 颜色自动从 theme/tokens.ts 同步
 */

import { createStitches } from '@stitches/react';
import { generateStitchesColors } from './theme/tokens';

// 从 tokens 自动生成颜色配置
const themeColors = generateStitchesColors();

export const { styled, css, globalCss, keyframes, getCssText, theme, createTheme, config } =
  createStitches({
    theme: {
      colors: {
        // 自动同步的主题颜色
        ...themeColors,
      },
      fonts: {
        gilroy: 'var(--font-gilroy), sans-serif',
        inter: 'var(--font-inter), sans-serif',
        mono: 'var(--font-source-code), monospace',
      },
      fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      space: {
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
      },
      radii: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(0, 255, 136, 0.3)',
      },
      transitions: {
        fast: '150ms ease',
        normal: '200ms ease',
        slow: '300ms ease',
      },
    },
    media: {
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
      '2xl': '(min-width: 1536px)',
    },
    utils: {
      // 快捷工具函数
      px: (value: string | number) => ({
        paddingLeft: value,
        paddingRight: value,
      }),
      py: (value: string | number) => ({
        paddingTop: value,
        paddingBottom: value,
      }),
      mx: (value: string | number) => ({
        marginLeft: value,
        marginRight: value,
      }),
      my: (value: string | number) => ({
        marginTop: value,
        marginBottom: value,
      }),
      size: (value: string | number) => ({
        width: value,
        height: value,
      }),
    },
  });

// 全局样式
export const globalStyles = globalCss({
  '*': {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
  html: {
    scrollBehavior: 'smooth',
  },
  body: {
    backgroundColor: '$bgPrimary',
    color: '$textPrimary',
    fontFamily: '$inter',
    minHeight: '100vh',
    overflowX: 'hidden',
  },
  // 滚动条样式
  '::-webkit-scrollbar': {
    width: '8px',
  },
  '::-webkit-scrollbar-track': {
    background: '$bgSecondary',
  },
  '::-webkit-scrollbar-thumb': {
    background: '$borderColor',
    borderRadius: '4px',
  },
  '::-webkit-scrollbar-thumb:hover': {
    background: '$borderLight',
  },
});
