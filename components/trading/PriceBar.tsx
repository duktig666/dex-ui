"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getMarketData, type MarketData } from "@/lib/tradingview/mockData";

interface PriceTickerProps {
  symbol: string;
  price: number;
  change: number;
  active?: boolean;
  onClick?: () => void;
}

function PriceTicker({ symbol, price, change, active, onClick }: PriceTickerProps) {
  const [base, quote] = symbol.split("-");
  const isPositive = change >= 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1 rounded transition-colors",
        active ? "bg-[#1a1d26]" : "hover:bg-[#1a1d26]/50"
      )}
    >
      <span className={cn("text-xs font-medium", isPositive ? "text-[#0ecb81]" : "text-[#f6465d]")}>
        {isPositive ? "+" : ""}{change.toFixed(2)}%
      </span>
      <span className="text-white font-medium text-sm">{base}</span>
      <span className="text-[#848e9c] text-sm">-{quote}</span>
      <span className="text-white font-mono text-sm">{price.toLocaleString()}</span>
    </button>
  );
}

export function PriceBar() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC-USDC");
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  useEffect(() => {
    setMarketData(getMarketData(selectedSymbol));
  }, [selectedSymbol]);

  const tickers = [
    { symbol: "BTC-USDC", price: 90941.0, change: -2.44 },
    { symbol: "ETH-USDC", price: 3096.60, change: 0.00 },
    { symbol: "HYPE-USDC", price: 23.12, change: 0.00 },
  ];

  if (!marketData) return null;

  return (
    <div className="h-10 flex items-center justify-between px-4 bg-[#0b0e11] border-b border-[#1a1d26]">
      {/* Left: Price Tickers */}
      <div className="flex items-center gap-1">
        {tickers.map((ticker) => (
          <PriceTicker
            key={ticker.symbol}
            symbol={ticker.symbol}
            price={ticker.price}
            change={ticker.change}
            active={ticker.symbol === selectedSymbol}
            onClick={() => setSelectedSymbol(ticker.symbol)}
          />
        ))}
      </div>

      {/* Right: Symbol Info */}
      <div className="flex items-center gap-6 text-xs">
        {/* Symbol Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1d26] rounded cursor-pointer">
          <span className="text-white font-medium">BTC-USD</span>
          <span className="text-[#848e9c]">BTC-USDC</span>
          <svg className="w-4 h-4 text-[#848e9c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Mark Price */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Mark</span>
          <span className="text-white font-mono">{marketData.markPrice.toLocaleString()}</span>
        </div>

        {/* Oracle Price */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Oracle</span>
          <span className="text-white font-mono">{marketData.oraclePrice.toLocaleString()}</span>
        </div>

        {/* 24h Change */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">24h Change</span>
          <span className={cn(
            "font-mono",
            marketData.changePercent24h >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
          )}>
            {marketData.change24h.toLocaleString()} / {marketData.changePercent24h}%
          </span>
        </div>

        {/* 24h Volume */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">24h Vol</span>
          <span className="text-white font-mono">${(marketData.volume24h / 1e9).toFixed(2)}B</span>
        </div>

        {/* Open Interest */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Open Interest</span>
          <span className="text-white font-mono">${(marketData.openInterest / 1e9).toFixed(2)}B</span>
        </div>

        {/* Funding */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Funding / Countdown</span>
          <span className={cn(
            "font-mono",
            marketData.fundingRate >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
          )}>
            {(marketData.fundingRate * 100).toFixed(4)}% / {marketData.fundingCountdown}
          </span>
        </div>
      </div>
    </div>
  );
}
