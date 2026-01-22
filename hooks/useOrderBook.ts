/**
 * 订单簿 Hook
 * 订阅和管理订单簿数据
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { infoClient, hyperliquidWs } from '@/lib/hyperliquid';
import type { WsL2BookData, L2BookLevel } from '@/lib/hyperliquid/types';

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  count: number;
  percent: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
  midPrice: number;
  lastUpdateTime: number;
}

/**
 * 将 API 数据转换为 UI 友好格式
 */
function processLevels(
  levels: L2BookLevel[],
  maxTotal: number,
  isBid: boolean
): OrderBookLevel[] {
  let cumTotal = 0;
  const processed: OrderBookLevel[] = [];

  // bids 按价格降序，asks 按价格升序（API 已排序）
  for (const level of levels) {
    const price = parseFloat(level.px);
    const size = parseFloat(level.sz);
    cumTotal += size;

    processed.push({
      price,
      size,
      total: cumTotal,
      count: level.n,
      percent: maxTotal > 0 ? (cumTotal / maxTotal) * 100 : 0,
    });
  }

  return processed;
}

/**
 * 订单簿 Hook
 */
export function useOrderBook(coin: string, maxLevels: number = 20) {
  const orderBook = useMarketStore((state) => state.orderBook);
  const updateOrderBook = useMarketStore((state) => state.updateOrderBook);
  const clearOrderBook = useMarketStore((state) => state.clearOrderBook);

  // 获取初始订单簿数据
  useEffect(() => {
    if (!coin) return;

    const fetchOrderBook = async () => {
      try {
        const data = await infoClient.getL2Book(coin);
        updateOrderBook({
          bids: data.levels[0],
          asks: data.levels[1],
          time: data.time,
        });
      } catch (error) {
        console.error('[useOrderBook] Failed to fetch:', error);
      }
    };

    fetchOrderBook();
  }, [coin, updateOrderBook]);

  // 订阅 WebSocket 订单簿更新
  useEffect(() => {
    if (!coin) return;

    console.log('[useOrderBook] Subscribing to', coin);

    const unsubscribe = hyperliquidWs.subscribeL2Book(coin, (data: WsL2BookData) => {
      updateOrderBook({
        bids: data.levels[0],
        asks: data.levels[1],
        time: data.time,
      });
    });

    return () => {
      console.log('[useOrderBook] Unsubscribing from', coin);
      unsubscribe();
      clearOrderBook();
    };
  }, [coin, updateOrderBook, clearOrderBook]);

  // 处理和格式化订单簿数据
  const formattedData = useMemo((): OrderBookData | null => {
    if (!orderBook) return null;

    const bids = orderBook.bids.slice(0, maxLevels);
    const asks = orderBook.asks.slice(0, maxLevels);

    // 计算最大累计量（用于百分比条）
    const bidTotal = bids.reduce((sum, l) => sum + parseFloat(l.sz), 0);
    const askTotal = asks.reduce((sum, l) => sum + parseFloat(l.sz), 0);
    const maxTotal = Math.max(bidTotal, askTotal);

    // 处理买卖盘
    const processedBids = processLevels(bids, maxTotal, true);
    const processedAsks = processLevels(asks, maxTotal, false);

    // 计算价差
    const bestBid = bids.length > 0 ? parseFloat(bids[0].px) : 0;
    const bestAsk = asks.length > 0 ? parseFloat(asks[0].px) : 0;
    const spread = bestAsk - bestBid;
    const midPrice = (bestBid + bestAsk) / 2;
    const spreadPercent = midPrice > 0 ? (spread / midPrice) * 100 : 0;

    return {
      bids: processedBids,
      asks: processedAsks, // asks 保持 API 返回的降序（高价在上）
      spread,
      spreadPercent,
      midPrice,
      lastUpdateTime: orderBook.time,
    };
  }, [orderBook, maxLevels]);

  return {
    data: formattedData,
    isLoading: !orderBook,
    rawBids: orderBook?.bids || [],
    rawAsks: orderBook?.asks || [],
  };
}

/**
 * 获取最佳买卖价
 */
export function useBestPrices(coin: string) {
  const orderBook = useMarketStore((state) => state.orderBook);

  return useMemo(() => {
    if (!orderBook || orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      return { bestBid: null, bestAsk: null, midPrice: null };
    }

    const bestBid = parseFloat(orderBook.bids[0].px);
    const bestAsk = parseFloat(orderBook.asks[0].px);
    const midPrice = (bestBid + bestAsk) / 2;

    return { bestBid, bestAsk, midPrice };
  }, [orderBook]);
}
