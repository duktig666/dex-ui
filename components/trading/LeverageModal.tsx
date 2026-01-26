'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useT } from '@/lib/i18n';
import { useAccount, useSignTypedData } from 'wagmi';
import { cn } from '@/lib/utils';
import { useLeverage, usePosition } from '@/hooks/useAccountState';
import { useAssetPrice, useAssetList } from '@/hooks/useMarketData';
import { exchangeClient } from '@/lib/hyperliquid/client';
import { formatPrice } from '@/lib/hyperliquid/utils';
import { useCanSign } from '@/hooks/useNetworkCheck';

interface LeverageModalProps {
  coin: string;
  isOpen: boolean;
  onClose: () => void;
  maxLeverage?: number;
}

type MarginMode = 'cross' | 'isolated';

// 杠杆快捷选项
const LEVERAGE_PRESETS = [1, 2, 5, 10, 20, 50, 100];

export function LeverageModal({ coin, isOpen, onClose, maxLeverage = 100 }: LeverageModalProps) {
  const { t } = useT();
  const { isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const canSign = useCanSign();
  const assetList = useAssetList();

  const { leverage: currentLeverage, isCross: isCurrentCross } = useLeverage(coin);
  const position = usePosition(coin);
  const { markPrice } = useAssetPrice(coin);

  const [marginMode, setMarginMode] = useState<MarginMode>('cross');
  const [leverageValue, setLeverageValue] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取资产信息
  const assetInfo = useMemo(() => {
    return assetList.find((a) => a.name === coin);
  }, [assetList, coin]);

  const assetId = assetInfo?.assetId ?? 0;
  const actualMaxLeverage = assetInfo?.maxLeverage ?? maxLeverage;

  // 初始化值
  useEffect(() => {
    if (currentLeverage) {
      setLeverageValue(currentLeverage);
    }
    setMarginMode(isCurrentCross ? 'cross' : 'isolated');
  }, [currentLeverage, isCurrentCross, isOpen]);

  // 计算估算强平价格
  const estimatedLiquidationPrice = useMemo(() => {
    if (!position || !markPrice) return null;

    const entryPrice = position.entryPrice;
    const isLong = position.size > 0;

    // 简化计算
    const maintenanceMargin = 0.005; // 0.5%
    const marginRatio = 1 / leverageValue;

    if (isLong) {
      return entryPrice * (1 - marginRatio + maintenanceMargin);
    } else {
      return entryPrice * (1 + marginRatio - maintenanceMargin);
    }
  }, [position, markPrice, leverageValue]);

  // 可用杠杆列表（过滤掉超过最大值的）
  const availablePresets = useMemo(() => {
    return LEVERAGE_PRESETS.filter((l) => l <= actualMaxLeverage);
  }, [actualMaxLeverage]);

  // 提交杠杆更改
  const handleSubmit = useCallback(async () => {
    if (!isConnected || !canSign) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await exchangeClient.updateLeverage(
        assetId,
        leverageValue,
        marginMode === 'cross',
        async (params) => {
          const signature = await signTypedDataAsync({
            domain: params.domain as {
              name: string;
              version: string;
              chainId: number;
              verifyingContract: `0x${string}`;
            },
            types: params.types as Record<string, { name: string; type: string }[]>,
            primaryType: params.primaryType,
            message: params.message,
          });
          return signature;
        }
      );

      if (result.status === 'ok') {
        onClose();
      } else {
        setError('Failed to update leverage');
      }
    } catch (err) {
      console.error('Update leverage error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, canSign, assetId, leverageValue, marginMode, signTypedDataAsync, onClose]);

  // 如果未打开，不渲染
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bg-secondary rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{t('Adjust Leverage')}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Coin Info */}
        <div className="flex items-center justify-between mb-4 p-3 bg-bg-primary rounded">
          <span className="text-text-secondary">{t('Pair')}</span>
          <span className="text-white font-semibold">{coin}/USDC</span>
        </div>

        {/* Margin Mode */}
        <div className="mb-6">
          <label className="block text-sm text-text-secondary mb-2">{t('Margin Mode')}</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMarginMode('cross')}
              className={cn(
                'flex-1 py-3 text-sm font-medium rounded transition-colors',
                marginMode === 'cross'
                  ? 'bg-accent-yellow text-black'
                  : 'bg-bg-primary text-text-secondary hover:text-white'
              )}
            >
              {t('Cross')}
            </button>
            <button
              onClick={() => setMarginMode('isolated')}
              className={cn(
                'flex-1 py-3 text-sm font-medium rounded transition-colors',
                marginMode === 'isolated'
                  ? 'bg-accent-yellow text-black'
                  : 'bg-bg-primary text-text-secondary hover:text-white'
              )}
            >
              {t('Isolated')}
            </button>
          </div>
        </div>

        {/* Leverage Value Display */}
        <div className="mb-4 text-center">
          <span className="text-4xl font-bold text-accent-yellow">{leverageValue}x</span>
        </div>

        {/* Leverage Slider */}
        <div className="mb-4">
          <input
            type="range"
            min="1"
            max={actualMaxLeverage}
            step="1"
            value={leverageValue}
            onChange={(e) => setLeverageValue(Number(e.target.value))}
            className="w-full h-2 bg-bg-primary rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:bg-accent-yellow
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>1x</span>
            <span>{actualMaxLeverage}x</span>
          </div>
        </div>

        {/* Leverage Presets */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {availablePresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setLeverageValue(preset)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded transition-colors',
                  leverageValue === preset
                    ? 'bg-accent-yellow text-black'
                    : 'bg-bg-primary text-text-secondary hover:text-white'
                )}
              >
                {preset}x
              </button>
            ))}
          </div>
        </div>

        {/* Position Info */}
        {position && (
          <div className="mb-4 p-3 bg-bg-primary rounded text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-text-secondary">{t('Position Size')}</span>
              <span className={cn('font-mono', position.size > 0 ? 'text-long' : 'text-short')}>
                {formatPrice(Math.abs(position.size), 4)} {coin}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{t('Entry Price')}</span>
              <span className="text-white font-mono">${formatPrice(position.entryPrice, 2)}</span>
            </div>
            {estimatedLiquidationPrice && (
              <div className="flex justify-between">
                <span className="text-text-secondary">{t('Est. Liq. Price')}</span>
                <span className="text-short font-mono">
                  ${formatPrice(estimatedLiquidationPrice, 2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Warning */}
        <div className="mb-4 p-3 bg-short/10 border border-short/30 rounded text-xs text-short">
          <p>
            ⚠️{' '}
            {t(
              'Higher leverage increases both potential profit and risk of liquidation. Trade responsibly.'
            )}
          </p>
        </div>

        {/* Error */}
        {error && <div className="mb-4 text-sm text-short">{error}</div>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold rounded bg-bg-primary text-white hover:bg-bg-primary/80 transition-colors"
          >
            {t('Cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isConnected || !canSign || isSubmitting}
            className={cn(
              'flex-1 py-3 text-sm font-semibold rounded transition-colors',
              'bg-accent-yellow text-black hover:bg-accent-yellow/80',
              (!isConnected || !canSign || isSubmitting) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? t('Updating...') : t('Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing leverage modal state
export function useLeverageModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  const openModal = useCallback((coin: string) => {
    setSelectedCoin(coin);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    selectedCoin,
    openModal,
    closeModal,
  };
}
