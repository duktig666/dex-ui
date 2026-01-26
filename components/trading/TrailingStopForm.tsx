'use client';

import { useState, useMemo, useCallback } from 'react';
import { useT } from '@/lib/i18n';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';
import { useAccountState, usePosition } from '@/hooks/useAccountState';
import { useAssetPrice } from '@/hooks/useMarketData';
import { formatPrice, formatSize } from '@/lib/hyperliquid/utils';
import { useCreateTrailingStop, useTrailingStopMonitor } from '@/hooks/useTrailingStop';
import { useTrailingStopStore } from '@/stores/trailingStopStore';
import { useCanSign } from '@/hooks/useNetworkCheck';

interface TrailingStopFormProps {
  symbol: string;
}

type OrderSide = 'buy' | 'sell';
type TrailType = 'percent' | 'price';

// 预设回撤百分比
const TRAIL_PERCENT_PRESETS = [1, 2, 3, 5, 10];

export function TrailingStopForm({ symbol }: TrailingStopFormProps) {
  const { t } = useT();
  const { isConnected } = useAccount();
  const canSign = useCanSign();

  const [side, setSide] = useState<OrderSide>('sell');
  const [amount, setAmount] = useState('');
  const [trailValue, setTrailValue] = useState('2');
  const [trailType, setTrailType] = useState<TrailType>('percent');
  const [reduceOnly, setReduceOnly] = useState(true);

  const coin = symbol.split('-')[0] || 'BTC';
  const quote = 'USDC';

  // Hooks
  const {} = useAccountState();
  const position = usePosition(coin);
  const { midPrice } = useAssetPrice(coin);
  const { createOrder } = useCreateTrailingStop();
  const { activeOrders } = useTrailingStopMonitor({ coin });
  const { cancelOrder, removeOrder } = useTrailingStopStore();

  // 计算触发价格示例
  const exampleTriggerPrice = useMemo(() => {
    if (!midPrice) return 0;
    const trail = parseFloat(trailValue) || 0;

    if (trailType === 'percent') {
      const trailPercent = trail / 100;
      if (side === 'sell') {
        // 追踪最高价，回落触发
        return midPrice * (1 - trailPercent);
      } else {
        // 追踪最低价，反弹触发
        return midPrice * (1 + trailPercent);
      }
    } else {
      if (side === 'sell') {
        return midPrice - trail;
      } else {
        return midPrice + trail;
      }
    }
  }, [midPrice, trailValue, trailType, side]);

  // 提交订单
  const handleSubmit = useCallback(() => {
    if (!isConnected || !canSign) return;

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const trailNum = parseFloat(trailValue);
    if (!trailNum || trailNum <= 0) {
      alert('Please enter a valid trail value');
      return;
    }

    createOrder({
      coin,
      side,
      size: amount,
      trailValue,
      trailType,
      reduceOnly,
    });

    // 清空表单
    setAmount('');
  }, [isConnected, canSign, amount, trailValue, trailType, side, reduceOnly, coin, createOrder]);

  // 使用持仓大小
  const usePositionSize = useCallback(() => {
    if (position) {
      const size = Math.abs(position.size);
      setAmount(size.toString());
    }
  }, [position]);

  // 按钮文本
  const buttonText = useMemo(() => {
    if (!isConnected) return t('Connect Wallet');
    if (!canSign) return t('Switch Network');
    return side === 'sell' ? t('Create Trailing Stop Sell') : t('Create Trailing Stop Buy');
  }, [isConnected, canSign, side, t]);

  return (
    <div className="flex flex-col h-full p-4 bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{t('Trailing Stop')}</h3>
        <span className="text-xs text-text-secondary">{t('Local Order')}</span>
      </div>

      {/* Side Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSide('sell')}
          className={cn(
            'flex-1 py-2 text-sm font-semibold rounded transition-colors',
            side === 'sell'
              ? 'bg-short text-white'
              : 'bg-bg-secondary text-text-secondary hover:text-white'
          )}
        >
          {t('Trailing Sell')}
        </button>
        <button
          onClick={() => setSide('buy')}
          className={cn(
            'flex-1 py-2 text-sm font-semibold rounded transition-colors',
            side === 'buy'
              ? 'bg-long text-white'
              : 'bg-bg-secondary text-text-secondary hover:text-white'
          )}
        >
          {t('Trailing Buy')}
        </button>
      </div>

      {/* Current Position */}
      {position && (
        <div className="flex items-center justify-between text-xs mb-4">
          <span className="text-text-secondary">{t('Current Position')}</span>
          <button
            onClick={usePositionSize}
            className={cn(
              'font-mono hover:underline',
              position.size > 0 ? 'text-long' : 'text-short'
            )}
          >
            {formatSize(position.size, 5)} {coin}
          </button>
        </div>
      )}

      {/* Size Input */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-secondary">{t('Size')}</span>
        </div>
        <div className="flex items-center bg-bg-secondary rounded overflow-hidden">
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            placeholder="0"
          />
          <span className="px-3 text-sm text-text-secondary">{coin}</span>
        </div>
      </div>

      {/* Trail Type */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-secondary">{t('Trail Type')}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTrailType('percent')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
              trailType === 'percent'
                ? 'bg-accent-yellow text-black'
                : 'bg-bg-secondary text-text-secondary hover:text-white'
            )}
          >
            {t('Percentage')}
          </button>
          <button
            onClick={() => setTrailType('price')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded transition-colors',
              trailType === 'price'
                ? 'bg-accent-yellow text-black'
                : 'bg-bg-secondary text-text-secondary hover:text-white'
            )}
          >
            {t('Price')}
          </button>
        </div>
      </div>

      {/* Trail Value */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-secondary">
            {t('Callback')} {trailType === 'percent' ? t('Rate') : t('Amount')}
          </span>
          {trailType === 'percent' && <span className="text-white">{trailValue}%</span>}
        </div>

        {/* Percentage Presets */}
        {trailType === 'percent' && (
          <div className="flex gap-1 mb-2">
            {TRAIL_PERCENT_PRESETS.map((pct) => (
              <button
                key={pct}
                onClick={() => setTrailValue(pct.toString())}
                className={cn(
                  'flex-1 py-1 text-xs font-medium rounded transition-colors',
                  trailValue === pct.toString()
                    ? 'bg-accent-yellow text-black'
                    : 'bg-bg-secondary text-text-secondary hover:text-white'
                )}
              >
                {pct}%
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center bg-bg-secondary rounded overflow-hidden">
          <input
            type="text"
            value={trailValue}
            onChange={(e) => setTrailValue(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-transparent text-white outline-none font-mono"
            placeholder="0"
          />
          <span className="px-3 text-sm text-text-secondary">
            {trailType === 'percent' ? '%' : quote}
          </span>
        </div>
      </div>

      {/* Reduce Only */}
      <label className="flex items-center gap-2 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={reduceOnly}
          onChange={(e) => setReduceOnly(e.target.checked)}
          className="w-4 h-4 accent-accent-yellow"
        />
        <span className="text-xs text-text-secondary">{t('Reduce Only')}</span>
      </label>

      {/* Order Info */}
      <div className="mb-4 p-3 bg-bg-secondary rounded text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-text-secondary">{t('Current Price')}</span>
          <span className="text-white">${formatPrice(midPrice, 2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">{t('Est. Trigger Price')}</span>
          <span className={side === 'sell' ? 'text-short' : 'text-long'}>
            ${formatPrice(exampleTriggerPrice, 2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">{t('Trail Direction')}</span>
          <span className="text-white">
            {side === 'sell' ? t('↑ Track High → Sell on Drop') : t('↓ Track Low → Buy on Rise')}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isConnected || !canSign || !amount || !trailValue}
        className={cn(
          'w-full py-3 text-sm font-semibold rounded transition-colors',
          side === 'sell'
            ? 'bg-short hover:bg-short/80 text-white'
            : 'bg-long hover:bg-long/80 text-white',
          (!isConnected || !canSign || !amount || !trailValue) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {buttonText}
      </button>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-text-secondary">{t('Active Trailing Stops')}</span>
            <span className="text-white">{activeOrders.length}</span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-2 bg-bg-secondary rounded text-xs"
              >
                <div>
                  <span className={order.side === 'sell' ? 'text-short' : 'text-long'}>
                    {order.side.toUpperCase()}
                  </span>
                  <span className="text-white ml-2">{formatSize(parseFloat(order.size), 5)}</span>
                  <span className="text-text-secondary ml-1">
                    @ {order.trailValue}
                    {order.trailType === 'percent' ? '%' : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    cancelOrder(order.id);
                    setTimeout(() => removeOrder(order.id), 100);
                  }}
                  className="text-text-secondary hover:text-short"
                >
                  {t('Cancel')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-text-secondary">
        <p className="mb-1">• Orders are stored locally in your browser</p>
        <p className="mb-1">• Keep this tab open for monitoring</p>
        <p>• Executes at market price when triggered</p>
      </div>
    </div>
  );
}
