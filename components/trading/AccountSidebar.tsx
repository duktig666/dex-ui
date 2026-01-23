'use client';

import { useMemo } from 'react';
import { useT } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAccountState } from '@/hooks/useAccountState';
export function AccountSidebar() {
  const { t } = useT();
  const { marginSummary, accountValue, totalUnrealizedPnl, totalMarginUsed } = useAccountState();

  // 计算账户数据
  const accountData = useMemo(() => {
    if (!marginSummary) {
      return {
        spotEquity: 0,
        perpsEquity: 0,
        balance: 0,
        unrealizedPnl: 0,
        crossMarginRatio: 0,
        maintenanceMargin: 0,
        crossAccountLeverage: 0,
      };
    }

    const perpsEquity = accountValue;
    const balance = accountValue;
    const totalNotional = parseFloat(marginSummary.totalNtlPos || '0');

    // 保证金率 = 账户价值 / 维持保证金
    const crossMarginRatio = totalMarginUsed > 0 ? (perpsEquity / totalMarginUsed) * 100 : 0;

    // 账户杠杆 = 总名义价值 / 账户价值
    const crossAccountLeverage = perpsEquity > 0 ? totalNotional / perpsEquity : 0;

    return {
      spotEquity: 0, // Spot 暂时不支持
      perpsEquity,
      balance,
      unrealizedPnl: totalUnrealizedPnl,
      crossMarginRatio,
      maintenanceMargin: totalMarginUsed,
      crossAccountLeverage,
    };
  }, [marginSummary, accountValue, totalUnrealizedPnl, totalMarginUsed]);

  return (
    <div className="p-4 bg-bg-primary">
      {/* Deposit/Withdraw Buttons */}
      <div className="flex gap-2 mb-4">
        <select className="flex-1 px-2 py-1 text-xs bg-bg-secondary text-white rounded outline-none cursor-pointer">
          <option>BTC</option>
          <option>ETH</option>
          <option>USDC</option>
        </select>
        <select className="w-12 px-2 py-1 text-xs bg-bg-secondary text-white rounded outline-none cursor-pointer">
          <option>1</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <button className="flex-1 py-2 text-sm font-medium bg-long text-white rounded hover:bg-long/90 transition-colors">
          {t('Deposit')}
        </button>
        <button className="flex-1 py-2 text-sm font-medium bg-bg-secondary text-white rounded hover:bg-bg-secondary/80 transition-colors">
          {t('Perps (Core) Spot')}
        </button>
        <button className="flex-1 py-2 text-sm font-medium bg-bg-secondary text-white rounded hover:bg-bg-secondary/80 transition-colors">
          {t('Withdraw')}
        </button>
      </div>

      {/* Account Equity */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white mb-2">{t('Account Equity')}</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t('Spot')}</span>
            <span className="text-white font-mono">${accountData.spotEquity.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t('Perps (Core)')}</span>
            <span className="text-white font-mono">${accountData.perpsEquity.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Perps Overview */}
      <div>
        <h3 className="text-sm font-medium text-white mb-2">{t('Perps Overview')}</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t('Balance')}</span>
            <span className="text-white font-mono">${accountData.balance.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t('Unrealized PNL')}</span>
            <span
              className={cn(
                'font-mono',
                accountData.unrealizedPnl >= 0 ? 'text-long' : 'text-short'
              )}
            >
              {accountData.unrealizedPnl >= 0 ? '+' : ''}${accountData.unrealizedPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t('Cross Margin Ratio')}</span>
            <span className="text-white font-mono">{accountData.crossMarginRatio.toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t('Maintenance Margin')}</span>
            <span className="text-white font-mono">
              ${accountData.maintenanceMargin.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">{t('Cross Account Leverage')}</span>
            <span className="text-white font-mono">
              {accountData.crossAccountLeverage.toFixed(2)}x
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
