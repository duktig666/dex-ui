"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAssetList, useAssetPrice } from "@/hooks/useMarketData";
import { useHyperliquid } from "@/components/providers/HyperliquidProvider";
import { formatPrice, formatCompact, formatPercent } from "@/lib/hyperliquid/utils";

// 分类定义
const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "perps", label: "Perps" },
  { id: "defi", label: "DeFi" },
  { id: "l1", label: "Layer 1" },
  { id: "l2", label: "Layer 2" },
  { id: "meme", label: "Memes" },
  { id: "ai", label: "AI" },
  { id: "gaming", label: "Gaming" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

// Token 分类映射 - 可根据实际需求调整
const TOKEN_CATEGORIES: Record<string, CategoryId[]> = {
  // Layer 1
  BTC: ["perps", "l1"],
  ETH: ["perps", "l1", "defi"],
  SOL: ["perps", "l1"],
  AVAX: ["perps", "l1"],
  ATOM: ["perps", "l1"],
  DOT: ["perps", "l1"],
  SUI: ["perps", "l1"],
  APT: ["perps", "l1"],
  SEI: ["perps", "l1"],
  INJ: ["perps", "l1", "defi"],
  TIA: ["perps", "l1"],
  
  // Layer 2
  ARB: ["perps", "l2"],
  OP: ["perps", "l2"],
  MATIC: ["perps", "l2"],
  
  // DeFi
  AAVE: ["perps", "defi"],
  UNI: ["perps", "defi"],
  CRV: ["perps", "defi"],
  MKR: ["perps", "defi"],
  LDO: ["perps", "defi"],
  PENDLE: ["perps", "defi"],
  JUP: ["perps", "defi"],
  
  // Meme
  DOGE: ["perps", "meme"],
  SHIB: ["perps", "meme"],
  PEPE: ["perps", "meme"],
  WIF: ["perps", "meme"],
  BONK: ["perps", "meme"],
  FLOKI: ["perps", "meme"],
  MEME: ["perps", "meme"],
  NEIRO: ["perps", "meme"],
  POPCAT: ["perps", "meme"],
  MOG: ["perps", "meme"],
  
  // AI
  FET: ["perps", "ai"],
  RENDER: ["perps", "ai"],
  TAO: ["perps", "ai"],
  RNDR: ["perps", "ai"],
  
  // Gaming
  IMX: ["perps", "gaming"],
  AXS: ["perps", "gaming"],
  GALA: ["perps", "gaming"],
  
  // HyperLiquid native
  HYPE: ["perps"],
  PURR: ["perps"],
};

// 获取 Token 的分类
function getTokenCategories(name: string): CategoryId[] {
  return TOKEN_CATEGORIES[name] || ["perps"];
}

interface TokenRowProps {
  asset: {
    name: string;
    price: number;
    priceChange: number;
    funding?: number;
    volume: number;
    openInterest?: number;
    maxLeverage: number;
  };
  isActive: boolean;
  onClick: () => void;
}

function TokenRow({ asset, isActive, onClick }: TokenRowProps) {
  const isPositive = asset.priceChange >= 0;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center text-xs h-9 px-3 transition-colors",
        "hover:bg-[#1a1d26]",
        isActive ? "bg-[#1a1d26]" : ""
      )}
    >
      {/* Symbol */}
      <div className="w-[140px] flex items-center gap-2">
        <span className="text-white font-medium">{asset.name}-USDC</span>
        <span className="px-1 py-0.5 text-[10px] bg-[#2962ff]/20 text-[#2962ff] rounded">
          {asset.maxLeverage}X
        </span>
      </div>
      
      {/* Last Price */}
      <div className="w-[100px] text-right">
        <span className="text-white font-mono">
          {formatPrice(asset.price, asset.price >= 1000 ? 1 : asset.price >= 100 ? 2 : asset.price >= 10 ? 3 : 4)}
        </span>
      </div>
      
      {/* 24H Change */}
      <div className="w-[80px] text-right">
        <span className={cn("font-mono", isPositive ? "text-[#0ecb81]" : "text-[#f6465d]")}>
          {isPositive ? "+" : ""}{(asset.priceChange * 100).toFixed(2)}%
        </span>
      </div>
      
      {/* Funding Rate */}
      <div className="w-[80px] text-right">
        <span className={cn(
          "font-mono",
          (asset.funding || 0) >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
        )}>
          {((asset.funding || 0) * 100).toFixed(4)}%
        </span>
      </div>
      
      {/* Volume */}
      <div className="w-[100px] text-right">
        <span className="text-[#848e9c] font-mono">${formatCompact(asset.volume)}</span>
      </div>
      
      {/* Open Interest */}
      <div className="w-[100px] text-right">
        <span className="text-[#848e9c] font-mono">${formatCompact(asset.openInterest || 0)}</span>
      </div>
    </button>
  );
}

