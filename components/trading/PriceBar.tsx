"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAssetPrice, useAssetList } from "@/hooks/useMarketData";
import { formatPrice, formatCompact, formatPercent } from "@/lib/hyperliquid/utils";

interface PriceTickerProps {
  coin: string;
  price: number;
  change: number;
  active?: boolean;
  onClick?: () => void;
}

function PriceTicker({ coin, price, change, active, onClick }: PriceTickerProps) {
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
      <span className="text-white font-medium text-sm">{coin}</span>
      <span className="text-[#848e9c] text-sm">-USDC</span>
      <span className="text-white font-mono text-sm">{formatPrice(price, price >= 1000 ? 1 : 2)}</span>
    </button>
  );
}

// 倒计时 Hook
function useFundingCountdown() {
  const [countdown, setCountdown] = useState("00:00:00");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const hours = now.getUTCHours();
      // 资金费率每8小时结算一次 (0:00, 8:00, 16:00 UTC)
      const nextSettlement = Math.ceil((hours + 1) / 8) * 8;
      const hoursLeft = nextSettlement - hours - 1;
      const minutesLeft = 59 - now.getUTCMinutes();
      const secondsLeft = 59 - now.getUTCSeconds();
      
      setCountdown(
        `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return countdown;
}

interface PriceBarProps {
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
}

export function PriceBar({ symbol = "BTC-USDC", onSymbolChange }: PriceBarProps) {
  const coin = symbol.split("-")[0] || "BTC";
  
  // 获取当前交易对数据
  const {
    midPrice,
    markPrice,
    oraclePrice,
    priceChangePercent,
    fundingPercent,
    openInterest,
    dayVolume,
  } = useAssetPrice(coin);

  // 获取热门交易对列表
  const assets = useAssetList();
  const topAssets = useMemo(() => {
    // 取交易量最大的几个
    return assets
      .filter(a => ['BTC', 'ETH', 'HYPE', 'SOL', 'DOGE'].includes(a.name))
      .slice(0, 5);
  }, [assets]);

  const fundingCountdown = useFundingCountdown();

  // 计算24h变化金额
  const change24h = midPrice * (priceChangePercent / 100);

  // 价格精度
  const priceDecimals = midPrice >= 1000 ? 1 : midPrice >= 100 ? 2 : midPrice >= 10 ? 3 : 4;

  return (
    <div className="h-10 flex items-center justify-between px-4 bg-[#0b0e11] border-b border-[#1a1d26]">
      {/* Left: Price Tickers */}
      <div className="flex items-center gap-1">
        {topAssets.map((asset) => (
          <PriceTicker
            key={asset.name}
            coin={asset.name}
            price={asset.price}
            change={asset.priceChange * 100}
            active={asset.name === coin}
            onClick={() => onSymbolChange?.(`${asset.name}-USDC`)}
          />
        ))}
      </div>

      {/* Right: Symbol Info */}
      <div className="flex items-center gap-6 text-xs">
        {/* Symbol Selector */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1d26] rounded cursor-pointer">
          <span className="text-white font-medium">{coin}-USD</span>
          <span className="text-[#848e9c]">{coin}-USDC</span>
          <svg className="w-4 h-4 text-[#848e9c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Mark Price */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Mark</span>
          <span className="text-white font-mono">{formatPrice(markPrice, priceDecimals)}</span>
        </div>

        {/* Oracle Price */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Oracle</span>
          <span className="text-white font-mono">{formatPrice(oraclePrice, priceDecimals)}</span>
        </div>

        {/* 24h Change */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">24h Change</span>
          <span className={cn(
            "font-mono",
            priceChangePercent >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
          )}>
            {formatPrice(change24h, priceDecimals)} / {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* 24h Volume */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">24h Vol</span>
          <span className="text-white font-mono">${formatCompact(dayVolume)}</span>
        </div>

        {/* Open Interest */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Open Interest</span>
          <span className="text-white font-mono">${formatCompact(openInterest)}</span>
        </div>

        {/* Funding */}
        <div className="flex flex-col">
          <span className="text-[#848e9c]">Funding / Countdown</span>
          <span className={cn(
            "font-mono",
            fundingPercent >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
          )}>
            {fundingPercent >= 0 ? '+' : ''}{fundingPercent.toFixed(4)}% / {fundingCountdown}
          </span>
        </div>
      </div>
    </div>
  );
}
