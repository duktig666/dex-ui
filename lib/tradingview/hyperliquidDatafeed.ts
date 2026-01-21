/**
 * HyperLiquid TradingView Datafeed
 * 接入 HyperLiquid API 的真实数据
 */

import { infoClient, hyperliquidWs, TV_TO_HL_INTERVAL, INTERVAL_TO_MS, CURRENT_NETWORK } from '@/lib/hyperliquid';
import type { Candle, WsCandleData } from '@/lib/hyperliquid/types';
import type {
  IBasicDataFeed,
  OnReadyCallback,
  SearchSymbolsCallback,
  ResolveCallback,
  ErrorCallback,
  HistoryCallback,
  SubscribeBarsCallback,
  ResolutionString,
  LibrarySymbolInfo,
  PeriodParams,
  DatafeedConfiguration,
  Bar,
} from '@/public/static/charting_library/charting_library';

// 配置
const configurationData: DatafeedConfiguration = {
  supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '1W', '1M'] as ResolutionString[],
  exchanges: [
    {
      value: 'HYPERLIQUID',
      name: 'HyperLiquid',
      desc: `HyperLiquid DEX (${CURRENT_NETWORK.displayName})`,
    },
  ],
  symbols_types: [
    {
      name: 'crypto',
      value: 'crypto',
    },
  ],
};

// 符号缓存
let symbolsCache: Array<{
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
  ticker: string;
  szDecimals: number;
  maxLeverage: number;
}> = [];

// 活跃订阅
const subscriptions: Map<
  string,
  {
    callback: SubscribeBarsCallback;
    coin: string;
    resolution: string;
    lastBar: Bar | null;
    unsubscribe: (() => void) | null;
  }
> = new Map();

/**
 * 将 HyperLiquid Candle 转换为 TradingView Bar
 */
function candleToBar(candle: Candle): Bar {
  return {
    time: candle.t, // 毫秒时间戳
    open: parseFloat(candle.o),
    high: parseFloat(candle.h),
    low: parseFloat(candle.l),
    close: parseFloat(candle.c),
    volume: parseFloat(candle.v),
  };
}

/**
 * 从交易对名称提取 coin
 * 支持多种格式: "BTC-USDC" -> "BTC", "BTCUSD" -> "BTC", "ETH" -> "ETH", "BTC/USDC" -> "BTC"
 */
function extractCoin(symbolName: string): string {
  // 处理 "BTC-USDC", "ETH-USDC" 等格式
  if (symbolName.includes('-')) {
    return symbolName.split('-')[0];
  }
  // 处理 "BTC/USDC" 格式
  if (symbolName.includes('/')) {
    return symbolName.split('/')[0];
  }
  // 处理 "BTCUSD", "BTCUSDC", "ETHUSDT" 等格式
  const match = symbolName.match(/^([A-Z0-9]+?)(?:USD[CT]?|PERP)?$/i);
  if (match) {
    return match[1].toUpperCase();
  }
  // 默认返回原名称
  return symbolName.toUpperCase();
}

/**
 * 根据 coin 生成符号名称
 */
function coinToSymbol(coin: string): string {
  return `${coin}-USDC`;
}

/**
 * 根据价格计算 pricescale
 */
function getPricescale(price: number): number {
  if (price >= 10000) return 10; // BTC: 0.1
  if (price >= 1000) return 100; // ETH: 0.01
  if (price >= 100) return 1000; // 0.001
  if (price >= 10) return 10000; // 0.0001
  if (price >= 1) return 100000; // 0.00001
  return 1000000; // 0.000001
}

/**
 * 加载符号列表
 */
async function loadSymbols(): Promise<void> {
  if (symbolsCache.length > 0) return;

  try {
    const data = await infoClient.getMetaAndAssetCtxs();
    symbolsCache = data.universe.map((meta, index) => {
      const ctx = data.assetCtxs[index];
      return {
        symbol: coinToSymbol(meta.name),
        full_name: coinToSymbol(meta.name),
        description: `${meta.name} / USDC Perpetual`,
        exchange: 'HYPERLIQUID',
        type: 'crypto',
        ticker: coinToSymbol(meta.name),
        szDecimals: meta.szDecimals,
        maxLeverage: meta.maxLeverage,
        markPx: ctx?.markPx || '0',
      };
    });
    console.log('[HLDatafeed] Loaded', symbolsCache.length, 'symbols');
  } catch (error) {
    console.error('[HLDatafeed] Failed to load symbols:', error);
  }
}

/**
 * 创建 HyperLiquid Datafeed
 */
