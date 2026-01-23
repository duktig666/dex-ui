/**
 * i18n 模块导出
 * 注意：i18n 初始化已移至 I18nProvider 客户端组件
 */

export { I18nProvider, supportedLngs, namespaces } from '@/components/providers/I18nProvider';
export type { SupportedLanguage, Namespace } from '@/components/providers/I18nProvider';

// 自定义翻译 hook（支持 CRC32 hash key）
export { useT, textToHashKey } from './useT';
