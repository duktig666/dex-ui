'use client';

import { useState, useEffect, useMemo } from 'react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAssetPrice, useAssetList } from '@/hooks/useMarketData';
import { useHyperliquid } from '@/components/providers/HyperliquidProvider';
import { formatPrice, formatCompact } from '@/lib/hyperliquid/utils';
import { TokenSelector } from './TokenSelector';

interface PriceTickerProps {
  coin: string;
  price: number;
  change: number;
  active?: boolean;
  onClick?: () => void;
}

// 主流代币涨跌幅组件 - 参照 based.one 风格
function PriceTicker({ coin, price, change, active, onClick }: PriceTickerProps) {
  const isPositive = change >= 0;
  const priceDecimals =
    price >= 10000 ? 1 : price >= 1000 ? 1 : price >= 100 ? 2 : price >= 10 ? 4 : 6;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 transition-colors cursor-pointer',
        'hover:bg-bg-secondary/70',
        active ? 'bg-bg-secondary' : 'bg-transparent'
      )}
    >
      {/* 涨跌幅 */}
      <span
        className={cn('text-xs font-medium min-w-[52px]', isPositive ? 'text-long' : 'text-short')}
      >
        {isPositive ? '+' : ''}
        {change.toFixed(2)}%
      </span>
      {/* 代币名称 */}
      <span className="text-white font-medium text-sm">{coin}</span>
      <span className="text-text-secondary text-sm">-USDC</span>
      {/* 价格 */}
      <span className="text-white font-mono text-sm ml-1">{formatPrice(price, priceDecimals)}</span>
    </button>
  );
}

// 骨架屏组件
function PriceTickerSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 animate-pulse">
      <div className="w-12 h-4 bg-bg-secondary rounded" />
      <div className="w-16 h-4 bg-bg-secondary rounded" />
      <div className="w-16 h-4 bg-bg-secondary rounded" />
    </div>
  );
}

// 倒计时 Hook
function useFundingCountdown() {
  const [countdown, setCountdown] = useState('00:00');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const hours = now.getUTCHours();
      // 资金费率每8小时结算一次 (0:00, 8:00, 16:00 UTC)
      const nextSettlement = Math.ceil((hours + 1) / 8) * 8;
      const hoursLeft = nextSettlement - hours - 1;
      const minutesLeft = 59 - now.getUTCMinutes();
      const secondsLeft = 59 - now.getUTCSeconds();

      // 简化显示格式
      if (hoursLeft > 0) {
        setCountdown(
          `${hoursLeft}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`
        );
      } else {
        setCountdown(
          `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return countdown;
}

interface PriceBarProps {
  symbol?: string;
  onSymbolChange?: (symbol: string) => void;
}

export function PriceBar({ symbol, onSymbolChange }: PriceBarProps) {
  const { t } = useT();
  // 使用 HyperliquidContext 管理当前币种
  const { currentCoin, setCoin } = useHyperliquid();
  const coin = symbol?.split('-')[0] || currentCoin || 'BTC';

  // 处理币种切换
  const handleSymbolChange = (newSymbol: string) => {
    const newCoin = newSymbol.split('-')[0];
    setCoin(newCoin);
    onSymbolChange?.(newSymbol);
  };

  // 获取当前交易对数据
  const {
    midPrice,
    markPrice,
    oraclePrice,
    priceChangePercent,
    fundingPercent,
    openInterest,
    dayVolume,
  } = useAssetPrice(coin);

  // 获取热门交易对列表 - 按交易量排序取前3个
  const assets = useAssetList();
  const topAssets = useMemo(() => {
    if (!assets || assets.length === 0) return [];
    // 按24h交易量排序，取前3个（参照 based.one 风格）
    return [...assets].sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, 3);
  }, [assets]);

  const fundingCountdown = useFundingCountdown();
  const isLoading = assets.length === 0;

  // 计算24h变化金额
  const change24h = midPrice * (priceChangePercent / 100);

  // 价格精度
  const priceDecimals =
    midPrice >= 10000 ? 0 : midPrice >= 1000 ? 1 : midPrice >= 100 ? 2 : midPrice >= 10 ? 3 : 4;

  return (
    <div className="flex flex-col bg-bg-primary border-b border-border-color">
      {/* 第一行: 主流代币涨跌幅 */}
      <div className="h-10 flex items-center px-4">
        {/* 主流代币涨跌幅 */}
        <div className="flex items-center">
          {isLoading ? (
            <>
              <PriceTickerSkeleton />
              <PriceTickerSkeleton />
              <PriceTickerSkeleton />
            </>
          ) : (
            topAssets.map((asset) => (
              <PriceTicker
                key={asset.name}
                coin={asset.name}
                price={asset.price}
                change={asset.priceChange * 100}
                active={asset.name === coin}
                onClick={() => handleSymbolChange(`${asset.name}-USDC`)}
              />
            ))
          )}
        </div>
      </div>

      {/* 第二行: TokenSelector（左） + 当前交易对详情（右） */}
      <div className="h-12 flex items-center px-4 gap-8 border-t border-border-color/50">
        {/* Left: TokenSelector 代币选择器 */}
        <TokenSelector />

        {/* Mark Price */}
        <div className="flex flex-col">
          <span className="text-text-secondary text-xs">{t('Mark')}</span>
          <span className="text-white font-mono text-sm">
            {formatPrice(markPrice, priceDecimals)}
          </span>
        </div>

        {/* 24h Change */}
        <div className="flex flex-col">
          <span className="text-text-secondary text-xs">{t('24h Change')}</span>
          <span
            className={cn(
              'font-mono text-sm',
              priceChangePercent >= 0 ? 'text-long' : 'text-short'
            )}
          >
            {change24h >= 0 ? '+' : ''}
            {formatPrice(Math.abs(change24h), priceDecimals)} / {priceChangePercent >= 0 ? '+' : ''}
            {priceChangePercent.toFixed(2)}%
          </span>
        </div>

        {/* 24h Volume */}
        <div className="flex flex-col">
          <span className="text-text-secondary text-xs">{t('24h Vol')}</span>
          <span className="text-white font-mono text-sm">${formatCompact(dayVolume)}</span>
        </div>

        {/* Open Interest */}
        <div className="flex flex-col">
          <span className="text-text-secondary text-xs">{t('Open Interest')}</span>
          <span className="text-white font-mono text-sm">${formatCompact(openInterest)}</span>
        </div>

        {/* Oracle Price */}
        <div className="flex flex-col">
          <span className="text-text-secondary text-xs">{t('Oracle')}</span>
          <span className="text-white font-mono text-sm">
            {formatPrice(oraclePrice, priceDecimals)}
          </span>
        </div>

        {/* Funding / Countdown */}
        <div className="flex flex-col">
          <span className="text-text-secondary text-xs">{t('Funding / Countdown')}</span>
          <span
            className={cn('font-mono text-sm', fundingPercent >= 0 ? 'text-long' : 'text-short')}
          >
            {fundingPercent >= 0 ? '+' : ''}
            {fundingPercent.toFixed(4)}% / {fundingCountdown}
          </span>
        </div>
      </div>
    </div>
  );
}
