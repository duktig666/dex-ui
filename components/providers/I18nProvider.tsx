'use client';

import { useEffect, useState } from 'react';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 支持的语言
export const supportedLngs = ['en', 'zh'] as const;
export type SupportedLanguage = (typeof supportedLngs)[number];

// 命名空间
export const namespaces = ['translation'] as const;
export type Namespace = (typeof namespaces)[number];

// 初始化标志
let isInitialized = false;

function initI18n() {
  if (isInitialized) return;

  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs,
      ns: namespaces,
      defaultNS: 'translation',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },
      keySeparator: false,
      nsSeparator: false,
      interpolation: {
        escapeValue: false,
        prefix: '{{',
        suffix: '}}',
      },
      react: {
        useSuspense: false,
      },
      debug: process.env.NODE_ENV === 'development',
    });

  isInitialized = true;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initI18n();
    // 等待 i18n 初始化完成
    if (i18n.isInitialized) {
      setIsReady(true);
    } else {
      i18n.on('initialized', () => setIsReady(true));
    }
  }, []);

  if (!isReady) {
    return null; // 或者返回 loading 状态
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
