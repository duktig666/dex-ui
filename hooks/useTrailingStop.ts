/**
 * Trailing Stop 价格监控 Hook
 * 使用 WebSocket 实时价格更新追踪订单
 */

import { useEffect, useCallback, useRef } from "react";
import { useAccount, useSignTypedData } from "wagmi";
import {
  useTrailingStopStore,
  useActiveTrailingStopsByCoin,
  useTrailingStopActions,
} from "@/stores/trailingStopStore";
import { useAssetPrice, useAssetList } from "@/hooks/useMarketData";
import { exchangeClient } from "@/lib/hyperliquid/client";
import type { TrailingStopOrder } from "@/lib/hyperliquid/types";

interface UseTrailingStopProps {
  coin: string;
  enabled?: boolean;
}

/**
 * 监控单个币种的 Trailing Stop 订单
 */
export function useTrailingStopMonitor({ coin, enabled = true }: UseTrailingStopProps) {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const assetList = useAssetList();
  const { midPrice, markPrice } = useAssetPrice(coin);
  const activeOrders = useActiveTrailingStopsByCoin(coin);
  const { updatePriceTracking, triggerOrder } = useTrailingStopActions();

  // 获取资产 ID
  const assetInfo = assetList.find((a) => a.name === coin);
  const assetId = assetInfo?.assetId ?? 0;

  // 处理订单触发
  const handleOrderTrigger = useCallback(
    async (order: TrailingStopOrder, triggerPrice: string) => {
      if (!isConnected || !address || !assetInfo) return;

      console.log(`[Trailing Stop] Order triggered:`, {
        id: order.id,
        coin: order.coin,
        side: order.side,
        size: order.size,
        triggerPrice,
      });

      try {
        // 执行市价单
        const slippage = 0.01; // 1% 滑点
        const priceNum = parseFloat(triggerPrice);
        const slippagePrice = order.side === "buy" 
          ? (priceNum * (1 + slippage)).toString()
          : (priceNum * (1 - slippage)).toString();

        const result = await exchangeClient.placeMarketOrder(
          order.coin,
          assetId,
          order.side === "buy",
          order.size,
          slippagePrice,
          order.reduceOnly,
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
          console.log(`[Trailing Stop] Market order placed successfully`);
          triggerOrder(order.id);
        } else {
          console.error(`[Trailing Stop] Market order failed:`, result);
        }
      } catch (error) {
        console.error(`[Trailing Stop] Error placing market order:`, error);
      }
    },
    [isConnected, address, assetInfo, assetId, signTypedDataAsync, triggerOrder]
  );

  // 价格变化时更新追踪
  useEffect(() => {
    if (!enabled || !midPrice || activeOrders.length === 0) return;

    const currentPrice = midPrice.toString();

    for (const order of activeOrders) {
      const { triggered, triggerPrice } = updatePriceTracking(order.id, currentPrice);

      if (triggered && triggerPrice) {
        handleOrderTrigger(order, triggerPrice);
      }
    }
  }, [enabled, midPrice, activeOrders, updatePriceTracking, handleOrderTrigger]);

  return {
    activeOrders,
    currentPrice: midPrice,
  };
}

/**
 * 全局 Trailing Stop 监控
 * 监控所有活跃币种的 Trailing Stop 订单
 */
export function useGlobalTrailingStopMonitor() {
  const allOrders = useTrailingStopStore((state) => state.orders);
  const activeOrders = allOrders.filter((o) => o.status === "active");

  // 获取所有活跃币种
  const activeCoins = [...new Set(activeOrders.map((o) => o.coin))];

  return {
    activeCoins,
    totalActiveOrders: activeOrders.length,
    ordersByCoin: activeCoins.reduce(
      (acc, coin) => {
        acc[coin] = activeOrders.filter((o) => o.coin === coin);
        return acc;
      },
      {} as Record<string, TrailingStopOrder[]>
    ),
  };
}

/**
 * 创建 Trailing Stop 订单
 */
export function useCreateTrailingStop() {
  const { addOrder } = useTrailingStopActions();

  const createOrder = useCallback(
    (params: {
      coin: string;
      side: "buy" | "sell";
      size: string;
      trailValue: string;
      trailType: "percent" | "price";
      reduceOnly?: boolean;
    }) => {
      const id = addOrder({
        coin: params.coin,
        side: params.side,
        size: params.size,
        trailValue: params.trailValue,
        trailType: params.trailType,
        reduceOnly: params.reduceOnly ?? false,
      });

      console.log(`[Trailing Stop] Order created:`, { id, ...params });
      return id;
    },
    [addOrder]
  );

  return { createOrder };
}
