/**
 * 最近成交 Hook
 * 订阅和管理成交记录
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { infoClient, hyperliquidWs } from '@/lib/hyperliquid';
import type { Trade, WsTradeData } from '@/lib/hyperliquid/types';

export interface FormattedTrade {
  id: number;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  time: number;
  timeStr: string;
  value: number;
}

/**
 * 格式化成交记录
 */
function formatTrade(trade: Trade): FormattedTrade {
  const price = parseFloat(trade.px);
  const size = parseFloat(trade.sz);

  return {
    id: trade.tid,
    price,
    size,
    side: trade.side === 'B' ? 'buy' : 'sell',
    time: trade.time,
    timeStr: new Date(trade.time).toLocaleTimeString(),
    value: price * size,
  };
}

/**
 * 最近成交 Hook
 */
export function useRecentTrades(coin: string, maxTrades: number = 50) {
  const recentTrades = useMarketStore((state) => state.recentTrades);
  const addTrades = useMarketStore((state) => state.addTrades);

  // 获取初始成交记录
  useEffect(() => {
    if (!coin) return;

    const fetchTrades = async () => {
      try {
        const trades = await infoClient.getRecentTrades(coin);
        addTrades(trades);
      } catch (error) {
        console.error('[useRecentTrades] Failed to fetch:', error);
      }
    };

    fetchTrades();
  }, [coin, addTrades]);

  // 订阅 WebSocket 成交更新
  useEffect(() => {
    if (!coin) return;

    console.log('[useRecentTrades] Subscribing to trades for', coin);

    const unsubscribe = hyperliquidWs.subscribeTrades(coin, (data: WsTradeData[]) => {
      // 将 WS 数据转换为 Trade 格式
      const trades: Trade[] = data.map((t) => ({
        coin,
        side: t.side,
        px: t.px,
        sz: t.sz,
        time: t.time,
        hash: t.hash,
        tid: t.tid,
      }));
      addTrades(trades);
    });

    return () => {
      console.log('[useRecentTrades] Unsubscribing from trades');
      unsubscribe();
    };
  }, [coin, addTrades]);

  // 格式化成交记录
  const formattedTrades = useMemo(() => {
    return recentTrades.slice(0, maxTrades).map(formatTrade);
  }, [recentTrades, maxTrades]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (formattedTrades.length === 0) {
      return { buyVolume: 0, sellVolume: 0, totalVolume: 0, buyRatio: 50 };
    }

    const buyTrades = formattedTrades.filter((t) => t.side === 'buy');
    const sellTrades = formattedTrades.filter((t) => t.side === 'sell');

    const buyVolume = buyTrades.reduce((sum, t) => sum + t.size, 0);
    const sellVolume = sellTrades.reduce((sum, t) => sum + t.size, 0);
    const totalVolume = buyVolume + sellVolume;
    const buyRatio = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;

    return { buyVolume, sellVolume, totalVolume, buyRatio };
  }, [formattedTrades]);

  return {
    trades: formattedTrades,
    stats,
    isLoading: recentTrades.length === 0,
  };
}
