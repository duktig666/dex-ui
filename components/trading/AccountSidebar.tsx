"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useAccountState } from "@/hooks/useAccountState";
import { formatPrice, formatPercent } from "@/lib/hyperliquid/utils";

export function AccountSidebar() {
  const { clearinghouseState, accountValue, availableBalance, totalUnrealizedPnl } = useAccountState();

  // 计算账户数据
  const accountData = useMemo(() => {
    if (!clearinghouseState) {
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

    const { crossMarginSummary, marginSummary } = clearinghouseState;
    const perpsEquity = parseFloat(crossMarginSummary?.accountValue || "0");
    const balance = parseFloat(marginSummary?.accountValue || "0");
    const totalMaintMargin = parseFloat(crossMarginSummary?.totalMntcMargin || "0");
    const totalNotional = parseFloat(crossMarginSummary?.totalNtlPos || "0");
    
    // 保证金率 = 账户价值 / 维持保证金
    const crossMarginRatio = totalMaintMargin > 0 ? (perpsEquity / totalMaintMargin) * 100 : 0;
    
    // 账户杠杆 = 总名义价值 / 账户价值
    const crossAccountLeverage = perpsEquity > 0 ? totalNotional / perpsEquity : 0;

    return {
      spotEquity: 0, // Spot 暂时不支持
      perpsEquity,
      balance,
      unrealizedPnl: totalUnrealizedPnl,
      crossMarginRatio,
      maintenanceMargin: totalMaintMargin,
      crossAccountLeverage,
    };
  }, [clearinghouseState, totalUnrealizedPnl]);

  return (
    <div className="p-4 bg-[#0b0e11]">
      {/* Deposit/Withdraw Buttons */}
      <div className="flex gap-2 mb-4">
        <select className="flex-1 px-2 py-1 text-xs bg-[#1a1d26] text-white rounded outline-none cursor-pointer">
          <option>BTC</option>
          <option>ETH</option>
          <option>USDC</option>
        </select>
        <select className="w-12 px-2 py-1 text-xs bg-[#1a1d26] text-white rounded outline-none cursor-pointer">
          <option>1</option>
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <button className="flex-1 py-2 text-sm font-medium bg-[#0ecb81] text-white rounded hover:bg-[#0ecb81]/90 transition-colors">
          Deposit
        </button>
        <button className="flex-1 py-2 text-sm font-medium bg-[#1a1d26] text-white rounded hover:bg-[#1a1d26]/80 transition-colors">
          Perps (Core) Spot
        </button>
        <button className="flex-1 py-2 text-sm font-medium bg-[#1a1d26] text-white rounded hover:bg-[#1a1d26]/80 transition-colors">
          Withdraw
        </button>
      </div>

      {/* Account Equity */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-white mb-2">Account Equity</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">Spot</span>
            <span className="text-white font-mono">${accountData.spotEquity.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">Perps (Core)</span>
            <span className="text-white font-mono">${accountData.perpsEquity.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Perps Overview */}
      <div>
        <h3 className="text-sm font-medium text-white mb-2">Perps Overview</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">Balance</span>
            <span className="text-white font-mono">${accountData.balance.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">Unrealized PNL</span>
            <span className={cn(
              "font-mono",
              accountData.unrealizedPnl >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
            )}>
              {accountData.unrealizedPnl >= 0 ? "+" : ""}${accountData.unrealizedPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">Cross Margin Ratio</span>
            <span className="text-white font-mono">{accountData.crossMarginRatio.toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">Maintenance Margin</span>
            <span className="text-white font-mono">${accountData.maintenanceMargin.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#848e9c]">Cross Account Leverage</span>
            <span className="text-white font-mono">{accountData.crossAccountLeverage.toFixed(2)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
