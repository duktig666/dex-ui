'use client';

import { useTheme, themeTokens, type ThemeKey } from '@/lib/theme';

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <span className="text-sm text-text-secondary">主题:</span>
      <div className="flex gap-1">
        {themes.map(({ key, name }) => {
          const colors = themeTokens[key].colors;
          const isActive = theme === key;

          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              title={name}
              className={`
                relative w-6 h-6 rounded-full border-2 transition-all
                ${isActive ? 'border-accent-green scale-110' : 'border-transparent hover:scale-105'}
              `}
              style={{
                background: `linear-gradient(135deg, ${colors.bgPrimary} 50%, ${colors.accentGreen} 50%)`,
              }}
            >
              {isActive && (
                <span className="absolute inset-0 flex items-center justify-center text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 下拉选择器版本
export function ThemeDropdown({ className }: ThemeSelectorProps) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as ThemeKey)}
      className={`
        bg-bg-secondary text-text-primary border border-border-color
        rounded-md px-3 py-1.5 text-sm cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-accent-green
        ${className || ''}
      `}
    >
      {themes.map(({ key, name }) => (
        <option key={key} value={key}>
          {name}
        </option>
      ))}
    </select>
  );
}
