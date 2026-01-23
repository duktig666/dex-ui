/**
 * 账户状态 Hook
 * 管理用户账户余额、持仓等数据
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useUserStore } from '@/stores/userStore';
import { infoClient, hyperliquidWs, BUILDER_ADDRESS, BUILDER_FEE_PERP, BUILDER_FEE_SPOT } from '@/lib/hyperliquid';

/**
 * 账户状态 Hook
 */
export function useAccountState() {
  const { address, isConnected } = useAccount();
  
  const {
    marginSummary,
    positions,
    formattedPositions,
    openOrders,
    formattedOrders,
    userFills,
    isLoading,
    isInitialized,
    error,
    builderFeeMaxRate,
    builderFeeChecked,
    builderFeeChecking,
    setAddress,
    setConnected,
    updateClearinghouseState,
    updateOpenOrders,
    updateUserFills,
    setBuilderFeeMaxRate,
    setBuilderFeeChecked,
    setBuilderFeeChecking,
    setError,
  } = useUserStore();

  // 同步钱包连接状态
  useEffect(() => {
    setAddress(address || null);
    setConnected(isConnected);
  }, [address, isConnected, setAddress, setConnected]);

  // 获取账户数据
  const fetchAccountData = useCallback(async () => {
    if (!address) return;

    try {
      console.log('[useAccountState] Fetching account data for', address);

      // 并行获取数据
      const [clearinghouse, orders, fills] = await Promise.all([
        infoClient.getClearinghouseState(address),
        infoClient.getOpenOrders(address),
        infoClient.getUserFills(address),
      ]);

      updateClearinghouseState(clearinghouse);
      updateOpenOrders(orders);
      updateUserFills(fills);

      console.log('[useAccountState] Account data fetched');
    } catch (err) {
      console.error('[useAccountState] Failed to fetch account data:', err);
      setError((err as Error).message);
    }
  }, [address, updateClearinghouseState, updateOpenOrders, updateUserFills, setError]);

  // 检查 Builder Fee 授权状态
  const checkBuilderFee = useCallback(async () => {
    if (!address) return;
    
    // 防止重复检查
    if (builderFeeChecked) {
      console.log('[useAccountState] Builder fee already checked, skipping');
      return;
    }

    setBuilderFeeChecking(true);
    try {
      const maxFee = await infoClient.getMaxBuilderFee(address, BUILDER_ADDRESS);
      setBuilderFeeMaxRate(maxFee);
      setBuilderFeeChecked(true);
      
      // 检查是否满足永续和现货的费率要求
      const perpApproved = maxFee >= BUILDER_FEE_PERP;
      const spotApproved = maxFee >= BUILDER_FEE_SPOT;
      console.log('[useAccountState] Builder fee check complete:', {
        maxFee,
        requiredPerp: BUILDER_FEE_PERP,
        requiredSpot: BUILDER_FEE_SPOT,
        perpApproved,
        spotApproved,
      });
    } catch (err) {
      console.error('[useAccountState] Failed to check builder fee:', err);
      setBuilderFeeMaxRate(0);
      setBuilderFeeChecked(true); // 即使失败也标记为已检查，避免重复请求
    } finally {
      setBuilderFeeChecking(false);
    }
  }, [address, builderFeeChecked, setBuilderFeeMaxRate, setBuilderFeeChecked, setBuilderFeeChecking]);

  // 连接时获取数据
  useEffect(() => {
    if (isConnected && address) {
      fetchAccountData();
      checkBuilderFee();
    }
  }, [isConnected, address, fetchAccountData, checkBuilderFee]);

  // 订阅用户事件
  useEffect(() => {
    if (!isConnected || !address) return;

    console.log('[useAccountState] Subscribing to user events');

    // 订阅订单更新
    const unsubOrders = hyperliquidWs.subscribeOrderUpdates(address, (data: unknown) => {
      console.log('[useAccountState] Order update:', data);
      // 重新获取订单列表
      infoClient.getOpenOrders(address).then(updateOpenOrders).catch(console.error);
    });

    // 订阅成交
    const unsubFills = hyperliquidWs.subscribeUserFills(address, (data: unknown) => {
      console.log('[useAccountState] User fill:', data);
      // 重新获取账户状态和成交记录
      fetchAccountData();
    });

    return () => {
      console.log('[useAccountState] Unsubscribing from user events');
      unsubOrders();
      unsubFills();
    };
  }, [isConnected, address, updateOpenOrders, fetchAccountData]);

  // 计算账户值
  const accountValue = marginSummary ? parseFloat(marginSummary.accountValue) : 0;
  const availableBalance = marginSummary ? parseFloat(marginSummary.withdrawable) : 0;
  const totalMarginUsed = marginSummary ? parseFloat(marginSummary.totalMarginUsed) : 0;
  const totalUnrealizedPnl = formattedPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);

  // 计算 Builder Fee 是否已授权 (基于市场类型)
  const isBuilderFeeApprovedForPerp = useMemo(() => {
    return builderFeeMaxRate !== null && builderFeeMaxRate >= BUILDER_FEE_PERP;
  }, [builderFeeMaxRate]);

  const isBuilderFeeApprovedForSpot = useMemo(() => {
    return builderFeeMaxRate !== null && builderFeeMaxRate >= BUILDER_FEE_SPOT;
  }, [builderFeeMaxRate]);

  return {
    // 连接状态
    address,
    isConnected,
    
    // 账户数据
    accountValue,
    availableBalance,
    totalMarginUsed,
    totalUnrealizedPnl,
    marginSummary,
    
    // 持仓
    positions,
    formattedPositions,
    positionsCount: positions.length,
    
    // 订单
    openOrders,
    formattedOrders,
    ordersCount: openOrders.length,
    
    // 成交
    userFills,
    
    // Builder Fee
    builderFeeMaxRate,
    builderFeeChecked,
    builderFeeChecking,
    isBuilderFeeApprovedForPerp,
    isBuilderFeeApprovedForSpot,
    
    // 状态
    isLoading,
    isInitialized,
    error,
    
    // 方法
    refetch: fetchAccountData,
    checkBuilderFee,
  };
}

/**
 * 获取指定交易对的持仓
 */
export function usePosition(coin: string) {
  const formattedPositions = useUserStore((state) => state.formattedPositions);
  return formattedPositions.find((p) => p.coin === coin) || null;
}

/**
 * 获取指定交易对的挂单
 */
export function useOpenOrdersByCoin(coin: string) {
  const formattedOrders = useUserStore((state) => state.formattedOrders);
  return formattedOrders.filter((o) => o.coin === coin);
}

/**
 * 获取杠杆设置
 */
export function useLeverage(coin: string) {
  const leverageMap = useUserStore((state) => state.leverageMap);
  return leverageMap.get(coin) || { leverage: 10, isCross: true };
}
