'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { createHyperliquidDatafeed } from '@/lib/tradingview/hyperliquidDatafeed';
import {
  ENABLED_FEATURES,
  DISABLED_FEATURES,
  CHART_OVERRIDES,
  STUDIES_OVERRIDES,
} from '@/lib/tradingview/config';

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: TradingViewWidgetConfig) => TradingViewWidget;
    };
  }
}

interface TradingViewWidgetConfig {
  container: HTMLElement;
  datafeed: ReturnType<typeof createHyperliquidDatafeed>;
  symbol: string;
  interval: string;
  library_path: string;
  locale: string;
  fullscreen: boolean;
  autosize: boolean;
  theme: string;
  timezone: string;
  debug: boolean;
  enabled_features: string[];
  disabled_features: string[];
  overrides: Record<string, string | number | boolean>;
  studies_overrides: Record<string, string | number | boolean>;
  custom_css_url: string;
  loading_screen: {
    backgroundColor: string;
    foregroundColor: string;
  };
}

interface TradingViewWidget {
  remove: () => void;
  onChartReady: (callback: () => void) => void;
}

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
}

export default function TradingViewChart({
  symbol = 'BTCUSD',
  interval = '60',
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<TradingViewWidget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // 检查脚本是否已经加载（可能是之前的组件实例加载的）
  const [scriptLoaded, setScriptLoaded] = useState(() => typeof window !== 'undefined' && !!window.TradingView);
  const prevSymbolRef = useRef(symbol);

  useEffect(() => {
    if (!scriptLoaded || !chartContainerRef.current || !window.TradingView) {
      return;
    }

    // 如果 symbol 发生变化，显示加载状态
    if (prevSymbolRef.current !== symbol) {
      setIsLoading(true);
      prevSymbolRef.current = symbol;
    }

    // 如果已经有 widget，先移除
    if (widgetRef.current) {
      try {
        widgetRef.current.remove();
      } catch (e) {
        console.warn('Error removing widget:', e);
      }
      widgetRef.current = null;
    }

    // 每次创建新的 datafeed 实例
    const datafeed = createHyperliquidDatafeed();

    const widgetConfig: TradingViewWidgetConfig = {
      container: chartContainerRef.current,
      datafeed,
      symbol,
      interval,
      library_path: '/static/charting_library/',
      locale: 'en',
      fullscreen: false,
      autosize: true,
      theme: 'dark',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      debug: false,
      enabled_features: ENABLED_FEATURES,
      disabled_features: DISABLED_FEATURES,
      overrides: CHART_OVERRIDES,
      studies_overrides: STUDIES_OVERRIDES,
      custom_css_url: '/tradingview-chart.css',
      loading_screen: {
        backgroundColor: '#0b0e11',
        foregroundColor: '#f7a600',
      },
    };

    try {
      widgetRef.current = new window.TradingView.widget(widgetConfig);
      widgetRef.current.onChartReady(() => {
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error creating TradingView widget:', error);
      setIsLoading(false);
    }

    return () => {
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          console.warn('Error removing widget on cleanup:', e);
        }
        widgetRef.current = null;
      }
    };
  }, [scriptLoaded, symbol, interval]);

  return (
    <div className="relative w-full h-full bg-[#0b0e11]">
      <Script
        src="/static/charting_library/charting_library.standalone.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={(e) => {
          console.error('Failed to load TradingView library:', e);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0e11] z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#f7a600] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#848e9c] text-sm">Loading chart...</span>
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
