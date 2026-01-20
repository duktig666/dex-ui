import {
  SUPPORTED_RESOLUTIONS,
  AVAILABLE_SYMBOLS,
  DEFAULT_RESOLUTION,
} from "./config";
import { generateMockBars, getCurrentPrice, type Bar } from "./mockData";
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
} from "@/public/static/charting_library/charting_library";

const configurationData: DatafeedConfiguration = {
  supported_resolutions: Object.keys(SUPPORTED_RESOLUTIONS) as ResolutionString[],
  exchanges: [
    {
      value: "HERMES",
      name: "Hermes",
      desc: "Hermes Exchange",
    },
  ],
  symbols_types: [
    {
      name: "crypto",
      value: "crypto",
    },
  ],
};

// Store for active subscriptions
const subscriptions: Map<
  string,
  {
    callback: SubscribeBarsCallback;
    symbol: string;
    resolution: string;
    lastBar: Bar | null;
    intervalId: NodeJS.Timeout | null;
  }
> = new Map();

export const datafeed: IBasicDataFeed = {
  onReady: (callback: OnReadyCallback) => {
    console.log("[Datafeed] onReady called");
    setTimeout(() => callback(configurationData), 0);
  },

  searchSymbols: (
    userInput: string,
    _exchange: string,
    _symbolType: string,
    onResult: SearchSymbolsCallback
  ) => {
    console.log("[Datafeed] searchSymbols:", userInput);
    const filtered = AVAILABLE_SYMBOLS.filter(
      (s) =>
        s.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
        s.description.toLowerCase().includes(userInput.toLowerCase())
    );
    onResult(filtered);
  },

  resolveSymbol: (
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback
  ) => {
    console.log("[Datafeed] resolveSymbol:", symbolName);
    
    const symbolItem = AVAILABLE_SYMBOLS.find(
      (s) => s.symbol === symbolName || s.full_name === symbolName
    );

    if (!symbolItem) {
      console.log("[Datafeed] Symbol not found:", symbolName);
      onError("Symbol not found");
      return;
    }

    const symbolInfo: LibrarySymbolInfo = {
      ticker: symbolItem.ticker,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: symbolItem.symbol.includes("BTC") ? 10 : 10000,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: Object.keys(SUPPORTED_RESOLUTIONS) as ResolutionString[],
      volume_precision: 5,
      data_status: "streaming",
      full_name: symbolItem.full_name,
      listed_exchange: symbolItem.exchange,
      format: "price",
    };

    console.log("[Datafeed] Symbol resolved:", symbolInfo);
    setTimeout(() => onResolve(symbolInfo), 0);
  },

  getBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ) => {
    const { from, to, firstDataRequest } = periodParams;
    console.log("[Datafeed] getBars:", symbolInfo.name, resolution, from, to, firstDataRequest);

    try {
      const bars = generateMockBars(
        symbolInfo.name,
        resolution,
        from * 1000,
        to * 1000
      );

      // Convert timestamps from ms to seconds for TradingView
      const tvBars = bars.map((bar) => ({
        ...bar,
        time: bar.time, // Keep in milliseconds for TradingView
      }));

      console.log("[Datafeed] Returning", tvBars.length, "bars");
      
      if (tvBars.length === 0) {
        onResult([], { noData: true });
      } else {
        onResult(tvBars, { noData: false });
      }
    } catch (error) {
      console.error("[Datafeed] getBars error:", error);
      onError("Failed to get bars");
    }
  },

  subscribeBars: (
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    _onResetCacheNeededCallback: () => void
  ) => {
    console.log("[Datafeed] subscribeBars:", symbolInfo.name, resolution, listenerGuid);

    // For static mock data, we won't update in real-time
    // But we store the subscription for future real-time implementation
    subscriptions.set(listenerGuid, {
      callback: onTick,
      symbol: symbolInfo.name,
      resolution,
      lastBar: null,
      intervalId: null,
    });
  },

  unsubscribeBars: (listenerGuid: string) => {
    console.log("[Datafeed] unsubscribeBars:", listenerGuid);
    
    const subscription = subscriptions.get(listenerGuid);
    if (subscription?.intervalId) {
      clearInterval(subscription.intervalId);
    }
    subscriptions.delete(listenerGuid);
  },
};

// Factory function to create a new datafeed instance
export function createMockDatafeed(): IBasicDataFeed {
  return datafeed;
}

export default datafeed;
