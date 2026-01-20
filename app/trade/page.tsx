"use client";

import { TradeHeader } from "@/components/trading/TradeHeader";
import { PriceBar } from "@/components/trading/PriceBar";
import TradingViewChart from "@/components/trading/TradingViewChart";
import { OrderBook } from "@/components/trading/OrderBook";
import { TradeForm } from "@/components/trading/TradeForm";
import { AccountPanel } from "@/components/trading/AccountPanel";
import { AccountSidebar } from "@/components/trading/AccountSidebar";
import { StatusBar } from "@/components/trading/StatusBar";

export default function TradePage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <TradeHeader />
      
      {/* Price Bar */}
      <PriceBar />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chart */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chart Area */}
          <div className="flex-1 min-h-[400px]">
            <TradingViewChart symbol="BTC-USDC" />
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
            <OrderBook symbol="BTC-USDC" />
          </div>
          
          {/* Trade Form + Account Sidebar */}
          <div className="flex-1 flex flex-col">
            {/* Trade Form */}
            <div className="flex-1 overflow-y-auto">
              <TradeForm symbol="BTC-USDC" />
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
