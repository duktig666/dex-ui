import type { ResolutionString } from '@/public/static/charting_library/charting_library';
import type { ColorTokens } from '@/lib/theme/tokens';

// Supported time resolutions
export const SUPPORTED_RESOLUTIONS: Record<string, string> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1H',
  '240': '4H',
  '1D': '1D',
  '1W': '1W',
  '1M': '1M',
};

export const DEFAULT_RESOLUTION = '60' as ResolutionString;

// Features to enable
export const ENABLED_FEATURES: string[] = [
  'study_templates',
  'side_toolbar_in_fullscreen_mode',
  'header_in_fullscreen_mode',
  'hide_left_toolbar_by_default',
  'move_logo_to_main_pane',
  'create_volume_indicator_by_default',
];

// Features to disable
export const DISABLED_FEATURES: string[] = [
  'header_symbol_search',
  'header_compare',
  'header_screenshot',
  'header_saveload',
  'use_localstorage_for_settings',
  'save_chart_properties_to_local_storage',
  'main_series_scale_menu',
  'display_market_status',
  'show_logo_on_all_charts',
  'caption_buttons_text_if_possible',
  'header_settings',
  'header_fullscreen_button',
  'header_undo_redo',
  'left_toolbar',
  'control_bar',
  'timeframes_toolbar',
  'legend_context_menu',
  'show_hide_button_in_legend',
  'format_button_in_legend',
  'edit_buttons_in_legend',
  'delete_button_in_legend',
];

// 动态生成图表颜色配置
export function getChartOverrides(colors: ColorTokens) {
  return {
    'paneProperties.background': colors.bgPrimary,
    'paneProperties.backgroundType': 'solid',
    'paneProperties.vertGridProperties.color': colors.borderColor,
    'paneProperties.horzGridProperties.color': colors.borderColor,
    'paneProperties.crossHairProperties.color': colors.textSecondary,
    'scalesProperties.backgroundColor': colors.bgPrimary,
    'scalesProperties.lineColor': colors.borderColor,
    'scalesProperties.textColor': colors.textSecondary,
    'mainSeriesProperties.candleStyle.upColor': colors.long,
    'mainSeriesProperties.candleStyle.downColor': colors.short,
    'mainSeriesProperties.candleStyle.borderUpColor': colors.long,
    'mainSeriesProperties.candleStyle.borderDownColor': colors.short,
    'mainSeriesProperties.candleStyle.wickUpColor': colors.long,
    'mainSeriesProperties.candleStyle.wickDownColor': colors.short,
    volumePaneSize: 'medium',
  };
}

// 动态生成 Studies 颜色配置
export function getStudiesOverrides(colors: ColorTokens) {
  // 将 hex 转为 rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return {
    'volume.volume.color.0': hexToRgba(colors.short, 0.5),
    'volume.volume.color.1': hexToRgba(colors.long, 0.5),
    'volume.volume.transparency': 50,
    'volume.volume ma.color': colors.accentBlue,
    'volume.volume ma.transparency': 0,
    'volume.volume ma.linewidth': 1,
  };
}

// 动态生成加载屏幕配置
export function getLoadingScreenConfig(colors: ColorTokens) {
  return {
    backgroundColor: colors.bgPrimary,
    foregroundColor: colors.accentBlue,
  };
}

// 静态默认配置（用于向后兼容）
export const CHART_OVERRIDES = {
  'paneProperties.background': '#0b0e11',
  'paneProperties.backgroundType': 'solid',
  'paneProperties.vertGridProperties.color': '#1a1d26',
  'paneProperties.horzGridProperties.color': '#1a1d26',
  'paneProperties.crossHairProperties.color': '#848e9c',
  'scalesProperties.backgroundColor': '#0b0e11',
  'scalesProperties.lineColor': '#1a1d26',
  'scalesProperties.textColor': '#848e9c',
  'mainSeriesProperties.candleStyle.upColor': '#0ecb81',
  'mainSeriesProperties.candleStyle.downColor': '#f6465d',
  'mainSeriesProperties.candleStyle.borderUpColor': '#0ecb81',
  'mainSeriesProperties.candleStyle.borderDownColor': '#f6465d',
  'mainSeriesProperties.candleStyle.wickUpColor': '#0ecb81',
  'mainSeriesProperties.candleStyle.wickDownColor': '#f6465d',
  volumePaneSize: 'medium',
};

// 静态默认配置（用于向后兼容）
export const STUDIES_OVERRIDES = {
  'volume.volume.color.0': 'rgba(246, 70, 93, 0.5)',
  'volume.volume.color.1': 'rgba(14, 203, 129, 0.5)',
  'volume.volume.transparency': 50,
  'volume.volume ma.color': '#2962ff',
  'volume.volume ma.transparency': 0,
  'volume.volume ma.linewidth': 1,
};

// Available symbols
export const AVAILABLE_SYMBOLS = [
  {
    symbol: 'BTC-USDC',
    full_name: 'BTC-USDC',
    description: 'Bitcoin / USDC',
    exchange: 'HERMES',
    type: 'crypto',
    ticker: 'BTC-USDC',
  },
  {
    symbol: 'ETH-USDC',
    full_name: 'ETH-USDC',
    description: 'Ethereum / USDC',
    exchange: 'HERMES',
    type: 'crypto',
    ticker: 'ETH-USDC',
  },
  {
    symbol: 'HYPE-USDC',
    full_name: 'HYPE-USDC',
    description: 'Hyperliquid / USDC',
    exchange: 'HERMES',
    type: 'crypto',
    ticker: 'HYPE-USDC',
  },
  {
    symbol: 'SOL-USDC',
    full_name: 'SOL-USDC',
    description: 'Solana / USDC',
    exchange: 'HERMES',
    type: 'crypto',
    ticker: 'SOL-USDC',
  },
];
