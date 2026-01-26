import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // 指定项目根目录，避免加载父目录配置
  root: __dirname,
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30000, // 30秒超时，API 调用可能较慢
    hookTimeout: 30000,
    // 串行执行避免 429 限流
    sequence: {
      concurrent: false,
    },
    // 每个测试文件顺序执行
    fileParallelism: false,
    // 使用单线程
    maxConcurrency: 1,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 禁用 CSS 处理
  css: {
    postcss: {},
  },
});
