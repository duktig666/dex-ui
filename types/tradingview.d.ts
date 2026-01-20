// Type declarations for TradingView Charting Library
// These are minimal types for our usage, the full types are in charting_library.d.ts

declare module "@/public/static/charting_library/charting_library" {
  export * from "./charting_library.d.ts";
  
  export interface ChartingLibraryWidgetOptions {
    debug?: boolean;
    symbol: string;
    datafeed: IBasicDataFeed;
    container: HTMLElement;
    library_path: string;
    locale?: LanguageCode;
    theme?: "dark" | "light";
    loading_screen?: {
      backgroundColor?: string;
      foregroundColor?: string;
    };
    enabled_features?: string[];
    disabled_features?: string[];
    client_id?: string;
    user_id?: string;
    fullscreen?: boolean;
    autosize?: boolean;
    custom_css_url?: string;
    interval?: ResolutionString;
    timezone?: Timezone;
    favorites?: {
      intervals?: ResolutionString[];
      chartTypes?: string[];
    };
    load_last_chart?: boolean;
    auto_save_delay?: number;
    overrides?: Record<string, unknown>;
    studies_overrides?: Record<string, unknown>;
  }

  export interface IChartingLibraryWidget {
    onChartReady: (callback: () => void) => void;
    remove: () => void;
    chart: () => IChartWidgetApi;
  }

  export interface IChartWidgetApi {
    setSymbol: (symbol: string, callback?: () => void) => void;
    setResolution: (resolution: ResolutionString, callback?: () => void) => void;
  }

  export type LanguageCode = "en" | "zh" | "ja" | "ko" | "ru" | "es" | "fr" | "de" | "it" | "pt" | "ar" | "tr" | "vi" | "th" | "id" | "ms" | "pl" | "sv" | "nl" | "el" | "cs" | "hu" | "ro" | "he" | "fa";
  
  export type Timezone = string;
  
  export type ResolutionString = "1" | "5" | "15" | "30" | "60" | "240" | "1D" | "1W" | "1M" | string;

  export interface DatafeedConfiguration {
    supported_resolutions?: ResolutionString[];
    exchanges?: Exchange[];
    symbols_types?: SymbolType[];
    supports_marks?: boolean;
    supports_timescale_marks?: boolean;
    supports_time?: boolean;
  }

  export interface Exchange {
    value: string;
    name: string;
    desc: string;
  }

  export interface SymbolType {
    name: string;
    value: string;
  }

  export interface LibrarySymbolInfo {
    ticker: string;
    name: string;
    description: string;
    type: string;
    session: string;
    timezone: string;
    exchange: string;
    minmov: number;
    pricescale: number;
    has_intraday: boolean;
    has_daily?: boolean;
    has_weekly_and_monthly?: boolean;
    supported_resolutions: ResolutionString[];
    volume_precision: number;
    data_status: string;
    full_name: string;
    listed_exchange: string;
    format: string;
  }

  export interface PeriodParams {
    from: number;
    to: number;
    firstDataRequest: boolean;
    countBack?: number;
  }

  export interface Bar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }

  export type OnReadyCallback = (configuration: DatafeedConfiguration) => void;
  export type SearchSymbolsCallback = (symbols: SearchSymbolResultItem[]) => void;
  export type ResolveCallback = (symbolInfo: LibrarySymbolInfo) => void;
  export type ErrorCallback = (reason: string) => void;
  export type HistoryCallback = (bars: Bar[], meta: { noData: boolean }) => void;
  export type SubscribeBarsCallback = (bar: Bar) => void;

  export interface SearchSymbolResultItem {
    symbol: string;
    full_name: string;
    description: string;
    exchange: string;
    type: string;
    ticker: string;
  }

  export interface IBasicDataFeed {
    onReady: (callback: OnReadyCallback) => void;
    searchSymbols: (
      userInput: string,
      exchange: string,
      symbolType: string,
      onResult: SearchSymbolsCallback
    ) => void;
    resolveSymbol: (
      symbolName: string,
      onResolve: ResolveCallback,
      onError: ErrorCallback
    ) => void;
    getBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      periodParams: PeriodParams,
      onResult: HistoryCallback,
      onError: ErrorCallback
    ) => void;
    subscribeBars: (
      symbolInfo: LibrarySymbolInfo,
      resolution: ResolutionString,
      onTick: SubscribeBarsCallback,
      listenerGuid: string,
      onResetCacheNeededCallback: () => void
    ) => void;
    unsubscribeBars: (listenerGuid: string) => void;
  }

  export class widget implements IChartingLibraryWidget {
    constructor(options: ChartingLibraryWidgetOptions);
    onChartReady(callback: () => void): void;
    remove(): void;
    chart(): IChartWidgetApi;
  }
}