export function createHyperliquidDatafeed(): IBasicDataFeed {
  return {
    onReady: (callback: OnReadyCallback) => {
      console.log('[HLDatafeed] onReady called');
      // 预加载符号
      loadSymbols().then(() => {
        setTimeout(() => callback(configurationData), 0);
      });
    },

    searchSymbols: async (
      userInput: string,
      _exchange: string,
      _symbolType: string,
      onResult: SearchSymbolsCallback
    ) => {
      console.log('[HLDatafeed] searchSymbols:', userInput);
      await loadSymbols();

      const filtered = symbolsCache.filter(
        (s) =>
          s.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
          s.description.toLowerCase().includes(userInput.toLowerCase())
      );
      onResult(filtered);
    },

    resolveSymbol: async (
      symbolName: string,
      onResolve: ResolveCallback,
      onError: ErrorCallback
    ) => {
      console.log('[HLDatafeed] resolveSymbol:', symbolName);
      await loadSymbols();

      // 查找符号
      let symbolItem = symbolsCache.find(
        (s) => s.symbol === symbolName || s.full_name === symbolName || s.ticker === symbolName
      );

      // 如果没找到，尝试用 coin 名称查找
      if (!symbolItem) {
        const coin = extractCoin(symbolName);
        symbolItem = symbolsCache.find((s) => extractCoin(s.symbol) === coin);
      }

      if (!symbolItem) {
        console.log('[HLDatafeed] Symbol not found:', symbolName);
        onError('Symbol not found');
        return;
      }

      // 获取当前价格来确定 pricescale
      let pricescale = 100;
      try {
        const mids = await infoClient.getAllMids();
        const coin = extractCoin(symbolItem.symbol);
        const midPx = mids[coin];
        if (midPx) {
          pricescale = getPricescale(parseFloat(midPx));
        }
      } catch (error) {
        console.warn('[HLDatafeed] Failed to get price for pricescale:', error);
      }

      const symbolInfo: LibrarySymbolInfo = {
        ticker: symbolItem.ticker,
        name: symbolItem.symbol,
        description: symbolItem.description,
        type: symbolItem.type,
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: symbolItem.exchange,
        minmov: 1,
        pricescale,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: configurationData.supported_resolutions as ResolutionString[],
        volume_precision: symbolItem.szDecimals,
        data_status: 'streaming',
        full_name: symbolItem.full_name,
        listed_exchange: symbolItem.exchange,
        format: 'price',
      };

      console.log('[HLDatafeed] Symbol resolved:', symbolInfo);
      setTimeout(() => onResolve(symbolInfo), 0);
    },

    getBars: async (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: PeriodParams,
      onResult: HistoryCallback,
      onError: ErrorCallback
    ) => {
      const { from, to, firstDataRequest } = periodParams;
      console.log('[HLDatafeed] getBars:', symbolInfo.name, resolution, from, to, firstDataRequest);

      try {
        const coin = extractCoin(symbolInfo.name);
        const interval = TV_TO_HL_INTERVAL[resolution] || '1h';

        // HyperLiquid API 使用毫秒时间戳
        const startTime = from * 1000;
        const endTime = to * 1000;

        const candles = await infoClient.getCandleSnapshot(coin, interval, startTime, endTime);

        if (!candles || candles.length === 0) {
          console.log('[HLDatafeed] No data for', coin, interval);
          onResult([], { noData: true });
          return;
        }

        // 转换为 TradingView Bar 格式
        const bars = candles.map(candleToBar);

        // 按时间排序
        bars.sort((a, b) => a.time - b.time);

        console.log('[HLDatafeed] Returning', bars.length, 'bars for', coin);
        onResult(bars, { noData: false });
      } catch (error) {
        console.error('[HLDatafeed] getBars error:', error);
        onError('Failed to get bars: ' + (error as Error).message);
      }
    },

    subscribeBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onTick: SubscribeBarsCallback,
      listenerGuid: string,
      _onResetCacheNeededCallback: () => void
    ) => {
      console.log('[HLDatafeed] subscribeBars:', symbolInfo.name, resolution, listenerGuid);

      const coin = extractCoin(symbolInfo.name);
      const interval = TV_TO_HL_INTERVAL[resolution] || '1h';

      // 取消之前的订阅（如果存在）
      const existing = subscriptions.get(listenerGuid);
      if (existing?.unsubscribe) {
        existing.unsubscribe();
      }

      // 订阅 WebSocket K 线数据
      const unsubscribe = hyperliquidWs.subscribeCandle(coin, interval, (data: WsCandleData) => {
        const subscription = subscriptions.get(listenerGuid);
        if (!subscription) return;

        const bar = candleToBar(data);
        
        // 检查是否是更新还是新 bar
        if (subscription.lastBar && bar.time === subscription.lastBar.time) {
          // 更新当前 bar
          subscription.callback(bar);
        } else if (!subscription.lastBar || bar.time > subscription.lastBar.time) {
          // 新 bar
          subscription.lastBar = bar;
          subscription.callback(bar);
        }
      });

      // 保存订阅信息
      subscriptions.set(listenerGuid, {
        callback: onTick,
        coin,
        resolution,
        lastBar: null,
        unsubscribe,
      });
    },

    unsubscribeBars: (listenerGuid: string) => {
      console.log('[HLDatafeed] unsubscribeBars:', listenerGuid);

      const subscription = subscriptions.get(listenerGuid);
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
      subscriptions.delete(listenerGuid);
    },
  };
}

// 默认导出
export default createHyperliquidDatafeed;
