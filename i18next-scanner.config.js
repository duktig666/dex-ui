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
    // 分隔符 - 禁用以支持 key 中包含 . 和 : 的情况
    keySeparator: false,
    nsSeparator: false,
    // 插值配置
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
  // 自定义转换函数 - 使用 CRC32 生成 hash key，原始文本作为 value
  transform: function customTransform(file, enc, done) {
    'use strict';
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;

    // 手动解析 t('...') 调用
    parser.parseFuncFromString(content, { list: ['t'] }, (key, options) => {
      // 使用 CRC32 生成 hash key，格式: K + hex
      const hashKey = `K${(crc32.str(key) >>> 0).toString(16)}`;

      // 设置所有语言的默认值为原始文本
      options.defaultValue = key;

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
