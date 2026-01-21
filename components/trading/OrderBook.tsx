"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useOrderBook, type OrderBookLevel } from "@/hooks/useOrderBook";
import { useRecentTrades, type FormattedTrade } from "@/hooks/useRecentTrades";
import { formatPrice, formatSize } from "@/lib/hyperliquid/utils";

interface OrderBookProps {
  symbol: string;
}

type TabType = "orderbook" | "trades";

function OrderBookRow({
  level,
  side,
  priceDecimals,
  sizeDecimals,
}: {
  level: OrderBookLevel;
  side: "bid" | "ask";
  priceDecimals: number;
  sizeDecimals: number;
}) {
  const bgColor = side === "bid" ? "rgba(14, 203, 129, 0.15)" : "rgba(246, 70, 93, 0.15)";

  return (
    <div className="relative flex items-center text-xs h-6 px-2 hover:bg-[#1a1d26]/50 cursor-pointer">
      {/* Background bar */}
      <div
        className="absolute inset-0"
        style={{
          background: bgColor,
          width: `${Math.min(level.percent, 100)}%`,
          right: side === "ask" ? 0 : "auto",
          left: side === "bid" ? "auto" : 0,
        }}
      />
      
      {/* Content */}
      <div className="relative flex items-center justify-between w-full">
        <span className={cn("font-mono w-20", side === "bid" ? "text-[#0ecb81]" : "text-[#f6465d]")}>
          {formatPrice(level.price, priceDecimals)}
        </span>
        <span className="font-mono text-[#eaecef] w-24 text-right">
          {formatSize(level.size, sizeDecimals)}
        </span>
        <span className="font-mono text-[#848e9c] w-24 text-right">
          {formatSize(level.total, sizeDecimals)}
        </span>
      </div>
    </div>
  );
}

function TradeRow({ 
  trade,
  priceDecimals,
  sizeDecimals,
}: { 
  trade: FormattedTrade;
  priceDecimals: number;
  sizeDecimals: number;
}) {
  return (
    <div className="flex items-center text-xs h-6 px-2 hover:bg-[#1a1d26]/50">
      <span className={cn("font-mono w-20", trade.side === "buy" ? "text-[#0ecb81]" : "text-[#f6465d]")}>
        {formatPrice(trade.price, priceDecimals)}
      </span>
      <span className="font-mono text-[#eaecef] w-24 text-right">
        {formatSize(trade.size, sizeDecimals)}
      </span>
      <span className="font-mono text-[#848e9c] w-24 text-right">
        {trade.timeStr}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-6 bg-[#1a1d26] rounded animate-pulse" />
      ))}
    </div>
  );
}

export function OrderBook({ symbol }: OrderBookProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orderbook");
  
  // 从 symbol 提取 coin (如 "BTC-USDC" -> "BTC")
  const coin = symbol.split("-")[0] || symbol;
  
  // 使用真实数据 hooks
  const { data: orderBookData, isLoading: orderBookLoading } = useOrderBook(coin, 15);
  const { trades, isLoading: tradesLoading } = useRecentTrades(coin, 50);

  // 根据价格动态计算精度
  const priceDecimals = useMemo(() => {
    if (!orderBookData?.midPrice) return 2;
    const price = orderBookData.midPrice;
    if (price >= 10000) return 1;
    if (price >= 1000) return 2;
    if (price >= 100) return 3;
    if (price >= 10) return 4;
    return 5;
  }, [orderBookData?.midPrice]);

  const sizeDecimals = 4;

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
            <span className="w-24 text-right">Amount ({coin})</span>
            <span className="w-24 text-right">Total ({coin})</span>
          </div>

          {orderBookLoading || !orderBookData ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Asks (reversed so lowest ask is at bottom) */}
              <div className="flex-1 overflow-y-auto flex flex-col-reverse">
                {orderBookData.asks.map((ask, i) => (
                  <OrderBookRow 
                    key={`ask-${i}`} 
                    level={ask} 
                    side="ask" 
                    priceDecimals={priceDecimals}
                    sizeDecimals={sizeDecimals}
                  />
                ))}
              </div>

              {/* Spread */}
              <div className="flex items-center justify-center gap-2 py-2 border-y border-[#1a1d26] bg-[#0b0e11]">
                <span className="text-white font-mono text-sm">
                  {orderBookData.bids[0]
                    ? formatPrice(orderBookData.bids[0].price, priceDecimals)
                    : "—"}
                </span>
                <span className="text-xs text-[#848e9c]">Spread</span>
                <span className="text-[#848e9c] font-mono text-xs">
                  {formatPrice(orderBookData.spread, priceDecimals)} ({orderBookData.spreadPercent.toFixed(3)}%)
                </span>
              </div>

              {/* Bids */}
              <div className="flex-1 overflow-y-auto">
                {orderBookData.bids.map((bid, i) => (
                  <OrderBookRow 
                    key={`bid-${i}`} 
                    level={bid} 
                    side="bid" 
                    priceDecimals={priceDecimals}
                    sizeDecimals={sizeDecimals}
                  />
                ))}
              </div>
            </>
          )}
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
            {tradesLoading ? (
              <LoadingSkeleton />
            ) : (
              trades.map((trade) => (
                <TradeRow 
                  key={trade.id} 
                  trade={trade}
                  priceDecimals={priceDecimals}
                  sizeDecimals={sizeDecimals}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
