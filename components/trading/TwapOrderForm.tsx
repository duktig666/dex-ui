"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import { cn } from "@/lib/utils";
import { useAccountState } from "@/hooks/useAccountState";
import { useAssetPrice, useAssetList } from "@/hooks/useMarketData";
import { formatPrice, formatSize, calcNotionalValue, calcRequiredMargin } from "@/lib/hyperliquid/utils";
import { exchangeClient } from "@/lib/hyperliquid/client";
import { useCanSign } from "@/hooks/useNetworkCheck";

interface TwapOrderFormProps {
  symbol: string;
}

type OrderSide = "buy" | "sell";

// 预设时长选项（分钟）
const DURATION_PRESETS = [
  { label: "30m", minutes: 30 },
  { label: "1h", minutes: 60 },
  { label: "4h", minutes: 240 },
  { label: "12h", minutes: 720 },
  { label: "24h", minutes: 1440 },
];

export function TwapOrderForm({ symbol }: TwapOrderFormProps) {
  const { isConnected, address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const assetList = useAssetList();
  const canSign = useCanSign();

  const [side, setSide] = useState<OrderSide>("buy");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState(60); // 默认 1 小时
  const [randomize, setRandomize] = useState(true);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const coin = symbol.split("-")[0] || "BTC";
  const quote = "USDC";

  // Hooks
  const { availableBalance } = useAccountState();
  const { midPrice } = useAssetPrice(coin);

  // 获取资产信息
  const assetInfo = useMemo(() => {
    return assetList.find((a) => a.name === coin);
  }, [assetList, coin]);

  const assetId = assetInfo?.assetId ?? 0;

  // 计算订单价值
  const orderValue = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    return calcNotionalValue(midPrice, amountNum);
  }, [amount, midPrice]);

  // 估算每次子订单大小（TWAP 会拆分成多个小订单）
  const estimatedSplits = useMemo(() => {
    // TWAP 通常每 3 分钟执行一次
    return Math.floor(duration / 3);
  }, [duration]);

  const orderPerSplit = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    if (estimatedSplits <= 0) return 0;
    return amountNum / estimatedSplits;
  }, [amount, estimatedSplits]);

  // 提交 TWAP 订单
  const handleSubmit = async () => {
    if (!isConnected || !address || !canSign) return;

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      setLastError("Please enter a valid amount");
      return;
    }

    if (!assetInfo) {
      setLastError("Asset not found");
      return;
    }

    setIsSubmitting(true);
    setLastError(null);

    try {
      const result = await exchangeClient.placeTwapOrder(
        {
          assetId,
          isBuy: side === "buy",
          sz: amount,
          reduceOnly,
          minutes: duration,
          randomize,
        },
        async (params) => {
          const signature = await signTypedDataAsync({
            domain: params.domain as {
              name: string;
              version: string;
              chainId: number;
              verifyingContract: `0x${string}`;
            },
            types: params.types as Record<string, { name: string; type: string }[]>,
            primaryType: params.primaryType,
            message: params.message,
          });
          return signature;
        }
      );

      if (result.status === "ok") {
        // 清空表单
        setAmount("");
        setLastError(null);
      } else {
        setLastError(result.response?.data?.status?.error || "TWAP order failed");
      }
    } catch (error) {
      console.error("TWAP order error:", error);
      setLastError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 按钮文本
  const buttonText = useMemo(() => {
    if (!isConnected) return "Connect Wallet";
    if (!canSign) return "Switch Network";
    if (isSubmitting) return "Submitting...";
    return side === "buy" ? "Buy TWAP" : "Sell TWAP";
  }, [isConnected, canSign, isSubmitting, side]);

  return (
    <div className="flex flex-col h-full p-4 bg-[#0b0e11]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">TWAP Order</h3>
        <span className="text-xs text-[#848e9c]">Time-Weighted Average Price</span>
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
      <div className="flex items-center justify-between text-xs mb-4">
        <span className="text-[#848e9c]">Available Funds</span>
        <span className="text-white font-mono">
          {formatPrice(availableBalance, 2)} <span className="text-[#848e9c]">{quote}</span>
        </span>
      </div>

      {/* Total Size Input */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#848e9c]">Total Size</span>
          <span className="text-[#848e9c]">
            ≈ ${formatPrice(orderValue, 2)}
          </span>
        </div>
        <div className="flex items-center bg-[#1a1d26] rounded overflow-hidden">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            placeholder="0"
          />
          <span className="px-3 text-sm text-[#848e9c]">{coin}</span>
        </div>
      </div>

      {/* Duration Presets */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-[#848e9c]">Duration</span>
          <span className="text-white">{duration >= 60 ? `${duration / 60}h` : `${duration}m`}</span>
        </div>
        <div className="flex gap-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              onClick={() => setDuration(preset.minutes)}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded transition-colors",
                duration === preset.minutes
                  ? "bg-[#f0b90b] text-black"
                  : "bg-[#1a1d26] text-[#848e9c] hover:text-white"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Duration Input */}
      <div className="mb-3">
        <div className="flex items-center bg-[#1a1d26] rounded overflow-hidden">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            min="1"
            max="10080"
          />
          <span className="px-3 text-sm text-[#848e9c]">minutes</span>
        </div>
      </div>

      {/* Options */}
      <div className="mb-4 space-y-2">
        {/* Randomize */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={randomize}
            onChange={(e) => setRandomize(e.target.checked)}
            className="w-4 h-4 accent-[#f0b90b]"
          />
          <span className="text-xs text-[#848e9c]">Randomize intervals</span>
        </label>

        {/* Reduce Only */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={reduceOnly}
            onChange={(e) => setReduceOnly(e.target.checked)}
            className="w-4 h-4 accent-[#f0b90b]"
          />
          <span className="text-xs text-[#848e9c]">Reduce Only</span>
        </label>
      </div>

      {/* Order Info */}
      <div className="mb-4 p-3 bg-[#1a1d26] rounded text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Estimated Splits</span>
          <span className="text-white">{estimatedSplits} orders</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Size per Split</span>
          <span className="text-white">
            ≈ {formatSize(orderPerSplit, 5)} {coin}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#848e9c]">Interval</span>
          <span className="text-white">
            ≈ {randomize ? "2-4" : "3"} minutes
          </span>
        </div>
      </div>

      {/* Error Message */}
      {lastError && (
        <div className="mb-3 text-xs text-[#f6465d]">{lastError}</div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isConnected || !canSign || isSubmitting || !amount}
        className={cn(
          "w-full py-3 text-sm font-semibold rounded transition-colors",
          side === "buy"
            ? "bg-[#0ecb81] hover:bg-[#0ecb81]/80 text-white"
            : "bg-[#f6465d] hover:bg-[#f6465d]/80 text-white",
          (!isConnected || !canSign || isSubmitting || !amount) && "opacity-50 cursor-not-allowed"
        )}
      >
        {buttonText}
      </button>

      {/* TWAP Info */}
      <div className="mt-4 text-xs text-[#848e9c]">
        <p className="mb-1">• TWAP executes orders over time at market price</p>
        <p className="mb-1">• Orders are split into smaller pieces</p>
        <p>• Minimizes market impact for large orders</p>
      </div>
    </div>
  );
}
