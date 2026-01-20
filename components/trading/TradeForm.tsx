"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TradeFormProps {
  symbol: string;
}

type OrderSide = "buy" | "sell";
type OrderType = "limit" | "market" | "stop-limit";
type MarginMode = "cross" | "isolated";
type TimeInForce = "gtc" | "ioc" | "fok";

export function TradeForm({ symbol }: TradeFormProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [marginMode, setMarginMode] = useState<MarginMode>("cross");
  const [leverage, setLeverage] = useState(40);
  const [price, setPrice] = useState("90935");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpsl, setTpsl] = useState(false);
  const [timeInForce, setTimeInForce] = useState<TimeInForce>("gtc");

  const [base, quote] = symbol.split("-");
  const availableFunds = 0;
  const currentPosition = 0;

  return (
    <div className="flex flex-col h-full p-4 bg-[#0b0e11]">
      {/* Margin Mode & Leverage */}
      <div className="flex items-center gap-2 mb-4">
        <button
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded transition-colors",
            marginMode === "cross"
              ? "bg-[#1a1d26] text-white"
              : "text-[#848e9c] hover:text-white"
          )}
          onClick={() => setMarginMode("cross")}
        >
          Cross
        </button>
        <button
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded transition-colors",
            marginMode === "isolated"
              ? "bg-[#1a1d26] text-white"
              : "text-[#848e9c] hover:text-white"
          )}
          onClick={() => setMarginMode("isolated")}
        >
          Isolated
        </button>
        <button className="px-3 py-1.5 text-sm font-medium bg-[#1a1d26] text-white rounded">
          {leverage}x
        </button>
      </div>

      {/* Order Type */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-[#848e9c]">Type</span>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as OrderType)}
          className="flex-1 px-3 py-1.5 text-sm bg-[#1a1d26] text-white rounded border-none outline-none cursor-pointer"
        >
          <option value="limit">Limit</option>
          <option value="market">Market</option>
          <option value="stop-limit">Stop Limit</option>
        </select>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide("buy")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold rounded transition-colors",
            side === "buy"
              ? "bg-[#0ecb81] text-white"
              : "bg-[#1a1d26] text-[#848e9c] hover:text-white"
          )}
        >
          Buy / Long
        </button>
        <button
          onClick={() => setSide("sell")}
          className={cn(
            "flex-1 py-2 text-sm font-semibold rounded transition-colors",
            side === "sell"
              ? "bg-[#f6465d] text-white"
              : "bg-[#1a1d26] text-[#848e9c] hover:text-white"
          )}
        >
          Sell / Short
        </button>
      </div>

      {/* Available Funds */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-[#848e9c]">Available Funds</span>
        <span className="text-white font-mono">
          {availableFunds.toFixed(2)} <span className="text-[#848e9c]">{quote}</span>
        </span>
      </div>

      {/* Current Position */}
      <div className="flex items-center justify-between text-xs mb-4">
        <span className="text-[#848e9c]">Current Position</span>
        <span className="text-white font-mono">
          {currentPosition.toFixed(5)} <span className="text-[#848e9c]">{base}</span>
        </span>
      </div>

      {/* Price Input */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#848e9c]">Price</span>
          <div className="flex items-center gap-1">
            <button className="text-[#848e9c] hover:text-white text-xs">Bid</button>
            <span className="text-[#848e9c]">|</span>
            <button className="text-[#848e9c] hover:text-white text-xs">Ask</button>
          </div>
        </div>
        <div className="flex items-center bg-[#1a1d26] rounded overflow-hidden">
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            placeholder="0"
          />
          <span className="px-3 text-sm text-[#848e9c]">{quote}</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-3">
        <div className="flex items-center bg-[#1a1d26] rounded overflow-hidden">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            placeholder="0"
          />
          <span className="px-3 text-sm text-[#848e9c]">{base}</span>
        </div>
      </div>

      {/* Total Input */}
      <div className="mb-3">
        <div className="flex items-center bg-[#1a1d26] rounded overflow-hidden">
          <input
            type="text"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            placeholder="0"
          />
          <span className="px-3 text-sm text-[#848e9c]">{quote}</span>
        </div>
      </div>

      {/* Percentage Slider */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full h-1 bg-[#1a1d26] rounded appearance-none cursor-pointer"
          disabled
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-12 px-2 py-1 text-xs bg-[#1a1d26] text-white rounded outline-none font-mono"
            disabled
          />
          <span className="text-xs text-[#848e9c]">%</span>
          <div className="flex gap-1 ml-auto">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                className="px-2 py-1 text-xs text-[#848e9c] bg-[#1a1d26] rounded hover:text-white disabled:opacity-50"
                disabled
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-[#1a1d26] border-none"
            />
            <span className="text-xs text-[#848e9c]">Reduce</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tpsl}
              onChange={(e) => setTpsl(e.target.checked)}
              className="w-4 h-4 rounded bg-[#1a1d26] border-none"
            />
            <span className="text-xs text-[#848e9c]">TP/SL</span>
          </label>
        </div>
        <select
          value={timeInForce}
          onChange={(e) => setTimeInForce(e.target.value as TimeInForce)}
          className="px-2 py-1 text-xs bg-[#1a1d26] text-white rounded border-none outline-none cursor-pointer"
        >
          <option value="gtc">GTC</option>
          <option value="ioc">IOC</option>
          <option value="fok">FOK</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        className={cn(
          "w-full py-3 text-sm font-semibold rounded transition-colors",
          side === "buy"
            ? "bg-[#0ecb81] hover:bg-[#0ecb81]/90 text-white"
            : "bg-[#f6465d] hover:bg-[#f6465d]/90 text-white"
        )}
      >
        Connect Wallet
      </button>

      {/* Order Info */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#848e9c]">Est Liq:</span>
          <span className="text-white font-mono">$0</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#848e9c]">Order Val:</span>
          <span className="text-white font-mono">$0.00</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#848e9c]">Margin Req:</span>
          <span className="text-white font-mono">$0.00</span>
        </div>
      </div>
    </div>
  );
}
