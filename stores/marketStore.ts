/**
 * 市场数据 Store
 * 管理交易对元数据、价格、订单簿等市场数据
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  PerpMeta,
  AssetCtx,
  L2BookLevel,
  Trade,
  Candle,
  AssetInfo,
} from '@/lib/hyperliquid/types';

// 订单簿数据
interface OrderBookData {
  bids: L2BookLevel[];
  asks: L2BookLevel[];
  time: number;
}

// 市场 Store 状态
interface MarketState {
  // 当前选中的交易对
  currentCoin: string;

  // 交易对元数据
  perpMetas: PerpMeta[];
  assetCtxs: AssetCtx[];
  assetInfoMap: Map<string, AssetInfo>;

  // 所有中间价
  allMids: Record<string, string>;

  // 当前交易对的订单簿
  orderBook: OrderBookData | null;

  // 最近成交
  recentTrades: Trade[];

  // K 线数据缓存
  candleCache: Map<string, Candle[]>; // key: `${coin}_${interval}`

  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

// 市场 Store Actions
interface MarketActions {
  // 设置当前交易对
  setCurrentCoin: (coin: string) => void;

  // 初始化市场数据
  initializeMarket: (perpMetas: PerpMeta[], assetCtxs: AssetCtx[]) => void;

  // 更新资产上下文
  updateAssetCtx: (coin: string, ctx: Partial<AssetCtx>) => void;

  // 更新所有中间价
  updateAllMids: (mids: Record<string, string>) => void;

  // 更新订单簿
  updateOrderBook: (data: OrderBookData) => void;

  // 添加成交记录
  addTrade: (trade: Trade) => void;
  addTrades: (trades: Trade[]) => void;

  // 更新 K 线缓存
  updateCandleCache: (coin: string, interval: string, candles: Candle[]) => void;
  appendCandle: (coin: string, interval: string, candle: Candle) => void;

  // 清空订单簿
  clearOrderBook: () => void;

  // 设置错误
  setError: (error: string | null) => void;

  // 重置
  reset: () => void;
}

// 初始状态
const initialState: MarketState = {
  currentCoin: 'BTC',
  perpMetas: [],
  assetCtxs: [],
  assetInfoMap: new Map(),
  allMids: {},
  orderBook: null,
  recentTrades: [],
  candleCache: new Map(),
  isLoading: true,
  isInitialized: false,
  error: null,
};

// 创建 Store
export const useMarketStore = create<MarketState & MarketActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setCurrentCoin: (coin) => {
      set({ currentCoin: coin, orderBook: null, recentTrades: [] });
    },

    initializeMarket: (perpMetas, assetCtxs) => {
      // 构建 assetInfoMap
      const assetInfoMap = new Map<string, AssetInfo>();

      perpMetas.forEach((meta, index) => {
        const ctx = assetCtxs[index];
        if (ctx) {
          assetInfoMap.set(meta.name, {
            name: meta.name,
            assetId: index,
            szDecimals: meta.szDecimals,
            maxLeverage: meta.maxLeverage,
            markPx: ctx.markPx,
            midPx: ctx.midPx || ctx.markPx,
            oraclePx: ctx.oraclePx,
            funding: ctx.funding,
            openInterest: ctx.openInterest,
            prevDayPx: ctx.prevDayPx,
            dayNtlVlm: ctx.dayNtlVlm,
            premium: ctx.premium,
          });
        }
      });

      set({
        perpMetas,
        assetCtxs,
        assetInfoMap,
        isLoading: false,
        isInitialized: true,
      });
    },

    updateAssetCtx: (coin, ctx) => {
      const { assetInfoMap, perpMetas, assetCtxs } = get();
      const existingInfo = assetInfoMap.get(coin);

      if (existingInfo) {
        const newInfo: AssetInfo = {
          ...existingInfo,
          ...ctx,
        };
        const newMap = new Map(assetInfoMap);
        newMap.set(coin, newInfo);

        // 同步更新 assetCtxs
        const index = perpMetas.findIndex((m) => m.name === coin);
        if (index !== -1) {
          const newAssetCtxs = [...assetCtxs];
          newAssetCtxs[index] = { ...assetCtxs[index], ...ctx };
          set({ assetInfoMap: newMap, assetCtxs: newAssetCtxs });
        } else {
          set({ assetInfoMap: newMap });
        }
      }
    },

    updateAllMids: (mids) => {
      set({ allMids: mids });

      // 同步更新 assetInfoMap 中的 midPx
      const { assetInfoMap } = get();
      const newMap = new Map(assetInfoMap);
      let updated = false;

      for (const [coin, midPx] of Object.entries(mids)) {
        const info = newMap.get(coin);
        if (info && info.midPx !== midPx) {
          newMap.set(coin, { ...info, midPx });
          updated = true;
        }
      }

      if (updated) {
        set({ assetInfoMap: newMap });
      }
    },

    updateOrderBook: (data) => {
      set({ orderBook: data });
    },

    addTrade: (trade) => {
      const { recentTrades, currentCoin } = get();
      if (trade.coin !== currentCoin) return;

      // 保留最近 100 条成交
      const newTrades = [trade, ...recentTrades].slice(0, 100);
      set({ recentTrades: newTrades });
    },

    addTrades: (trades) => {
      const { recentTrades, currentCoin } = get();
      const filteredTrades = trades.filter((t) => t.coin === currentCoin);
      if (filteredTrades.length === 0) return;

      // 按时间排序，最新的在前
      const sortedNewTrades = [...filteredTrades].sort((a, b) => b.time - a.time);
      const newTrades = [...sortedNewTrades, ...recentTrades].slice(0, 100);
      set({ recentTrades: newTrades });
    },

    updateCandleCache: (coin, interval, candles) => {
      const { candleCache } = get();
      const key = `${coin}_${interval}`;
      const newCache = new Map(candleCache);
      newCache.set(key, candles);
      set({ candleCache: newCache });
    },

    appendCandle: (coin, interval, candle) => {
      const { candleCache } = get();
      const key = `${coin}_${interval}`;
      const existing = candleCache.get(key) || [];

      // 检查是否需要更新最后一根 K 线或添加新的
      const lastCandle = existing[existing.length - 1];
      let newCandles: Candle[];

      if (lastCandle && lastCandle.t === candle.t) {
        // 更新最后一根 K 线
        newCandles = [...existing.slice(0, -1), candle];
      } else {
        // 添加新的 K 线
        newCandles = [...existing, candle];
      }

      const newCache = new Map(candleCache);
      newCache.set(key, newCandles);
      set({ candleCache: newCache });
    },

    clearOrderBook: () => {
      set({ orderBook: null });
    },

    setError: (error) => {
      set({ error, isLoading: false });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

// 选择器
export const selectCurrentAssetInfo = (state: MarketState & MarketActions) => {
  return state.assetInfoMap.get(state.currentCoin);
};

export const selectCurrentMidPrice = (state: MarketState & MarketActions) => {
  const info = state.assetInfoMap.get(state.currentCoin);
  return info?.midPx || state.allMids[state.currentCoin] || '0';
};

export const selectAssetInfo = (coin: string) => (state: MarketState & MarketActions) => {
  return state.assetInfoMap.get(coin);
};

export const selectOrderBookSpread = (state: MarketState & MarketActions) => {
  const { orderBook } = state;
  if (!orderBook || orderBook.bids.length === 0 || orderBook.asks.length === 0) {
    return null;
  }

  const bestBid = parseFloat(orderBook.bids[0].px);
  const bestAsk = parseFloat(orderBook.asks[0].px);
  const spread = bestAsk - bestBid;
  const spreadPercent = (spread / bestAsk) * 100;

  return {
    bestBid,
    bestAsk,
    spread,
    spreadPercent,
  };
};
