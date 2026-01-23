'use client';

import crc32 from 'crc-32';
import { TOptions } from 'i18next';
import { useTranslation } from 'react-i18next';

/**
 * 将原文转换为 CRC32 hash key
 * 格式: Kxxxxxxxx (K + 8位16进制)
 */
export function textToHashKey(text: string): string {
  const hash = crc32.str(text) >>> 0; // 转为无符号整数
  return `K${hash.toString(16)}`;
}

/**
 * 自定义翻译 hook
 * 使用方式与 useTranslation 相同，但会自动将原文转换为 hash key
 *
 * @example
 * const { t } = useT();
 * t('Balances') // 内部会转换为 t('Kb8d18659')
 */
export function useT() {
  const { t: originalT, i18n, ready } = useTranslation();

  /**
   * 翻译函数
   * @param key 原始文本（如 "Balances"）
   * @param options i18next 选项（如 { count: 1 } 或 { defaultValue: 'xxx' }）
   */
  const t = (key: string, options?: TOptions): string => {
    const hashKey = textToHashKey(key);

    // 检查 hash key 是否存在翻译
    if (i18n.exists(hashKey)) {
      return originalT(hashKey, options);
    }

    // 如果 hash key 不存在，回退到原文
    // 这样在翻译文件未更新时，至少显示原文
    return originalT(key, { defaultValue: key, ...options });
  };

  return { t, i18n, ready };
}

export default useT;
