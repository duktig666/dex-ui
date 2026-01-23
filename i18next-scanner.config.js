/**
 * i18next-scanner 配置
 * 自动扫描代码中的翻译 key
 *
 * 效果：key 为 Kxxxxxxxx 哈希值，value 为 t() 中的原始文本
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const chalk = require('chalk');
const crc32 = require('crc-32');
/* eslint-enable @typescript-eslint/no-require-imports */

module.exports = {
  input: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/*.d.ts',
  ],
  output: './',
  options: {
    debug: true,
    removeUnusedKeys: true,
    sort: true,
    // 禁用默认的 func 扫描（由 transform 自定义处理）
    func: false,
    // 禁用 Trans 组件扫描
    trans: false,
    // 支持的语言
    lngs: ['en', 'zh'],
    // 命名空间
    ns: ['translation'],
    defaultLng: 'en',
    defaultNs: 'translation',
    // 资源文件路径
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: false,
    keySeparator: false,
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  /**
   * 自定义转换函数
   * 将 t('原始文本') 转换为 { 'Kxxxxxxxx': '原始文本' }
   */
  transform: function customTransform(file, enc, done) {
    'use strict';
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    parser.parseFuncFromString(content, { list: ['t'] }, (key, options) => {
      // 使用原始文本作为 defaultValue
      options.defaultValue = key;
      // 生成 CRC32 hash key
      const hash = crc32.str(key) >>> 0;
      const hashKey = `K${hash.toString(16)}`;
      parser.set(hashKey, options);
      ++count;
    });

    if (count > 0) {
      console.log(
        `i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(
          JSON.stringify(file.relative)
        )}`
      );
    }

    done();
  },
};
