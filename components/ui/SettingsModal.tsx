'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SupportedLanguage, supportedLngs, useT } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { ThemeKey, themeTokens } from '@/lib/theme/tokens';
import { cn } from '@/lib/utils';
import * as Tabs from '@radix-ui/react-tabs';
import {
  Check,
  Globe,
  LayoutGrid,
  Palette,
  Settings,
  Shield,
  TrendingUp,
  Type,
  User,
} from 'lucide-react';
import { useState } from 'react';

// 语言配置
const languageConfig: Record<SupportedLanguage, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  zh: { name: 'Chinese', nativeName: '中文' },
};

// Tab 配置 - 使用英文 label 以便 useT 正确计算 hash key
const tabs = [
  { id: 'language', icon: Globe, label: 'Language' },
  { id: 'color', icon: Palette, label: 'Color' },
  { id: 'font', icon: Type, label: 'Font' },
  { id: 'layout', icon: LayoutGrid, label: 'Layout' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'tradeline', icon: TrendingUp, label: 'Trading' },
  { id: 'account', icon: User, label: 'Account' },
] as const;

type TabId = (typeof tabs)[number]['id'];

// 主题预览卡片组件
function ThemeCard({
  themeKey,
  config,
  isActive,
  onClick,
}: {
  themeKey: string;
  config: (typeof themeTokens)[string];
  isActive: boolean;
  onClick: () => void;
}) {
  const { colors } = config;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border-2 transition-all duration-200',
        isActive
          ? 'border-accent-blue ring-2 ring-accent-blue/30'
          : 'border-transparent hover:border-border-light'
      )}
    >
      {/* 主题预览 */}
      <div className="relative h-[100px] w-full p-2" style={{ backgroundColor: colors.bgPrimary }}>
        {/* 模拟 UI 元素 */}
        <div className="flex h-full flex-col gap-1">
          {/* 顶部栏 */}
          <div
            className="flex h-4 items-center justify-end gap-1 rounded px-1"
            style={{ backgroundColor: colors.bgSecondary }}
          >
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.accentBlue }} />
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.long }} />
          </div>

          {/* 内容区 */}
          <div className="flex flex-1 gap-1">
            {/* 左侧 */}
            <div className="flex-1 rounded" style={{ backgroundColor: colors.bgCard }}>
              <div className="flex h-full flex-col justify-end p-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1 rounded-t"
                      style={{
                        height: `${Math.random() * 20 + 10}px`,
                        backgroundColor: i % 2 === 0 ? colors.long : colors.short,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧 */}
            <div className="w-1/3 rounded p-1" style={{ backgroundColor: colors.bgCard }}>
              <div className="flex flex-col gap-1">
                <div
                  className="h-1.5 w-full rounded"
                  style={{ backgroundColor: colors.borderLight }}
                />
                <div
                  className="h-1.5 w-3/4 rounded"
                  style={{ backgroundColor: colors.borderLight }}
                />
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-1">
            <div className="h-3 flex-1 rounded" style={{ backgroundColor: colors.long }} />
            <div className="h-3 flex-1 rounded" style={{ backgroundColor: colors.short }} />
          </div>
        </div>

        {/* 选中标记 */}
        {isActive && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent-blue">
            <Check className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      {/* 主题名称 */}
      <div
        className="px-3 py-2 text-left text-sm font-medium"
        style={{
          backgroundColor: colors.bgSecondary,
          color: colors.textPrimary,
        }}
      >
        {config.name}
      </div>
    </button>
  );
}

// 语言选择卡片
function LanguageCard({
  lang,
  config,
  isActive,
  onClick,
}: {
  lang: SupportedLanguage;
  config: { name: string; nativeName: string };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-lg border-2 p-4 transition-all duration-200',
        isActive
          ? 'border-accent-blue bg-accent-blue/10'
          : 'border-border-color bg-bg-card hover:border-border-light hover:bg-bg-hover'
      )}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="text-lg font-medium text-text-primary">{config.nativeName}</span>
        <span className="text-sm text-text-secondary">{config.name}</span>
      </div>
      {isActive && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-blue">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
    </button>
  );
}

// 语言设置面板
function LanguagePanel() {
  const { i18n, t } = useT();
  const currentLang = i18n.language as SupportedLanguage;

  const handleLanguageChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text-primary">{t('Select Language')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {supportedLngs.map((lang) => (
          <LanguageCard
            key={lang}
            lang={lang}
            config={languageConfig[lang]}
            isActive={currentLang === lang || (currentLang.startsWith(lang) && true)}
            onClick={() => handleLanguageChange(lang)}
          />
        ))}
      </div>
    </div>
  );
}

// 颜色/主题设置面板
function ColorPanel() {
  const { theme, setTheme } = useTheme();
  const { t } = useT();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-text-primary">{t('Theme Options')}</h3>
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(themeTokens).map(([key, config]) => (
          <ThemeCard
            key={key}
            themeKey={key}
            config={config}
            isActive={theme === key}
            onClick={() => setTheme(key as ThemeKey)}
          />
        ))}
      </div>
    </div>
  );
}

// 占位面板（用于未实现的 Tab）
function PlaceholderPanel({ title }: { title: string }) {
  const { t } = useT();
  return (
    <div className="flex h-[300px] items-center justify-center">
      <p className="text-text-secondary">{t('{{title}} 设置即将推出', { title })}</p>
    </div>
  );
}

// 设置模态框
export function SettingsModal({
  trigger,
  defaultTab = 'color',
}: {
  trigger?: React.ReactNode;
  defaultTab?: TabId;
}) {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  const renderPanel = () => {
    switch (activeTab) {
      case 'language':
        return <LanguagePanel />;
      case 'color':
        return <ColorPanel />;
      case 'font':
        return <PlaceholderPanel title={t('Font')} />;
      case 'layout':
        return <PlaceholderPanel title={t('Layout')} />;
      case 'security':
        return <PlaceholderPanel title={t('Security')} />;
      case 'tradeline':
        return <PlaceholderPanel title={t('Trading')} />;
      case 'account':
        return <PlaceholderPanel title={t('Account')} />;
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 rounded-lg bg-bg-card px-3 py-2 text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary">
            <Settings className="h-4 w-4" />
            <span>{t('Settings')}</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[720px] bg-bg-primary p-0">
        <DialogHeader className="border-b border-border-color px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-text-primary">
            {t('Settings')}
          </DialogTitle>
        </DialogHeader>

        <Tabs.Root
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabId)}
          className="flex flex-col"
        >
          {/* Tab 列表 */}
          <Tabs.List className="flex gap-1 border-b border-border-color px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isImplemented = tab.id === 'language' || tab.id === 'color';

              return (
                <Tabs.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-accent-blue text-text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary',
                    isImplemented && isActive && 'rounded-t bg-bg-hover/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{t(tab.label)}</span>
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          {/* Tab 内容 */}
          <div className="max-h-[500px] overflow-y-auto p-6">{renderPanel()}</div>
        </Tabs.Root>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsModal;
