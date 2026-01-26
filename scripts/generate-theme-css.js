#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * 生成主题 CSS 变量
 * 用于同步 tokens.ts 到 globals.css
 *
 * 使用: node scripts/generate-theme-css.js
 */

const fs = require('fs');
const path = require('path');

// 直接读取 tokens 文件并解析
const tokensPath = path.join(__dirname, '../lib/theme/tokens.ts');
const tokensContent = fs.readFileSync(tokensPath, 'utf8');

// 提取 dark 主题的颜色（作为默认值）
const darkThemeMatch = tokensContent.match(/dark:\s*{[\s\S]*?colors:\s*{([\s\S]*?)},?\s*},/);

if (!darkThemeMatch) {
  console.error('❌ 无法解析 tokens.ts');
  process.exit(1);
}

const colorsBlock = darkThemeMatch[1];
const colorLines = colorsBlock.match(/(\w+):\s*['"]([^'"]+)['"]/g);

if (!colorLines) {
  console.error('❌ 无法解析颜色定义');
  process.exit(1);
}

// 转换为 CSS 变量
const toKebabCase = (str) => str.replace(/([A-Z])/g, '-$1').toLowerCase();

const cssVars = colorLines
  .map((line) => {
    const match = line.match(/(\w+):\s*['"]([^'"]+)['"]/);
    if (match) {
      const [, key, value] = match;
      return `  --${toKebabCase(key)}: ${value};`;
    }
    return null;
  })
  .filter(Boolean);

const cssOutput = `:root {
  /* 主题颜色变量（由 ThemeProvider 动态更新） */
  /* 自动生成自 lib/theme/tokens.ts */
${cssVars.join('\n')}
}`;

console.log('📋 复制以下内容到 globals.css 的 :root 部分:\n');
console.log(cssOutput);
console.log('\n✅ 生成完成！');

// 可选：自动更新 globals.css
const args = process.argv.slice(2);
if (args.includes('--write')) {
  const globalsPath = path.join(__dirname, '../app/globals.css');
  let globalsContent = fs.readFileSync(globalsPath, 'utf8');

  // 替换 :root 块
  const rootRegex = /:root\s*{[^}]*\/\*\s*主题颜色变量[^}]*}/;
  if (rootRegex.test(globalsContent)) {
    globalsContent = globalsContent.replace(rootRegex, cssOutput);
    fs.writeFileSync(globalsPath, globalsContent);
    console.log('📝 已自动更新 globals.css');
  } else {
    console.log('⚠️  globals.css 中未找到主题颜色变量块，请手动更新');
  }
}
