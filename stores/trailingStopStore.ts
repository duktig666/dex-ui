/**
 * Trailing Stop 订单状态管理
 * 使用 Zustand + persist 实现本地存储
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TrailingStopOrder, OrderSide } from "@/lib/hyperliquid/types";

// 生成唯一 ID
function generateId(): string {
  return `ts_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

interface TrailingStopState {
  orders: TrailingStopOrder[];

  // Actions
  addOrder: (order: Omit<TrailingStopOrder, "id" | "createdAt" | "status" | "triggerPrice" | "highestPrice" | "lowestPrice">) => string;
  removeOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  triggerOrder: (id: string) => void;
  updatePriceTracking: (id: string, currentPrice: string) => { triggered: boolean; triggerPrice: string | null };
  getActiveOrders: () => TrailingStopOrder[];
  getActiveOrdersByCoin: (coin: string) => TrailingStopOrder[];
  clearAllOrders: () => void;
}

export const useTrailingStopStore = create<TrailingStopState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (orderData) => {
        const id = generateId();
        const newOrder: TrailingStopOrder = {
          ...orderData,
          id,
          createdAt: Date.now(),
          status: "active",
          triggerPrice: null,
          highestPrice: orderData.side === "sell" ? null : null,
          lowestPrice: orderData.side === "buy" ? null : null,
        };

        set((state) => ({
          orders: [...state.orders, newOrder],
        }));

        return id;
      },

      removeOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        }));
      },

      cancelOrder: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "cancelled" as const } : o
          ),
        }));
      },

      triggerOrder: (id) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: "triggered" as const } : o
          ),
        }));
      },

      /**
       * 更新价格追踪并检查是否触发
       * @returns 是否触发以及触发价格
       */
      updatePriceTracking: (id, currentPrice) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order || order.status !== "active") {
          return { triggered: false, triggerPrice: null };
        }

        const price = parseFloat(currentPrice);
        let newHighest = order.highestPrice ? parseFloat(order.highestPrice) : null;
        let newLowest = order.lowestPrice ? parseFloat(order.lowestPrice) : null;
        let newTriggerPrice: number | null = null;
        let triggered = false;

        if (order.side === "sell") {
          // Trailing Stop Sell: 追踪最高价，价格回落触发
          // 用于多头止盈或空头止损
          if (newHighest === null || price > newHighest) {
            newHighest = price;
          }

          // 计算触发价
          if (order.trailType === "percent") {
            const trailPercent = parseFloat(order.trailValue) / 100;
            newTriggerPrice = newHighest * (1 - trailPercent);
          } else {
            newTriggerPrice = newHighest - parseFloat(order.trailValue);
          }

          // 检查是否触发
          if (price <= newTriggerPrice) {
            triggered = true;
          }
        } else {
          // Trailing Stop Buy: 追踪最低价，价格反弹触发
          // 用于空头止盈或做多入场
          if (newLowest === null || price < newLowest) {
            newLowest = price;
          }

          // 计算触发价
          if (order.trailType === "percent") {
            const trailPercent = parseFloat(order.trailValue) / 100;
            newTriggerPrice = newLowest * (1 + trailPercent);
          } else {
            newTriggerPrice = newLowest + parseFloat(order.trailValue);
          }

          // 检查是否触发
          if (price >= newTriggerPrice) {
            triggered = true;
          }
        }

        // 更新状态
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  highestPrice: newHighest?.toString() || null,
                  lowestPrice: newLowest?.toString() || null,
                  triggerPrice: newTriggerPrice?.toString() || null,
                  status: triggered ? ("triggered" as const) : o.status,
                }
              : o
          ),
        }));

        return {
          triggered,
          triggerPrice: newTriggerPrice?.toString() || null,
        };
      },

      getActiveOrders: () => {
        return get().orders.filter((o) => o.status === "active");
      },

      getActiveOrdersByCoin: (coin) => {
        return get().orders.filter((o) => o.status === "active" && o.coin === coin);
      },

      clearAllOrders: () => {
        set({ orders: [] });
      },
    }),
    {
      name: "trailing-stop-orders",
      storage: createJSONStorage(() => localStorage),
      // 只持久化必要的字段
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);

// 选择器 hooks
export const useActiveTrailingStops = () =>
  useTrailingStopStore((state) => state.getActiveOrders());

export const useActiveTrailingStopsByCoin = (coin: string) =>
  useTrailingStopStore((state) => state.getActiveOrdersByCoin(coin));

export const useTrailingStopActions = () =>
  useTrailingStopStore((state) => ({
    addOrder: state.addOrder,
    removeOrder: state.removeOrder,
    cancelOrder: state.cancelOrder,
    triggerOrder: state.triggerOrder,
    updatePriceTracking: state.updatePriceTracking,
    clearAllOrders: state.clearAllOrders,
  }));
