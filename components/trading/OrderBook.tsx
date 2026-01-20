"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  generateMockOrderBook,
  generateMockTrades,
  type OrderBookEntry,
  type Trade,
} from "@/lib/tradingview/mockData";

interface OrderBookProps {
  symbol: string;
}

type TabType = "orderbook" | "trades";

function OrderBookRow({
  entry,
  side,
  maxTotal,
}: {
  entry: OrderBookEntry;
  side: "bid" | "ask";
  maxTotal: number;
}) {
  const percentage = (entry.total / maxTotal) * 100;
  const bgColor = side === "bid" ? "rgba(14, 203, 129, 0.15)" : "rgba(246, 70, 93, 0.15)";

  return (
    <div className="relative flex items-center text-xs h-6 px-2 hover:bg-[#1a1d26]/50 cursor-pointer">
      {/* Background bar */}
      <div
        className="absolute inset-0"
        style={{
          background: bgColor,
          width: `${percentage}%`,
          right: side === "ask" ? 0 : "auto",
          left: side === "bid" ? "auto" : 0,
        }}
      />
      
      {/* Content */}
      <div className="relative flex items-center justify-between w-full">
        <span className={cn("font-mono w-20", side === "bid" ? "text-[#0ecb81]" : "text-[#f6465d]")}>
          {entry.price.toLocaleString()}
        </span>
        <span className="font-mono text-[#eaecef] w-24 text-right">{entry.amount.toFixed(5)}</span>
        <span className="font-mono text-[#848e9c] w-24 text-right">{entry.total.toFixed(5)}</span>
      </div>
    </div>
  );
}

function TradeRow({ trade }: { trade: Trade }) {
  return (
    <div className="flex items-center text-xs h-6 px-2 hover:bg-[#1a1d26]/50">
      <span className={cn("font-mono w-20", trade.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]")}>
        {trade.price.toLocaleString()}
      </span>
      <span className="font-mono text-[#eaecef] w-24 text-right">{trade.amount.toFixed(5)}</span>
      <span className="font-mono text-[#848e9c] w-24 text-right">
        {new Date(trade.time).toLocaleTimeString()}
      </span>
    </div>
  );
}

export function OrderBook({ symbol }: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orderbook");
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({
    bids: [],
    asks: [],
  });
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setOrderBook(generateMockOrderBook(symbol, 20));
    setTrades(generateMockTrades(symbol, 50));
  }, [symbol]);

  const maxTotal = useMemo(() => {
    const maxBid = orderBook.bids[orderBook.bids.length - 1]?.total || 0;
    const maxAsk = orderBook.asks[orderBook.asks.length - 1]?.total || 0;
    return Math.max(maxBid, maxAsk);
  }, [orderBook]);

  const spread = useMemo(() => {
    if (orderBook.asks.length > 0 && orderBook.bids.length > 0) {
      const spreadValue = orderBook.asks[0].price - orderBook.bids[0].price;
      const spreadPercent = (spreadValue / orderBook.asks[0].price) * 100;
      return { value: spreadValue, percent: spreadPercent };
    }
    return { value: 0, percent: 0 };
  }, [orderBook]);

  return (
    <div className="flex flex-col h-full bg-[#0b0e11]">
      {/* Tabs */}
      <div className="flex items-center border-b border-[#1a1d26]">
        <button
          onClick={() => setActiveTab("orderbook")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "orderbook"
              ? "text-white border-b-2 border-[#2962ff]"
              : "text-[#848e9c] hover:text-white"
          )}
        >
          Order Book
        </button>
        <button
          onClick={() => setActiveTab("trades")}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "trades"
              ? "text-white border-b-2 border-[#2962ff]"
              : "text-[#848e9c] hover:text-white"
          )}
        >
          Trades
        </button>
      </div>

      {activeTab === "orderbook" ? (
        <>
          {/* Header */}
          <div className="flex items-center text-xs text-[#848e9c] px-2 py-1 border-b border-[#1a1d26]">
            <span className="w-20">Price</span>
            <span className="w-24 text-right">Amount ({symbol.split("-")[0]})</span>
            <span className="w-24 text-right">Total ({symbol.split("-")[0]})</span>
          </div>

          {/* Asks (reversed so lowest ask is at bottom) */}
          <div className="flex-1 overflow-y-auto flex flex-col-reverse">
            {orderBook.asks.slice().reverse().map((ask, i) => (
              <OrderBookRow key={`ask-${i}`} entry={ask} side="ask" maxTotal={maxTotal} />
            ))}
          </div>

          {/* Spread */}
          <div className="flex items-center justify-center gap-2 py-2 border-y border-[#1a1d26] bg-[#0b0e11]">
            <span className="text-white font-mono text-sm">
              {orderBook.bids[0]?.price.toLocaleString() || "—"}
            </span>
            <span className="text-xs text-[#848e9c]">Spread</span>
            <span className="text-[#848e9c] font-mono text-xs">
              {spread.value.toFixed(0)} ({spread.percent.toFixed(2)}%)
            </span>
          </div>

          {/* Bids */}
          <div className="flex-1 overflow-y-auto">
            {orderBook.bids.map((bid, i) => (
              <OrderBookRow key={`bid-${i}`} entry={bid} side="bid" maxTotal={maxTotal} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Trades Header */}
          <div className="flex items-center text-xs text-[#848e9c] px-2 py-1 border-b border-[#1a1d26]">
            <span className="w-20">Price</span>
            <span className="w-24 text-right">Amount</span>
            <span className="w-24 text-right">Time</span>
          </div>

          {/* Trades List */}
          <div className="flex-1 overflow-y-auto">
            {trades.map((trade) => (
              <TradeRow key={trade.id} trade={trade} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
