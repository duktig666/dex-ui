'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { Settings } from 'lucide-react';

const navItems = [
  { label: 'Perps', href: '/trade', active: true },
  { label: 'Spot', href: '/trade/spot' },
  { label: 'Predict', href: '/predict' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Ecosystem', href: '/ecosystem' },
  { label: 'More', href: '#' },
];

export function TradeHeader() {
  return (
    <header className="h-12 flex items-center justify-between px-4 bg-bg-primary border-b border-border-color">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-long to-accent-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-white text-lg hidden sm:block">HERMES</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded transition-colors',
                item.active
                  ? 'text-white bg-bg-secondary'
                  : 'text-text-secondary hover:text-white hover:bg-bg-secondary/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: Settings + Wallet Connect */}
      <div className="flex items-center gap-3">
        {/* Settings Modal */}
        <SettingsModal
          trigger={
            <button className="p-2 text-text-secondary hover:text-white hover:bg-bg-hover rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          }
        />

        {/* AppKit Connect Button - using w3m-button */}
        <w3m-button size="sm" balance="hide" />
      </div>
    </header>
  );
}
