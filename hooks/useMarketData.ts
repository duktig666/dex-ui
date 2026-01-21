/**
 * 市场数据 Hook
 * 初始化并管理市场数据
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useMarketStore } from '@/stores/marketStore';
import { infoClient, hyperliquidWs } from '@/lib/hyperliquid';
import type { WsAllMidsData } from '@/lib/hyperliquid/types';

/**
 * 初始化市场数据
 */
export function useMarketData() {
  const {
    currentCoin,
    perpMetas,
    assetInfoMap,
    allMids,
    isLoading,
    isInitialized,
    error,
    initializeMarket,
    updateAllMids,
    setError,
  } = useMarketStore();

  // 初始化市场数据
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      console.log('[useMarketData] Initializing market data...');
      const data = await infoClient.getMetaAndAssetCtxs();
      initializeMarket(data.universe, data.assetCtxs);
      console.log('[useMarketData] Market data initialized:', data.universe.length, 'assets');
    } catch (err) {
      console.error('[useMarketData] Failed to initialize:', err);
      setError((err as Error).message);
    }
  }, [isInitialized, initializeMarket, setError]);

  // 订阅 allMids 实时更新
  useEffect(() => {
    if (!isInitialized) return;

    console.log('[useMarketData] Subscribing to allMids...');
    const unsubscribe = hyperliquidWs.subscribeAllMids((data: WsAllMidsData) => {
      updateAllMids(data.mids);
    });

    return () => {
      console.log('[useMarketData] Unsubscribing from allMids');
      unsubscribe();
    };
  }, [isInitialized, updateAllMids]);

  // 组件挂载时初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 获取当前交易对信息
  const currentAssetInfo = assetInfoMap.get(currentCoin);
  const currentPrice = currentAssetInfo?.midPx || allMids[currentCoin] || '0';

  return {
    currentCoin,
    currentAssetInfo,
    currentPrice,
    perpMetas,
    assetInfoMap,
    allMids,
    isLoading,
    isInitialized,
    error,
    refetch: initialize,
  };
}

/**
 * 获取指定交易对的价格信息
 */
export function useAssetPrice(coin: string) {
  const assetInfoMap = useMarketStore((state) => state.assetInfoMap);
  const allMids = useMarketStore((state) => state.allMids);
  
  const assetInfo = assetInfoMap.get(coin);
  const midPrice = assetInfo?.midPx || allMids[coin] || '0';
  const markPrice = assetInfo?.markPx || midPrice;
  const oraclePrice = assetInfo?.oraclePx || midPrice;
  const prevDayPrice = assetInfo?.prevDayPx || '0';
  const funding = assetInfo?.funding || '0';
  const openInterest = assetInfo?.openInterest || '0';
  const dayVolume = assetInfo?.dayNtlVlm || '0';

  // 计算 24h 变化
  const priceChange = prevDayPrice !== '0' 
    ? ((parseFloat(midPrice) - parseFloat(prevDayPrice)) / parseFloat(prevDayPrice)) 
    : 0;

  return {
    coin,
    midPrice: parseFloat(midPrice),
    markPrice: parseFloat(markPrice),
    oraclePrice: parseFloat(oraclePrice),
    prevDayPrice: parseFloat(prevDayPrice),
    priceChange,
    priceChangePercent: priceChange * 100,
    funding: parseFloat(funding),
    fundingPercent: parseFloat(funding) * 100,
    openInterest: parseFloat(openInterest),
    dayVolume: parseFloat(dayVolume),
    assetInfo,
  };
}

/**
 * 获取所有交易对列表
 */
export function useAssetList() {
  const perpMetas = useMarketStore((state) => state.perpMetas);
  const assetInfoMap = useMarketStore((state) => state.assetInfoMap);
  const allMids = useMarketStore((state) => state.allMids);

  const assets = perpMetas.map((meta, index) => {
    const info = assetInfoMap.get(meta.name);
    const midPrice = info?.midPx || allMids[meta.name] || '0';
    const prevDayPrice = info?.prevDayPx || '0';
    const priceChange = prevDayPrice !== '0'
      ? ((parseFloat(midPrice) - parseFloat(prevDayPrice)) / parseFloat(prevDayPrice))
      : 0;

    return {
      name: meta.name,
      assetId: index,
      szDecimals: meta.szDecimals,
      maxLeverage: meta.maxLeverage,
      price: parseFloat(midPrice),
      priceChange,
      volume: info ? parseFloat(info.dayNtlVlm) : 0,
    };
  });

  return assets;
}
