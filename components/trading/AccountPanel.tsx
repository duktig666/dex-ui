"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";

type TabType = "balances" | "positions" | "orders" | "twap" | "trailing" | "trade-history" | "funding-history" | "order-history";

const tabs: { value: TabType; label: string; count?: number }[] = [
  { value: "balances", label: "Balances" },
  { value: "positions", label: "Positions", count: 0 },
  { value: "orders", label: "Open Orders", count: 0 },
  { value: "twap", label: "TWAP", count: 0 },
  { value: "trailing", label: "Trailing", count: 0 },
  { value: "trade-history", label: "Trade History" },
  { value: "funding-history", label: "Funding History" },
  { value: "order-history", label: "Order History" },
];

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-[#848e9c] text-sm">
      {message}
    </div>
  );
}

function BalancesTable() {
  const balances = [
    { coin: "USDC (Prediction)", total: 0, available: 0, usdValue: 0, entryPrice: "-", pnl: "-" },
  ];

  return (
    <div className="h-full overflow-auto">
      {/* Header Row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1d26] text-xs text-[#848e9c] sticky top-0 bg-[#0b0e11]">
        <div className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1d26]" />
          <span>Hide Small Balances</span>
        </div>
        <input
          type="text"
          placeholder="Coins..."
          className="ml-auto px-2 py-1 bg-[#1a1d26] rounded text-white text-xs outline-none w-32"
        />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-8 gap-4 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26]">
        <div>Coin</div>
        <div className="text-right">Total Balance</div>
        <div className="text-right">Available Balance</div>
        <div className="text-right">USD Value</div>
        <div className="text-right">Entry Price</div>
        <div className="text-right">PNL (ROE %)</div>
        <div className="text-right">Send</div>
        <div className="text-right">Transfer</div>
      </div>

      {/* Table Body */}
      {balances.map((balance) => (
        <div
          key={balance.coin}
          className="grid grid-cols-8 gap-4 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
        >
          <div className="text-white">{balance.coin}</div>
          <div className="text-right text-white font-mono">{balance.total.toFixed(2)}</div>
          <div className="text-right text-white font-mono">{balance.available.toFixed(2)}</div>
          <div className="text-right text-white font-mono">{balance.usdValue.toFixed(2)} USD</div>
          <div className="text-right text-[#848e9c]">{balance.entryPrice}</div>
          <div className="text-right text-[#848e9c]">{balance.pnl}</div>
          <div className="text-right text-[#848e9c]">-</div>
          <div className="text-right">
            <button className="text-[#2962ff] hover:underline">Transfer</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AccountPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("balances");

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabType)}
      className="flex flex-col h-full bg-[#0b0e11]"
    >
      {/* Tab List */}
      <Tabs.List className="flex items-center gap-1 px-4 border-b border-[#1a1d26] overflow-x-auto">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              "data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#2962ff]",
              "data-[state=inactive]:text-[#848e9c] data-[state=inactive]:hover:text-white"
            )}
          >
            {tab.label}
            {tab.count !== undefined && `(${tab.count})`}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs.Content value="balances" className="h-full">
          <BalancesTable />
        </Tabs.Content>

        <Tabs.Content value="positions" className="h-full">
          <EmptyState message="No open positions" />
        </Tabs.Content>

        <Tabs.Content value="orders" className="h-full">
          <EmptyState message="No open orders" />
        </Tabs.Content>

        <Tabs.Content value="twap" className="h-full">
          <EmptyState message="No TWAP orders" />
        </Tabs.Content>

        <Tabs.Content value="trailing" className="h-full">
          <EmptyState message="No trailing orders" />
        </Tabs.Content>

        <Tabs.Content value="trade-history" className="h-full">
          <EmptyState message="No trade history" />
        </Tabs.Content>

        <Tabs.Content value="funding-history" className="h-full">
          <EmptyState message="No funding history" />
        </Tabs.Content>

        <Tabs.Content value="order-history" className="h-full">
          <EmptyState message="No order history" />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
