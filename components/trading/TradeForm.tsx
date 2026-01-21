"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { useTrading, type OrderSide as TradingOrderSide, type OrderType as TradingOrderType } from "@/hooks/useTrading";
import { useAccountState, usePosition, useLeverage } from "@/hooks/useAccountState";
import { useAssetPrice } from "@/hooks/useMarketData";
import { useBestPrices } from "@/hooks/useOrderBook";
import { formatPrice, formatSize, calcNotionalValue, calcRequiredMargin } from "@/lib/hyperliquid/utils";
import type { TIF } from "@/lib/hyperliquid/types";

interface TradeFormProps {
  symbol: string;
}

type OrderSide = "buy" | "sell";
type OrderType = "limit" | "market" | "stop-limit";
type MarginMode = "cross" | "isolated";
type TimeInForce = "gtc" | "ioc" | "alo";

export function TradeForm({ symbol }: TradeFormProps) {
  const { isConnected } = useAccount();
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [marginMode, setMarginMode] = useState<MarginMode>("cross");
  const [leverageValue, setLeverageValue] = useState(10);
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpsl, setTpsl] = useState(false);
  const [timeInForce, setTimeInForce] = useState<TimeInForce>("gtc");

  const coin = symbol.split("-")[0] || "BTC";
  const quote = "USDC";

  // Hooks
  const { placeOrder, updateLeverage, isSubmitting, lastError, builderFeeApproved } = useTrading();
  const { accountValue, availableBalance } = useAccountState();
  const position = usePosition(coin);
  const { leverage: currentLeverage, isCross } = useLeverage(coin);
  const { midPrice, markPrice } = useAssetPrice(coin);
  const { bestBid, bestAsk } = useBestPrices(coin);

  // 价格精度
  const priceDecimals = useMemo(() => {
    if (midPrice >= 10000) return 1;
    if (midPrice >= 1000) return 2;
    if (midPrice >= 100) return 3;
    if (midPrice >= 10) return 4;
    return 5;
  }, [midPrice]);

  // 初始化杠杆
  useEffect(() => {
    if (currentLeverage) {
      setLeverageValue(currentLeverage);
      setMarginMode(isCross ? "cross" : "isolated");
    }
  }, [currentLeverage, isCross]);

  // 当价格为空时，自动填入当前价格
  useEffect(() => {
    if (!price && midPrice > 0 && orderType === "limit") {
      setPrice(formatPrice(midPrice, priceDecimals));
    }
  }, [midPrice, price, priceDecimals, orderType]);

  // 计算订单价值和保证金
  const orderValue = useMemo(() => {
    const priceNum = orderType === "market" ? midPrice : parseFloat(price) || 0;
    const amountNum = parseFloat(amount) || 0;
    return calcNotionalValue(priceNum, amountNum);
  }, [price, amount, midPrice, orderType]);

  const marginRequired = useMemo(() => {
    return calcRequiredMargin(orderValue, leverageValue);
  }, [orderValue, leverageValue]);

  // 估算强平价格
  const estLiqPrice = useMemo(() => {
    if (!position && marginRequired <= 0) return 0;
    const entryPrice = orderType === "market" ? midPrice : parseFloat(price) || 0;
    if (entryPrice <= 0) return 0;
    
    // 简化计算：强平价格 = 入场价 * (1 - 1/杠杆) for long, (1 + 1/杠杆) for short
    const margin = 1 / leverageValue;
    if (side === "buy") {
      return entryPrice * (1 - margin * 0.9); // 0.9 是维持保证金系数
    } else {
      return entryPrice * (1 + margin * 0.9);
    }
  }, [position, marginRequired, price, midPrice, leverageValue, side, orderType]);

  // 设置百分比
  const handlePercentageClick = useCallback((pct: number) => {
    setPercentage(pct);
    if (availableBalance > 0 && midPrice > 0) {
      const maxNotional = availableBalance * leverageValue * (pct / 100);
      const maxSize = maxNotional / midPrice;
      setAmount(formatSize(maxSize, 5));
      setTotal(formatPrice(maxNotional, 2));
    }
  }, [availableBalance, leverageValue, midPrice]);

  // 金额变化时更新 total
  useEffect(() => {
    const priceNum = orderType === "market" ? midPrice : parseFloat(price) || 0;
    const amountNum = parseFloat(amount) || 0;
    if (priceNum > 0 && amountNum > 0) {
      setTotal(formatPrice(priceNum * amountNum, 2));
    }
  }, [amount, price, midPrice, orderType]);

  // 设置 Bid/Ask 价格
  const handleSetBid = () => {
    if (bestBid) setPrice(formatPrice(bestBid, priceDecimals));
  };
  const handleSetAsk = () => {
    if (bestAsk) setPrice(formatPrice(bestAsk, priceDecimals));
  };

  // 提交订单
  const handleSubmit = async () => {
    if (!isConnected) return;

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (orderType === "limit") {
      const priceNum = parseFloat(price);
      if (!priceNum || priceNum <= 0) {
        alert("Please enter a valid price");
        return;
      }
    }

    // 转换 TIF
    const tifMap: Record<TimeInForce, TIF> = {
      gtc: "Gtc",
      ioc: "Ioc",
      alo: "Alo",
    };

    const result = await placeOrder({
      coin,
      side: side as TradingOrderSide,
      orderType: orderType === "stop-limit" ? "limit" : orderType as TradingOrderType,
      size: amountNum,
      price: orderType === "market" ? undefined : parseFloat(price),
      reduceOnly,
      tif: tifMap[timeInForce],
      slippagePercent: 1,
    });

    if (result.success) {
      // 清空表单
      setAmount("");
      setTotal("");
      setPercentage(0);
    } else {
      alert(result.error || "Order failed");
    }
  };

  // 更新杠杆
  const handleLeverageChange = async (newLeverage: number) => {
    setLeverageValue(newLeverage);
    if (isConnected) {
      await updateLeverage(coin, newLeverage, marginMode === "cross");
    }
  };

  // 按钮文本
  const buttonText = useMemo(() => {
    if (!isConnected) return "Connect Wallet";
    if (isSubmitting) return "Submitting...";
    if (!builderFeeApproved) return "Approve & " + (side === "buy" ? "Buy / Long" : "Sell / Short");
    return side === "buy" ? "Buy / Long" : "Sell / Short";
  }, [isConnected, isSubmitting, builderFeeApproved, side]);

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
        <div className="relative group">
          <button className="px-3 py-1.5 text-sm font-medium bg-[#1a1d26] text-white rounded">
            {leverageValue}x
          </button>
          <div className="absolute hidden group-hover:block top-full mt-1 left-0 z-50 bg-[#1a1d26] rounded p-2 min-w-[200px]">
            <input
              type="range"
              min="1"
              max="50"
              value={leverageValue}
              onChange={(e) => handleLeverageChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[#848e9c] mt-1">
              <span>1x</span>
              <span>{leverageValue}x</span>
              <span>50x</span>
            </div>
          </div>
        </div>
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
          {formatPrice(availableBalance, 2)} <span className="text-[#848e9c]">{quote}</span>
        </span>
      </div>

      {/* Current Position */}
      <div className="flex items-center justify-between text-xs mb-4">
        <span className="text-[#848e9c]">Current Position</span>
        <span className={cn("font-mono", position ? (position.szi > 0 ? "text-[#0ecb81]" : "text-[#f6465d]") : "text-white")}>
          {position ? formatSize(position.szi, 5) : "0.00000"} <span className="text-[#848e9c]">{coin}</span>
        </span>
      </div>

      {/* Price Input */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[#848e9c]">Price</span>
          <div className="flex items-center gap-1">
            <button onClick={handleSetBid} className="text-[#848e9c] hover:text-white text-xs">Bid</button>
            <span className="text-[#848e9c]">|</span>
            <button onClick={handleSetAsk} className="text-[#848e9c] hover:text-white text-xs">Ask</button>
          </div>
        </div>
        <div className="flex items-center bg-[#1a1d26] rounded overflow-hidden">
          <input
            type="text"
            value={orderType === "market" ? "Market" : price}
            onChange={(e) => setPrice(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            placeholder="0"
            disabled={orderType === "market"}
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
          <span className="px-3 text-sm text-[#848e9c]">{coin}</span>
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
          onChange={(e) => handlePercentageClick(Number(e.target.value))}
          className="w-full h-1 bg-[#1a1d26] rounded appearance-none cursor-pointer"
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            value={percentage}
            onChange={(e) => handlePercentageClick(Number(e.target.value))}
            className="w-12 px-2 py-1 text-xs bg-[#1a1d26] text-white rounded outline-none font-mono"
          />
          <span className="text-xs text-[#848e9c]">%</span>
          <div className="flex gap-1 ml-auto">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentageClick(pct)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  percentage === pct
                    ? "bg-[#2a2d36] text-white"
                    : "text-[#848e9c] bg-[#1a1d26] hover:text-white"
                )}
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
          <option value="alo">ALO</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || (!isConnected ? false : !amount)}
        className={cn(
          "w-full py-3 text-sm font-semibold rounded transition-colors disabled:opacity-50",
          side === "buy"
            ? "bg-[#0ecb81] hover:bg-[#0ecb81]/90 text-white"
            : "bg-[#f6465d] hover:bg-[#f6465d]/90 text-white"
        )}
      >
        {buttonText}
      </button>

      {/* Order Info */}
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#848e9c]">Est Liq:</span>
          <span className="text-white font-mono">${formatPrice(estLiqPrice, priceDecimals)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#848e9c]">Order Val:</span>
          <span className="text-white font-mono">${formatPrice(orderValue, 2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#848e9c]">Margin Req:</span>
          <span className="text-white font-mono">${formatPrice(marginRequired, 2)}</span>
        </div>
      </div>

      {/* Error display */}
      {lastError && (
        <div className="mt-2 p-2 bg-[#f6465d]/20 text-[#f6465d] text-xs rounded">
          {lastError}
        </div>
      )}
    </div>
  );
}
