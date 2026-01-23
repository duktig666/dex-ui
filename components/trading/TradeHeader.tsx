'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

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
    <header className="h-12 flex items-center justify-between px-4 bg-[#0b0e11] border-b border-[#1a1d26]">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0ecb81] to-[#2962ff] rounded-lg flex items-center justify-center">
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
                  ? 'text-white bg-[#1a1d26]'
                  : 'text-[#848e9c] hover:text-white hover:bg-[#1a1d26]/50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: Wallet Connect */}
      <div className="flex items-center gap-3">
        <button className="px-2 py-1 text-sm text-[#848e9c] hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* AppKit Connect Button - using w3m-button */}
        <w3m-button size="sm" balance="hide" />
      </div>
    </header>
  );
}
