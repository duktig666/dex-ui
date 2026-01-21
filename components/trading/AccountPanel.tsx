"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import { useAccountState } from "@/hooks/useAccountState";
import { useTrading } from "@/hooks/useTrading";
import { formatPrice, formatSize, formatPercent } from "@/lib/hyperliquid/utils";
import type { AssetPosition, Order, UserFill } from "@/lib/hyperliquid/types";

type TabType = "balances" | "positions" | "orders" | "twap" | "trailing" | "trade-history" | "funding-history" | "order-history";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-[#848e9c] text-sm">
      {message}
    </div>
  );
}

function BalancesTable() {
  const { clearinghouseState, availableBalance, accountValue } = useAccountState();

  const balances = useMemo(() => {
    if (!clearinghouseState) return [];
    
    const withdrawable = parseFloat(clearinghouseState.withdrawable || "0");
    return [
      { 
        coin: "USDC", 
        total: accountValue, 
        available: availableBalance, 
        usdValue: accountValue, 
        entryPrice: "-", 
        pnl: "-" 
      },
    ];
  }, [clearinghouseState, availableBalance, accountValue]);

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
          <div className="text-right text-white font-mono">{formatPrice(balance.total, 2)}</div>
          <div className="text-right text-white font-mono">{formatPrice(balance.available, 2)}</div>
          <div className="text-right text-white font-mono">{formatPrice(balance.usdValue, 2)} USD</div>
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

function PositionsTable() {
  const { positions } = useAccountState();
  const { closePosition } = useTrading();

  if (!positions || positions.length === 0) {
    return <EmptyState message="No open positions" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-10 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>Symbol</div>
        <div className="text-right">Size</div>
        <div className="text-right">Notional</div>
        <div className="text-right">Entry Price</div>
        <div className="text-right">Mark Price</div>
        <div className="text-right">Liq. Price</div>
        <div className="text-right">Margin</div>
        <div className="text-right">PNL</div>
        <div className="text-right">ROE</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Table Body */}
      {positions.map((pos) => {
        const isLong = pos.szi > 0;
        const pnl = pos.unrealizedPnl;
        const roe = pos.returnOnEquity * 100;

        return (
          <div
            key={pos.coin}
            className="grid grid-cols-10 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className={cn("font-medium", isLong ? "text-[#0ecb81]" : "text-[#f6465d]")}>
              {pos.coin}-PERP {isLong ? "Long" : "Short"}
            </div>
            <div className={cn("text-right font-mono", isLong ? "text-[#0ecb81]" : "text-[#f6465d]")}>
              {formatSize(pos.szi, 5)}
            </div>
            <div className="text-right text-white font-mono">${formatPrice(pos.positionValue, 2)}</div>
            <div className="text-right text-white font-mono">${formatPrice(pos.entryPx, 2)}</div>
            <div className="text-right text-white font-mono">${formatPrice(pos.markPx, 2)}</div>
            <div className="text-right text-[#f6465d] font-mono">
              {pos.liquidationPx ? `$${formatPrice(pos.liquidationPx, 2)}` : "-"}
            </div>
            <div className="text-right text-white font-mono">${formatPrice(pos.marginUsed, 2)}</div>
            <div className={cn("text-right font-mono", pnl >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]")}>
              {pnl >= 0 ? "+" : ""}${formatPrice(pnl, 2)}
            </div>
            <div className={cn("text-right font-mono", roe >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]")}>
              {roe >= 0 ? "+" : ""}{formatPrice(roe, 2)}%
            </div>
            <div className="text-right">
              <button 
                onClick={() => closePosition(pos.coin)}
                className="px-2 py-1 text-[#f6465d] bg-[#f6465d]/10 rounded hover:bg-[#f6465d]/20"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrdersTable() {
  const { openOrders } = useAccountState();
  const { cancelOrder, cancelAllOrders } = useTrading();

  if (!openOrders || openOrders.length === 0) {
    return <EmptyState message="No open orders" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Header Row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <button 
          onClick={() => cancelAllOrders()}
          className="px-2 py-1 text-xs text-[#f6465d] bg-[#f6465d]/10 rounded hover:bg-[#f6465d]/20"
        >
          Cancel All
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-9 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26]">
        <div>Symbol</div>
        <div className="text-right">Side</div>
        <div className="text-right">Type</div>
        <div className="text-right">Size</div>
        <div className="text-right">Filled</div>
        <div className="text-right">Price</div>
        <div className="text-right">Trigger</div>
        <div className="text-right">Time</div>
        <div className="text-right">Actions</div>
      </div>

      {/* Table Body */}
      {openOrders.map((order) => {
        const isBuy = order.side === "B";
        const filled = parseFloat(order.sz) - parseFloat(order.origSz);

        return (
          <div
            key={order.oid}
            className="grid grid-cols-9 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{order.coin}-PERP</div>
            <div className={cn("text-right font-medium", isBuy ? "text-[#0ecb81]" : "text-[#f6465d]")}>
              {isBuy ? "Buy" : "Sell"}
            </div>
            <div className="text-right text-white">{order.orderType}</div>
            <div className="text-right text-white font-mono">{formatSize(order.origSz, 5)}</div>
            <div className="text-right text-white font-mono">{formatSize(filled, 5)}</div>
            <div className="text-right text-white font-mono">${formatPrice(order.limitPx, 2)}</div>
            <div className="text-right text-[#848e9c]">
              {order.triggerPx ? `$${formatPrice(order.triggerPx, 2)}` : "-"}
            </div>
            <div className="text-right text-[#848e9c]">
              {new Date(order.timestamp).toLocaleTimeString()}
            </div>
            <div className="text-right">
              <button 
                onClick={() => cancelOrder({ coin: order.coin, oid: order.oid })}
                className="px-2 py-1 text-[#f6465d] bg-[#f6465d]/10 rounded hover:bg-[#f6465d]/20"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TradeHistoryTable() {
  const { userFills } = useAccountState();

  if (!userFills || userFills.length === 0) {
    return <EmptyState message="No trade history" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>Symbol</div>
        <div className="text-right">Side</div>
        <div className="text-right">Size</div>
        <div className="text-right">Price</div>
        <div className="text-right">Fee</div>
        <div className="text-right">Realized PNL</div>
        <div className="text-right">Time</div>
        <div className="text-right">Type</div>
      </div>

      {/* Table Body */}
      {userFills.slice(0, 50).map((fill, idx) => {
        const isBuy = fill.side === "B";

        return (
          <div
            key={`${fill.oid}-${idx}`}
            className="grid grid-cols-8 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{fill.coin}-PERP</div>
            <div className={cn("text-right font-medium", isBuy ? "text-[#0ecb81]" : "text-[#f6465d]")}>
              {isBuy ? "Buy" : "Sell"}
            </div>
            <div className="text-right text-white font-mono">{formatSize(fill.sz, 5)}</div>
            <div className="text-right text-white font-mono">${formatPrice(fill.px, 2)}</div>
            <div className="text-right text-[#848e9c] font-mono">${formatPrice(fill.fee, 4)}</div>
            <div className={cn(
              "text-right font-mono",
              parseFloat(fill.closedPnl) >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
            )}>
              {parseFloat(fill.closedPnl) !== 0 
                ? `${parseFloat(fill.closedPnl) >= 0 ? "+" : ""}$${formatPrice(fill.closedPnl, 2)}`
                : "-"
              }
            </div>
            <div className="text-right text-[#848e9c]">
              {new Date(fill.time).toLocaleString()}
            </div>
            <div className="text-right text-[#848e9c]">
              {fill.liquidation ? "Liquidation" : fill.crossed ? "Taker" : "Maker"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AccountPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("balances");
  const { positions, openOrders } = useAccountState();

  const tabs: { value: TabType; label: string; count?: number }[] = [
    { value: "balances", label: "Balances" },
    { value: "positions", label: "Positions", count: positions?.length || 0 },
    { value: "orders", label: "Open Orders", count: openOrders?.length || 0 },
    { value: "twap", label: "TWAP", count: 0 },
    { value: "trailing", label: "Trailing", count: 0 },
    { value: "trade-history", label: "Trade History" },
    { value: "funding-history", label: "Funding History" },
    { value: "order-history", label: "Order History" },
  ];

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
          <PositionsTable />
        </Tabs.Content>

        <Tabs.Content value="orders" className="h-full">
          <OrdersTable />
        </Tabs.Content>

        <Tabs.Content value="twap" className="h-full">
          <EmptyState message="No TWAP orders" />
        </Tabs.Content>

        <Tabs.Content value="trailing" className="h-full">
          <EmptyState message="No trailing orders" />
        </Tabs.Content>

        <Tabs.Content value="trade-history" className="h-full">
          <TradeHistoryTable />
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
