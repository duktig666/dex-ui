'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import * as Tabs from '@radix-ui/react-tabs';
import { useAccountState } from '@/hooks/useAccountState';
import { useTrading } from '@/hooks/useTrading';
import { formatPrice, formatSize } from '@/lib/hyperliquid/utils';
import { infoClient } from '@/lib/hyperliquid';
import { useTrailingStopStore } from '@/stores/trailingStopStore';
import { useAccount } from 'wagmi';
import type { TwapOrder, HistoricalOrder } from '@/lib/hyperliquid/types';

type TabType =
  | 'balances'
  | 'positions'
  | 'orders'
  | 'twap'
  | 'trailing'
  | 'trade-history'
  | 'funding-history'
  | 'order-history';

// User Funding 返回类型
interface UserFundingItem {
  time: number;
  coin: string;
  usdc: string;
  szi: string;
  fundingRate: string;
}

function EmptyState({ message }: { message: string }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full text-[#848e9c] text-sm">
      {t(message)}
    </div>
  );
}

function BalancesTable() {
  const { t } = useTranslation();
  const { marginSummary, availableBalance, accountValue } = useAccountState();

  const balances = useMemo(() => {
    if (!marginSummary) return [];

    return [
      {
        coin: 'USDC',
        total: accountValue,
        available: availableBalance,
        usdValue: accountValue,
        entryPrice: '-',
        pnl: '-',
      },
    ];
  }, [marginSummary, availableBalance, accountValue]);

  return (
    <div className="h-full overflow-auto">
      {/* Header Row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1d26] text-xs text-[#848e9c] sticky top-0 bg-[#0b0e11]">
        <div className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4 rounded bg-[#1a1d26]" />
          <span>{t('Hide Small Balances')}</span>
        </div>
        <input
          type="text"
          placeholder="Coins..."
          className="ml-auto px-2 py-1 bg-[#1a1d26] rounded text-white text-xs outline-none w-32"
        />
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-8 gap-4 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26]">
        <div>{t('Coin')}</div>
        <div className="text-right">{t('Total Balance')}</div>
        <div className="text-right">{t('Available Balance')}</div>
        <div className="text-right">{t('USD Value')}</div>
        <div className="text-right">{t('Entry Price')}</div>
        <div className="text-right">{t('PNL (ROE %)')}</div>
        <div className="text-right">{t('Send')}</div>
        <div className="text-right">{t('Transfer')}</div>
      </div>

      {/* Table Body */}
      {balances.map((balance) => (
        <div
          key={balance.coin}
          className="grid grid-cols-8 gap-4 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
        >
          <div className="text-white">{balance.coin}</div>
          <div className="text-right text-white font-mono">{formatPrice(balance.total, 2)}</div>
          <div className="text-right text-white font-mono">{formatPrice(balance.available, 2)}</div>
          <div className="text-right text-white font-mono">
            {formatPrice(balance.usdValue, 2)} USD
          </div>
          <div className="text-right text-[#848e9c]">{balance.entryPrice}</div>
          <div className="text-right text-[#848e9c]">{balance.pnl}</div>
          <div className="text-right text-[#848e9c]">-</div>
          <div className="text-right">
            <button className="text-[#2962ff] hover:underline">{t('Transfer')}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PositionsTable() {
  const { t } = useTranslation();
  const { formattedPositions } = useAccountState();
  const { closePosition } = useTrading();

  if (!formattedPositions || formattedPositions.length === 0) {
    return <EmptyState message="No open positions" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-10 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>{t('Symbol')}</div>
        <div className="text-right">{t('Size')}</div>
        <div className="text-right">{t('Notional')}</div>
        <div className="text-right">{t('Entry Price')}</div>
        <div className="text-right">{t('Mark Price')}</div>
        <div className="text-right">{t('Liq. Price')}</div>
        <div className="text-right">{t('Margin')}</div>
        <div className="text-right">{t('PNL')}</div>
        <div className="text-right">{t('ROE')}</div>
        <div className="text-right">{t('Actions')}</div>
      </div>

      {/* Table Body */}
      {formattedPositions.map((pos) => {
        const isLong = pos.size > 0;
        const pnl = pos.unrealizedPnl;
        // ROE = (PnL / Margin) * 100
        const roe = pos.marginUsed > 0 ? (pnl / pos.marginUsed) * 100 : 0;

        return (
          <div
            key={pos.coin}
            className="grid grid-cols-10 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className={cn('font-medium', isLong ? 'text-[#0ecb81]' : 'text-[#f6465d]')}>
              {pos.coin}-PERP {isLong ? t('Long') : t('Short')}
            </div>
            <div
              className={cn('text-right font-mono', isLong ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {formatSize(pos.size, 5)}
            </div>
            <div className="text-right text-white font-mono">
              ${formatPrice(pos.notionalValue, 2)}
            </div>
            <div className="text-right text-white font-mono">${formatPrice(pos.entryPrice, 2)}</div>
            <div className="text-right text-white font-mono">${formatPrice(pos.markPrice, 2)}</div>
            <div className="text-right text-[#f6465d] font-mono">
              {pos.liquidationPrice ? `$${formatPrice(pos.liquidationPrice, 2)}` : '-'}
            </div>
            <div className="text-right text-white font-mono">${formatPrice(pos.marginUsed, 2)}</div>
            <div
              className={cn('text-right font-mono', pnl >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {pnl >= 0 ? '+' : ''}${formatPrice(pnl, 2)}
            </div>
            <div
              className={cn('text-right font-mono', roe >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {roe >= 0 ? '+' : ''}
              {formatPrice(roe, 2)}%
            </div>
            <div className="text-right">
              <button
                onClick={() => closePosition(pos.coin)}
                className="px-2 py-1 text-[#f6465d] bg-[#f6465d]/10 rounded hover:bg-[#f6465d]/20"
              >
                {t('Close')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrdersTable() {
  const { t } = useTranslation();
  const { openOrders } = useAccountState();
  const { cancelOrder, cancelAllOrders } = useTrading();

  if (!openOrders || openOrders.length === 0) {
    return <EmptyState message="No open orders" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Header Row */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <button
          onClick={() => cancelAllOrders()}
          className="px-2 py-1 text-xs text-[#f6465d] bg-[#f6465d]/10 rounded hover:bg-[#f6465d]/20"
        >
          {t('Cancel All')}
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-9 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26]">
        <div>{t('Symbol')}</div>
        <div className="text-right">{t('Side')}</div>
        <div className="text-right">{t('Type')}</div>
        <div className="text-right">{t('Size')}</div>
        <div className="text-right">{t('Filled')}</div>
        <div className="text-right">{t('Price')}</div>
        <div className="text-right">{t('Trigger')}</div>
        <div className="text-right">{t('Time')}</div>
        <div className="text-right">{t('Actions')}</div>
      </div>

      {/* Table Body */}
      {openOrders.map((order) => {
        const isBuy = order.side === 'B';
        const filled = parseFloat(order.sz) - parseFloat(order.origSz);

        return (
          <div
            key={order.oid}
            className="grid grid-cols-9 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{order.coin}-PERP</div>
            <div
              className={cn('text-right font-medium', isBuy ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {isBuy ? t('Buy') : t('Sell')}
            </div>
            <div className="text-right text-white">{order.orderType}</div>
            <div className="text-right text-white font-mono">{formatSize(order.origSz, 5)}</div>
            <div className="text-right text-white font-mono">{formatSize(filled, 5)}</div>
            <div className="text-right text-white font-mono">${formatPrice(order.limitPx, 2)}</div>
            <div className="text-right text-[#848e9c]">
              {order.triggerPx ? `$${formatPrice(order.triggerPx, 2)}` : '-'}
            </div>
            <div className="text-right text-[#848e9c]">
              {new Date(order.timestamp).toLocaleTimeString()}
            </div>
            <div className="text-right">
              <button
                onClick={() => cancelOrder({ coin: order.coin, oid: order.oid })}
                className="px-2 py-1 text-[#f6465d] bg-[#f6465d]/10 rounded hover:bg-[#f6465d]/20"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TradeHistoryTable() {
  const { t } = useTranslation();
  const { userFills } = useAccountState();

  if (!userFills || userFills.length === 0) {
    return <EmptyState message="No trade history" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>{t('Symbol')}</div>
        <div className="text-right">{t('Side')}</div>
        <div className="text-right">{t('Size')}</div>
        <div className="text-right">{t('Price')}</div>
        <div className="text-right">{t('Fee')}</div>
        <div className="text-right">{t('Realized PNL')}</div>
        <div className="text-right">{t('Time')}</div>
        <div className="text-right">{t('Type')}</div>
      </div>

      {/* Table Body */}
      {userFills.slice(0, 50).map((fill, idx) => {
        const isBuy = fill.side === 'B';

        return (
          <div
            key={`${fill.oid}-${idx}`}
            className="grid grid-cols-8 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{fill.coin}-PERP</div>
            <div
              className={cn('text-right font-medium', isBuy ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {isBuy ? t('Buy') : t('Sell')}
            </div>
            <div className="text-right text-white font-mono">{formatSize(fill.sz, 5)}</div>
            <div className="text-right text-white font-mono">${formatPrice(fill.px, 2)}</div>
            <div className="text-right text-[#848e9c] font-mono">${formatPrice(fill.fee, 4)}</div>
            <div
              className={cn(
                'text-right font-mono',
                parseFloat(fill.closedPnl) >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              )}
            >
              {parseFloat(fill.closedPnl) !== 0
                ? `${parseFloat(fill.closedPnl) >= 0 ? '+' : ''}$${formatPrice(fill.closedPnl, 2)}`
                : '-'}
            </div>
            <div className="text-right text-[#848e9c]">{new Date(fill.time).toLocaleString()}</div>
            <div className="text-right text-[#848e9c]">
              {fill.liquidation ? t('Liquidation') : fill.crossed ? t('Taker') : t('Maker')}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TwapOrdersTable() {
  const { address } = useAccount();
  const [twapOrders, setTwapOrders] = useState<TwapOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchTwapOrders = async () => {
      setIsLoading(true);
      try {
        const orders = await infoClient.getTwapHistory(address);
        setTwapOrders(orders || []);
      } catch (err) {
        console.error('Failed to fetch TWAP orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTwapOrders();
    // 每 30 秒刷新一次
    const interval = setInterval(fetchTwapOrders, 30000);
    return () => clearInterval(interval);
  }, [address]);

  if (isLoading && twapOrders.length === 0) {
    return <EmptyState message="Loading TWAP orders..." />;
  }

  if (!twapOrders || twapOrders.length === 0) {
    return <EmptyState message="No TWAP orders" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>Symbol</div>
        <div className="text-right">Side</div>
        <div className="text-right">Total Size</div>
        <div className="text-right">Filled</div>
        <div className="text-right">Progress</div>
        <div className="text-right">Duration</div>
        <div className="text-right">Status</div>
        <div className="text-right">Time</div>
      </div>

      {/* Table Body */}
      {twapOrders.map((order, idx) => {
        const isBuy = order.side === 'B';
        const totalSz = parseFloat(order.sz || '0');
        const filledSz = parseFloat(order.filledSz || '0');
        const progress = totalSz > 0 ? (filledSz / totalSz) * 100 : 0;
        const durationMinutes = order.minutes || 0;
        const durationHours = durationMinutes / 60;

        // 确定状态
        const isRunning = !!order.state?.running;
        const isTerminated = !!order.state?.terminated;
        const status = isRunning ? 'running' : isTerminated ? 'terminated' : 'completed';
        const terminatedReason = order.state?.terminated?.reason;

        return (
          <div
            key={`twap-${order.twapId}-${idx}`}
            className="grid grid-cols-8 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{order.coin}-PERP</div>
            <div
              className={cn('text-right font-medium', isBuy ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {isBuy ? 'Buy' : 'Sell'}
            </div>
            <div className="text-right text-white font-mono">{formatSize(totalSz, 5)}</div>
            <div className="text-right text-white font-mono">{formatSize(filledSz, 5)}</div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1">
                <div className="w-16 h-1.5 bg-[#1a1d26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2962ff] rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <span className="text-[#848e9c]">{progress.toFixed(1)}%</span>
              </div>
            </div>
            <div className="text-right text-[#848e9c]">
              {durationHours >= 1 ? `${durationHours.toFixed(1)}h` : `${durationMinutes}m`}
            </div>
            <div
              className={cn(
                'text-right',
                status === 'running'
                  ? 'text-[#2962ff]'
                  : status === 'completed'
                    ? 'text-[#0ecb81]'
                    : 'text-[#f6465d]'
              )}
              title={terminatedReason}
            >
              {status === 'terminated' && terminatedReason === 'cancelled'
                ? 'Cancelled'
                : status === 'terminated'
                  ? 'Terminated'
                  : status === 'running'
                    ? 'Running'
                    : 'Completed'}
            </div>
            <div className="text-right text-[#848e9c]">
              {order.startTime ? new Date(order.startTime).toLocaleString() : '-'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrailingStopTable() {
  const orders = useTrailingStopStore((state) => state.orders);
  const cancelOrder = useTrailingStopStore((state) => state.cancelOrder);
  const removeOrder = useTrailingStopStore((state) => state.removeOrder);

  if (!orders || orders.length === 0) {
    return <EmptyState message="No trailing stop orders" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-9 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>Symbol</div>
        <div className="text-right">Side</div>
        <div className="text-right">Size</div>
        <div className="text-right">Trail Type</div>
        <div className="text-right">Trail Value</div>
        <div className="text-right">Trigger Price</div>
        <div className="text-right">Status</div>
        <div className="text-right">Created</div>
        <div className="text-right">Action</div>
      </div>

      {/* Table Body */}
      {orders.map((order) => {
        const isBuy = order.side === 'buy';

        return (
          <div
            key={order.id}
            className="grid grid-cols-9 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{order.coin}-PERP</div>
            <div
              className={cn('text-right font-medium', isBuy ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {isBuy ? 'Buy' : 'Sell'}
            </div>
            <div className="text-right text-white font-mono">{formatSize(order.size, 5)}</div>
            <div className="text-right text-[#848e9c] capitalize">{order.trailType}</div>
            <div className="text-right text-white font-mono">
              {order.trailType === 'percent' ? `${order.trailValue}%` : `$${order.trailValue}`}
            </div>
            <div className="text-right text-white font-mono">
              {order.triggerPrice ? `$${formatPrice(order.triggerPrice, 2)}` : '-'}
            </div>
            <div
              className={cn(
                'text-right capitalize',
                order.status === 'active'
                  ? 'text-[#2962ff]'
                  : order.status === 'triggered'
                    ? 'text-[#0ecb81]'
                    : order.status === 'cancelled'
                      ? 'text-[#f6465d]'
                      : 'text-[#848e9c]'
              )}
            >
              {order.status}
            </div>
            <div className="text-right text-[#848e9c]">
              {new Date(order.createdAt).toLocaleString()}
            </div>
            <div className="text-right">
              {order.status === 'active' ? (
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="px-2 py-1 text-[#f6465d] bg-[#f6465d]/10 rounded hover:bg-[#f6465d]/20"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => removeOrder(order.id)}
                  className="px-2 py-1 text-[#848e9c] bg-[#848e9c]/10 rounded hover:bg-[#848e9c]/20"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FundingHistoryTable() {
  const { address } = useAccount();
  const [fundingHistory, setFundingHistory] = useState<UserFundingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchFundingHistory = async () => {
      setIsLoading(true);
      try {
        // 获取最近 7 天的资金费率历史
        const endTime = Date.now();
        const startTime = endTime - 7 * 24 * 60 * 60 * 1000;
        const history = await infoClient.getUserFunding(address, startTime, endTime);
        setFundingHistory((history as UserFundingItem[]) || []);
      } catch (err) {
        console.error('Failed to fetch funding history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFundingHistory();
  }, [address]);

  if (isLoading && fundingHistory.length === 0) {
    return <EmptyState message="Loading funding history..." />;
  }

  if (!fundingHistory || fundingHistory.length === 0) {
    return <EmptyState message="No funding history" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>Symbol</div>
        <div className="text-right">Position Size</div>
        <div className="text-right">Funding Rate</div>
        <div className="text-right">Payment</div>
        <div className="text-right">Time</div>
      </div>

      {/* Table Body */}
      {fundingHistory.slice(0, 100).map((item, idx) => {
        const payment = parseFloat(item.usdc);
        const isPositive = payment >= 0;

        return (
          <div
            key={`funding-${idx}`}
            className="grid grid-cols-5 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{item.coin}-PERP</div>
            <div className="text-right text-white font-mono">{formatSize(item.szi, 5)}</div>
            <div className="text-right text-[#848e9c] font-mono">
              {(parseFloat(item.fundingRate) * 100).toFixed(6)}%
            </div>
            <div
              className={cn(
                'text-right font-mono',
                isPositive ? 'text-[#0ecb81]' : 'text-[#f6465d]'
              )}
            >
              {isPositive ? '+' : ''}
              {formatPrice(payment, 4)} USDC
            </div>
            <div className="text-right text-[#848e9c]">{new Date(item.time).toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
}

function OrderHistoryTable() {
  const { address } = useAccount();
  const [orderHistory, setOrderHistory] = useState<HistoricalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) return;

    const fetchOrderHistory = async () => {
      setIsLoading(true);
      try {
        const history = await infoClient.getOrderHistory(address);
        setOrderHistory(history || []);
      } catch (err) {
        console.error('Failed to fetch order history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderHistory();
  }, [address]);

  if (isLoading && orderHistory.length === 0) {
    return <EmptyState message="Loading order history..." />;
  }

  if (!orderHistory || orderHistory.length === 0) {
    return <EmptyState message="No order history" />;
  }

  return (
    <div className="h-full overflow-auto">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-2 px-4 py-2 text-xs text-[#848e9c] border-b border-[#1a1d26] sticky top-0 bg-[#0b0e11]">
        <div>Symbol</div>
        <div className="text-right">Side</div>
        <div className="text-right">Type</div>
        <div className="text-right">Size</div>
        <div className="text-right">Filled</div>
        <div className="text-right">Price</div>
        <div className="text-right">Status</div>
        <div className="text-right">Time</div>
      </div>

      {/* Table Body */}
      {orderHistory.slice(0, 100).map((item, idx) => {
        const order = item.order;
        const isBuy = order.side === 'B';
        const origSz = parseFloat(order.origSz || order.sz);
        const remainingSz = parseFloat(order.sz);
        const filled = origSz - remainingSz;

        // 状态显示
        const statusColorMap: Record<string, string> = {
          filled: 'text-[#0ecb81]',
          open: 'text-[#2962ff]',
          canceled: 'text-[#f6465d]',
          triggered: 'text-[#f0b90b]',
          rejected: 'text-[#f6465d]',
          marginCanceled: 'text-[#f6465d]',
        };
        const statusTextMap: Record<string, string> = {
          filled: 'Filled',
          open: 'Open',
          canceled: 'Cancelled',
          triggered: 'Triggered',
          rejected: 'Rejected',
          marginCanceled: 'Margin Cancelled',
        };

        return (
          <div
            key={`order-${order.oid}-${idx}`}
            className="grid grid-cols-8 gap-2 px-4 py-2 text-xs hover:bg-[#1a1d26]/50"
          >
            <div className="text-white font-medium">{order.coin}-PERP</div>
            <div
              className={cn('text-right font-medium', isBuy ? 'text-[#0ecb81]' : 'text-[#f6465d]')}
            >
              {isBuy ? 'Buy' : 'Sell'}
            </div>
            <div className="text-right text-[#848e9c]">{order.orderType || 'Limit'}</div>
            <div className="text-right text-white font-mono">{formatSize(origSz, 5)}</div>
            <div className="text-right text-white font-mono">{formatSize(filled, 5)}</div>
            <div className="text-right text-white font-mono">${formatPrice(order.limitPx, 2)}</div>
            <div className={cn('text-right', statusColorMap[item.status] || 'text-[#848e9c]')}>
              {statusTextMap[item.status] || item.status}
            </div>
            <div className="text-right text-[#848e9c]">
              {new Date(item.statusTimestamp).toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AccountPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('balances');
  const { positions, openOrders } = useAccountState();
  const trailingOrders = useTrailingStopStore((state) => state.orders);
  const activeTrailingCount = trailingOrders.filter((o) => o.status === 'active').length;

  const tabs: { value: TabType; label: string; count?: number }[] = [
    { value: 'balances', label: t('Balances') },
    { value: 'positions', label: t('Positions'), count: positions?.length || 0 },
    { value: 'orders', label: t('Open Orders'), count: openOrders?.length || 0 },
    { value: 'twap', label: t('TWAP') },
    { value: 'trailing', label: t('Trailing'), count: activeTrailingCount },
    { value: 'trade-history', label: t('Trade History') },
    { value: 'funding-history', label: t('Funding History') },
    { value: 'order-history', label: t('Order History') },
  ];

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as TabType)}
      className="flex flex-col h-full bg-[#0b0e11]"
    >
      {/* Tab List */}
      <Tabs.List className="flex items-center gap-1 px-4 border-b border-[#1a1d26] overflow-x-auto">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              'data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#2962ff]',
              'data-[state=inactive]:text-[#848e9c] data-[state=inactive]:hover:text-white'
            )}
          >
            {tab.label}
            {tab.count !== undefined && `(${tab.count})`}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs.Content value="balances" className="h-full">
          <BalancesTable />
        </Tabs.Content>

        <Tabs.Content value="positions" className="h-full">
          <PositionsTable />
        </Tabs.Content>

        <Tabs.Content value="orders" className="h-full">
          <OrdersTable />
        </Tabs.Content>

        <Tabs.Content value="twap" className="h-full">
          <TwapOrdersTable />
        </Tabs.Content>

        <Tabs.Content value="trailing" className="h-full">
          <TrailingStopTable />
        </Tabs.Content>

        <Tabs.Content value="trade-history" className="h-full">
          <TradeHistoryTable />
        </Tabs.Content>

        <Tabs.Content value="funding-history" className="h-full">
          <FundingHistoryTable />
        </Tabs.Content>

        <Tabs.Content value="order-history" className="h-full">
          <OrderHistoryTable />
        </Tabs.Content>
      </div>
    </Tabs.Root>
  );
}
