'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useT } from '@/lib/i18n';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import {
  useTrading,
  type OrderSide as TradingOrderSide,
  type OrderType as TradingOrderType,
} from '@/hooks/useTrading';
import { useAccountState, usePosition, useLeverage } from '@/hooks/useAccountState';
import { useAssetPrice } from '@/hooks/useMarketData';
import { useBestPrices } from '@/hooks/useOrderBook';
import {
  formatPrice,
  formatSize,
  calcNotionalValue,
  calcRequiredMargin,
} from '@/lib/hyperliquid/utils';
import type { TIF } from '@/lib/hyperliquid/types';
import { LeverageModal, useLeverageModal } from './LeverageModal';

interface TradeFormProps {
  symbol: string;
}

type OrderSide = 'buy' | 'sell';
type OrderType = 'limit' | 'market' | 'stop-limit';
type MarginMode = 'cross' | 'isolated';
type TimeInForce = 'gtc' | 'ioc' | 'alo';

export function TradeForm({ symbol }: TradeFormProps) {
  const { t } = useT();
  const { isConnected } = useAccount();
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [marginMode, setMarginMode] = useState<MarginMode>('cross');
  const [leverageValue, setLeverageValue] = useState(10);
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [tpsl, setTpsl] = useState(false);
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('gtc');

  const coin = symbol.split('-')[0] || 'BTC';
  const quote = 'USDC';

  // Leverage Modal
  const {
    isOpen: isLeverageModalOpen,
    openModal: openLeverageModal,
    closeModal: closeLeverageModal,
  } = useLeverageModal();

  // Hooks
  const { placeOrder, updateLeverage, isSubmitting, lastError, builderFeeApproved } = useTrading();
  const { availableBalance } = useAccountState();
  const position = usePosition(coin);
  const { leverage: currentLeverage, isCross } = useLeverage(coin);
  const { midPrice } = useAssetPrice(coin);
  const { bestBid, bestAsk } = useBestPrices(coin);

  // 价格精度
  const priceDecimals = useMemo(() => {
    if (midPrice >= 10000) return 1;
    if (midPrice >= 1000) return 2;
    if (midPrice >= 100) return 3;
    if (midPrice >= 10) return 4;
    return 5;
  }, [midPrice]);

  // 初始化杠杆
  useEffect(() => {
    if (currentLeverage) {
      setLeverageValue(currentLeverage);
      setMarginMode(isCross ? 'cross' : 'isolated');
    }
  }, [currentLeverage, isCross]);

  // 当价格为空时，自动填入当前价格
  useEffect(() => {
    if (!price && midPrice > 0 && orderType === 'limit') {
      setPrice(formatPrice(midPrice, priceDecimals));
    }
  }, [midPrice, price, priceDecimals, orderType]);

  // 计算订单价值和保证金
  const orderValue = useMemo(() => {
    const priceNum = orderType === 'market' ? midPrice : parseFloat(price) || 0;
    const amountNum = parseFloat(amount) || 0;
    return calcNotionalValue(priceNum, amountNum);
  }, [price, amount, midPrice, orderType]);

  const marginRequired = useMemo(() => {
    return calcRequiredMargin(orderValue, leverageValue);
  }, [orderValue, leverageValue]);

  // 估算强平价格
  const estLiqPrice = useMemo(() => {
    if (!position && marginRequired <= 0) return 0;
    const entryPrice = orderType === 'market' ? midPrice : parseFloat(price) || 0;
    if (entryPrice <= 0) return 0;

    // 简化计算：强平价格 = 入场价 * (1 - 1/杠杆) for long, (1 + 1/杠杆) for short
    const margin = 1 / leverageValue;
    if (side === 'buy') {
      return entryPrice * (1 - margin * 0.9); // 0.9 是维持保证金系数
    } else {
      return entryPrice * (1 + margin * 0.9);
    }
  }, [position, marginRequired, price, midPrice, leverageValue, side, orderType]);

  // 设置百分比
  const handlePercentageClick = useCallback(
    (pct: number) => {
      setPercentage(pct);
      if (availableBalance > 0 && midPrice > 0) {
        const maxNotional = availableBalance * leverageValue * (pct / 100);
        const maxSize = maxNotional / midPrice;
        setAmount(formatSize(maxSize, 5));
        setTotal(formatPrice(maxNotional, 2));
      }
    },
    [availableBalance, leverageValue, midPrice]
  );

  // 金额变化时更新 total
  useEffect(() => {
    const priceNum = orderType === 'market' ? midPrice : parseFloat(price) || 0;
    const amountNum = parseFloat(amount) || 0;
    if (priceNum > 0 && amountNum > 0) {
      setTotal(formatPrice(priceNum * amountNum, 2));
    }
  }, [amount, price, midPrice, orderType]);

  // 设置 Bid/Ask 价格
  const handleSetBid = () => {
    if (bestBid) setPrice(formatPrice(bestBid, priceDecimals));
  };
  const handleSetAsk = () => {
    if (bestAsk) setPrice(formatPrice(bestAsk, priceDecimals));
  };

  // 提交订单
  const handleSubmit = async () => {
    if (!isConnected) return;

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      alert(t('Please enter a valid amount'));
      return;
    }

    if (orderType === 'limit') {
      const priceNum = parseFloat(price);
      if (!priceNum || priceNum <= 0) {
        alert(t('Please enter a valid price'));
        return;
      }
    }

    // 转换 TIF
    const tifMap: Record<TimeInForce, TIF> = {
      gtc: 'Gtc',
      ioc: 'Ioc',
      alo: 'Alo',
    };

    const result = await placeOrder({
      coin,
      side: side as TradingOrderSide,
      orderType: orderType === 'stop-limit' ? 'limit' : (orderType as TradingOrderType),
      size: amountNum,
      price: orderType === 'market' ? undefined : parseFloat(price),
      reduceOnly,
      tif: tifMap[timeInForce],
      slippagePercent: 1,
    });

    if (result.success) {
      // 清空表单
      setAmount('');
      setTotal('');
      setPercentage(0);
    } else {
      alert(result.error || t('Order failed'));
    }
  };

  // 更新杠杆
  const _handleLeverageChange = async (newLeverage: number) => {
    setLeverageValue(newLeverage);
    if (isConnected) {
      await updateLeverage(coin, newLeverage, marginMode === 'cross');
    }
  };

  // 按钮文本
  const buttonText = useMemo(() => {
    if (!isConnected) return t('Connect Wallet');
    if (isSubmitting) return t('Submitting...');
    if (!builderFeeApproved)
      return t('Approve') + ' & ' + (side === 'buy' ? t('Buy / Long') : t('Sell / Short'));
    return side === 'buy' ? t('Buy / Long') : t('Sell / Short');
  }, [isConnected, isSubmitting, builderFeeApproved, side, t]);

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Margin Mode & Leverage - Compact Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-color">
        <div className="flex items-center bg-bg-secondary rounded overflow-hidden">
          <button
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              marginMode === 'cross'
                ? 'bg-bg-hover text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
            onClick={() => setMarginMode('cross')}
          >
            {t('Cross')}
          </button>
          <button
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              marginMode === 'isolated'
                ? 'bg-bg-hover text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
            onClick={() => setMarginMode('isolated')}
          >
            {t('Isolated')}
          </button>
        </div>
        <button
          onClick={() => openLeverageModal(coin)}
          className="px-3 py-1.5 text-xs font-medium bg-bg-secondary text-accent-yellow rounded hover:bg-bg-hover transition-colors"
        >
          {leverageValue}x
        </button>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as OrderType)}
          className="ml-auto px-2 py-1.5 text-xs bg-bg-secondary text-text-primary rounded border-none outline-none cursor-pointer"
        >
          <option value="limit">{t('Limit')}</option>
          <option value="market">{t('Market')}</option>
          <option value="stop-limit">{t('Stop Limit')}</option>
        </select>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {/* Buy/Sell Toggle - Full Width */}
        <div className="flex gap-1">
          <button
            onClick={() => setSide('buy')}
            className={cn(
              'flex-1 py-2.5 text-sm font-semibold rounded-l transition-colors',
              side === 'buy'
                ? 'bg-long text-text-primary'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            )}
          >
            {t('Buy / Long')}
          </button>
          <button
            onClick={() => setSide('sell')}
            className={cn(
              'flex-1 py-2.5 text-sm font-semibold rounded-r transition-colors',
              side === 'sell'
                ? 'bg-short text-text-primary'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
            )}
          >
            {t('Sell / Short')}
          </button>
        </div>

        {/* Account Info Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-text-secondary">{t('Available')}:</span>
            <span className="text-text-primary font-mono">
              {formatPrice(availableBalance, 2)} {quote}
            </span>
          </div>
          {position && (
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">{t('Position')}:</span>
              <span className={cn('font-mono', position.size > 0 ? 'text-long' : 'text-short')}>
                {formatSize(position.size, 4)} {coin}
              </span>
            </div>
          )}
        </div>

        {/* Price Input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{t('Price')}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSetBid}
                className="text-text-secondary hover:text-long transition-colors"
              >
                Bid
              </button>
              <span className="text-bg-hover">|</span>
              <button
                onClick={handleSetAsk}
                className="text-text-secondary hover:text-short transition-colors"
              >
                Ask
              </button>
            </div>
          </div>
          <div className="flex items-center bg-bg-secondary rounded overflow-hidden h-10">
            <input
              type="text"
              value={orderType === 'market' ? t('Market Price') : price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 px-3 text-sm bg-transparent text-text-primary outline-none font-mono"
              placeholder="0.00"
              disabled={orderType === 'market'}
            />
            <span className="px-3 text-xs text-text-secondary font-medium">{quote}</span>
          </div>
        </div>

        {/* Size Inputs - Side by Side */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-xs text-text-secondary">{t('Amount')}</span>
            <div className="flex items-center bg-bg-secondary rounded overflow-hidden h-10">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 text-sm bg-transparent text-text-primary outline-none font-mono min-w-0"
                placeholder="0.00"
              />
              <span className="px-2 text-xs text-text-secondary font-medium">{coin}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-text-secondary">{t('Total')}</span>
            <div className="flex items-center bg-bg-secondary rounded overflow-hidden h-10">
              <input
                type="text"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="flex-1 px-3 text-sm bg-transparent text-text-primary outline-none font-mono min-w-0"
                placeholder="0.00"
              />
              <span className="px-2 text-xs text-text-secondary font-medium">{quote}</span>
            </div>
          </div>
        </div>

        {/* Percentage Slider with Markers */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => handlePercentageClick(Number(e.target.value))}
              className="w-full h-1.5 bg-bg-secondary rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:bg-accent-yellow
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            {/* Slider Markers */}
            <div className="absolute top-0 left-0 right-0 h-1.5 pointer-events-none">
              {[0, 25, 50, 75, 100].map((mark) => (
                <div
                  key={mark}
                  className={cn(
                    'absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 top-0',
                    percentage >= mark ? 'bg-accent-yellow' : 'bg-bg-hover'
                  )}
                  style={{ left: `${mark}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            {[0, 25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentageClick(pct)}
                className={cn(
                  'text-xs transition-colors',
                  percentage === pct
                    ? 'text-accent-yellow'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Options Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={reduceOnly}
                onChange={(e) => setReduceOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-accent-yellow"
              />
              <span className="text-xs text-text-secondary">{t('Reduce Only')}</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tpsl}
                onChange={(e) => setTpsl(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-accent-yellow"
              />
              <span className="text-xs text-text-secondary">{t('TP/SL')}</span>
            </label>
          </div>
          <select
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value as TimeInForce)}
            className="px-2 py-1 text-xs bg-bg-secondary text-text-secondary rounded border-none outline-none cursor-pointer"
          >
            <option value="gtc">{t('GTC')}</option>
            <option value="ioc">{t('IOC')}</option>
            <option value="alo">{t('Post Only')}</option>
          </select>
        </div>
      </div>

      {/* Submit Section - Fixed at Bottom */}
      <div className="px-4 py-3 border-t border-border-color space-y-3">
        {/* Order Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-bg-secondary rounded">
            <div className="text-text-secondary mb-0.5">{t('Order Value')}</div>
            <div className="text-text-primary font-mono">${formatPrice(orderValue, 2)}</div>
          </div>
          <div className="text-center p-2 bg-bg-secondary rounded">
            <div className="text-text-secondary mb-0.5">{t('Margin')}</div>
            <div className="text-text-primary font-mono">${formatPrice(marginRequired, 2)}</div>
          </div>
          <div className="text-center p-2 bg-bg-secondary rounded">
            <div className="text-text-secondary mb-0.5">{t('Est. Liq')}</div>
            <div className="text-short font-mono">${formatPrice(estLiqPrice, 2)}</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!isConnected ? false : !amount)}
          className={cn(
            'w-full py-3.5 text-sm font-semibold rounded transition-colors disabled:opacity-50',
            side === 'buy'
              ? 'bg-long hover:bg-long/90 text-text-primary'
              : 'bg-short hover:bg-short/90 text-text-primary'
          )}
        >
          {buttonText}
        </button>

        {/* Error display */}
        {lastError && (
          <div className="p-2 bg-short/20 text-short text-xs rounded text-center">{lastError}</div>
        )}
      </div>

      {/* Leverage Modal */}
      <LeverageModal
        coin={coin}
        isOpen={isLeverageModalOpen}
        onClose={closeLeverageModal}
        maxLeverage={50}
      />
    </div>
  );
}