export function TokenSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { currentCoin, setCoin } = useHyperliquid();
  const assets = useAssetList();
  const { midPrice, priceChangePercent, fundingPercent } = useAssetPrice(currentCoin);

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // 聚焦搜索框
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // 键盘导航 - 按 Escape 关闭
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // 增强资产数据
  const enhancedAssets = useMemo(() => {
    return assets.map(asset => {
      // 从 marketStore 获取完整数据 - 这里我们通过 useAssetList 已经获取了基础数据
      // 对于 funding 和 openInterest，我们需要从 store 中获取
      return {
        ...asset,
        categories: getTokenCategories(asset.name),
      };
    });
  }, [assets]);

  // 过滤和搜索
  const filteredAssets = useMemo(() => {
    let result = enhancedAssets;
    
    // 分类过滤
    if (activeCategory !== "all") {
      result = result.filter(asset => asset.categories.includes(activeCategory));
    }
    
    // 搜索过滤
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(searchLower)
      );
    }
    
    // 按交易量排序
    return result.sort((a, b) => b.volume - a.volume);
  }, [enhancedAssets, activeCategory, search]);

  // 选择代币
  const handleSelect = (coin: string) => {
    setCoin(coin);
    setIsOpen(false);
    setSearch("");
  };

  const priceDecimals = midPrice >= 1000 ? 1 : midPrice >= 100 ? 2 : midPrice >= 10 ? 3 : 4;
  const isPositive = priceChangePercent >= 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer transition-colors",
          "bg-[#1a1d26] hover:bg-[#252833]",
          isOpen ? "bg-[#252833]" : ""
        )}
      >
        <span className="text-white font-medium">{currentCoin}-USD</span>
        <span className="text-[#848e9c]">{currentCoin}-USDC</span>
        <svg 
          className={cn("w-4 h-4 text-[#848e9c] transition-transform", isOpen ? "rotate-180" : "")} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[620px] bg-[#0d1017] border border-[#1a1d26] rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-[#1a1d26]">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#848e9c]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1a1d26] border border-[#2a2e3e] rounded text-white text-sm placeholder-[#848e9c] focus:outline-none focus:border-[#2962ff]"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[#1a1d26] overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-3 py-1 text-xs rounded whitespace-nowrap transition-colors",
                  activeCategory === category.id
                    ? "bg-[#2962ff] text-white"
                    : "text-[#848e9c] hover:text-white hover:bg-[#1a1d26]"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Table Header */}
          <div className="flex items-center text-xs text-[#848e9c] h-8 px-3 border-b border-[#1a1d26] bg-[#0a0d12]">
            <div className="w-[140px]">Symbol</div>
            <div className="w-[100px] text-right">Last Price</div>
            <div className="w-[80px] text-right">24H %</div>
            <div className="w-[80px] text-right">8H Funding</div>
            <div className="w-[100px] text-right">Volume</div>
            <div className="w-[100px] text-right">Open Interest</div>
          </div>

          {/* Token List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredAssets.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-[#848e9c] text-sm">
                No markets found
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <TokenRow
                  key={asset.name}
                  asset={asset}
                  isActive={asset.name === currentCoin}
                  onClick={() => handleSelect(asset.name)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
