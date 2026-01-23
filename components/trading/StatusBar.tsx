'use client';

import Link from 'next/link';

export function StatusBar() {
  // Mock status data
  const statusData = {
    openValue: 0,
    longs: 0,
    shorts: 0,
    delta: 0,
    upnl: 0,
    orders: 0,
    ordersValue: 0,
    buys: 0,
    buysValue: 0,
    sells: 0,
    sellsValue: 0,
    version: '49c1698',
    status: 'Online',
  };

  return (
    <footer className="h-8 flex items-center justify-between px-4 bg-[#0b0e11] border-t border-[#1a1d26] text-xs">
      {/* Left: Trading Stats */}
      <div className="flex items-center gap-4 text-[#848e9c]">
        <span>
          Open: <span className="text-white font-mono">${statusData.openValue}</span>
        </span>
        <span>
          Longs: <span className="text-[#0ecb81] font-mono">${statusData.longs}</span>
        </span>
        <span>
          Shorts: <span className="text-[#f6465d] font-mono">${statusData.shorts}</span>
        </span>
        <span>
          Delta: <span className="text-white font-mono">+${statusData.delta}</span>
        </span>
        <span>
          UPnL: <span className="text-[#0ecb81] font-mono">+${statusData.upnl}</span>
        </span>
        <span>
          Orders: <span className="text-white font-mono">{statusData.orders}</span>
          <span className="text-[#848e9c]"> (${statusData.ordersValue})</span>
        </span>
        <span>
          Buys/Sells: <span className="text-white font-mono">{statusData.buys}</span>
          <span className="text-[#848e9c]"> (${statusData.buysValue})</span>
          <span className="text-white">/</span>
          <span className="text-white font-mono">{statusData.sells}</span>
          <span className="text-[#848e9c]"> (${statusData.sellsValue})</span>
        </span>
      </div>

      {/* Right: Social Links + Status */}
      <div className="flex items-center gap-3">
        {/* Widget buttons */}
        <button
          className="text-[#848e9c] hover:text-white transition-colors"
          title="Toggle Spot Volume Widget"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </button>
        <button
          className="text-[#848e9c] hover:text-white transition-colors"
          title="Add News Widget"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </button>
        <button className="text-[#848e9c] hover:text-white transition-colors" title="Get help">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Social Links */}
        <Link
          href="https://x.com/HermesX"
          target="_blank"
          className="text-[#848e9c] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </Link>
        <Link
          href="https://discord.gg/hermes"
          target="_blank"
          className="text-[#848e9c] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </Link>
        <Link
          href="https://t.me/HermesX"
          target="_blank"
          className="text-[#848e9c] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </Link>

        {/* Command Menu */}
        <button className="text-[#848e9c] hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Version */}
        <span className="text-[#848e9c] font-mono">{statusData.version}</span>

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          <span className={statusData.status === 'Online' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
            {statusData.status}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${statusData.status === 'Online' ? 'bg-[#0ecb81]' : 'bg-[#f6465d]'}`}
          />
        </div>
      </div>
    </footer>
  );
}
