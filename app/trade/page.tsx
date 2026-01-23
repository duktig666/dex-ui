'use client';

import { TradeHeader } from '@/components/trading/TradeHeader';
import { PriceBar } from '@/components/trading/PriceBar';
import TradingViewChart from '@/components/trading/TradingViewChart';
import { OrderBook } from '@/components/trading/OrderBook';
import { TradeForm } from '@/components/trading/TradeForm';
import { AccountPanel } from '@/components/trading/AccountPanel';
import { AccountSidebar } from '@/components/trading/AccountSidebar';
import { StatusBar } from '@/components/trading/StatusBar';
import { HyperliquidProvider, useHyperliquid } from '@/components/providers';

const DEFAULT_SYMBOL = 'BTC';

// 内部交易页面组件，使用 Context 获取当前币种
function TradePageContent() {
  const { currentCoin } = useHyperliquid();
  const symbol = `${currentCoin}-USDC`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <TradeHeader />

      {/* Price Bar */}
      <PriceBar symbol={symbol} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chart */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chart Area */}
          <div className="flex-1 min-h-[400px]">
            {/* 使用 key 强制在币种变化时重新挂载组件 */}
            <TradingViewChart key={currentCoin} symbol={`${currentCoin}USD`} />
          </div>

          {/* Bottom: Account Panel */}
          <div className="h-[280px] border-t border-[#1a1d26]">
            <AccountPanel />
          </div>
        </div>

        {/* Right: Order Book + Trade Form + Account Sidebar */}
        <div className="w-[600px] flex border-l border-[#1a1d26]">
          {/* Order Book */}
          <div className="w-[280px] border-r border-[#1a1d26]">
            <OrderBook symbol={symbol} />
          </div>

          {/* Trade Form + Account Sidebar */}
          <div className="flex-1 flex flex-col">
            {/* Trade Form */}
            <div className="flex-1 overflow-y-auto">
              <TradeForm symbol={symbol} />
            </div>

            {/* Account Sidebar */}
            <div className="border-t border-[#1a1d26]">
              <AccountSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

export default function TradePage() {
  return (
    <HyperliquidProvider initialCoin={DEFAULT_SYMBOL}>
      <TradePageContent />
    </HyperliquidProvider>
  );
}
