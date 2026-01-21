/**
 * 交易 Hook
 * 封装下单、撤单、改单等交易操作
 */

'use client';

import { useCallback, useState } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { useUserStore } from '@/stores/userStore';
import { useMarketStore } from '@/stores/marketStore';
import {
  exchangeClient,
  infoClient,
  floatToWire,
  generateCloid,
  BUILDER_ADDRESS,
  BUILDER_FEE_PERP,
  IS_TESTNET,
} from '@/lib/hyperliquid';
import type { TIF, ExchangeResponse } from '@/lib/hyperliquid/types';

// 订单类型
export type OrderType = 'limit' | 'market';
export type OrderSide = 'buy' | 'sell';

// 下单参数
export interface PlaceOrderParams {
  coin: string;
  side: OrderSide;
  orderType: OrderType;
  size: number;
  price?: number; // 市价单可以不传
  reduceOnly?: boolean;
  tif?: TIF;
  slippagePercent?: number; // 市价单滑点百分比，默认 1%
}

// 撤单参数
export interface CancelOrderParams {
  coin: string;
  oid: number;
}

// 交易结果
export interface TradeResult {
  success: boolean;
  error?: string;
  response?: ExchangeResponse;
}

/**
 * 交易 Hook
 */
export function useTrading() {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const assetInfoMap = useMarketStore((state) => state.assetInfoMap);
  const perpMetas = useMarketStore((state) => state.perpMetas);
  const allMids = useMarketStore((state) => state.allMids);
  
  const {
    builderFeeApproved,
    setBuilderFeeApproved,
    updateOpenOrders,
    updateClearinghouseState,
  } = useUserStore();

  // 获取 asset index
  const getAssetId = useCallback((coin: string): number => {
    const index = perpMetas.findIndex((m) => m.name === coin);
    if (index === -1) {
      throw new Error(`Asset ${coin} not found`);
    }
    return index;
  }, [perpMetas]);

  // 获取数量精度
  const getSzDecimals = useCallback((coin: string): number => {
    const meta = perpMetas.find((m) => m.name === coin);
    return meta?.szDecimals || 4;
  }, [perpMetas]);

  // 获取当前价格
  const getCurrentPrice = useCallback((coin: string): number => {
    const info = assetInfoMap.get(coin);
    if (info?.midPx) return parseFloat(info.midPx);
    if (allMids[coin]) return parseFloat(allMids[coin]);
    return 0;
  }, [assetInfoMap, allMids]);

  // 签名适配器
  const signTypedData = useCallback(async (params: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }): Promise<string> => {
    const signature = await signTypedDataAsync({
      domain: params.domain as any,
      types: params.types as any,
      primaryType: params.primaryType,
      message: params.message as any,
    });
    return signature;
  }, [signTypedDataAsync]);

  // 检查并授权 Builder Fee
  const approveBuilderFee = useCallback(async (): Promise<boolean> => {
    if (!address) {
      setLastError('Please connect wallet');
      return false;
    }

    if (builderFeeApproved) {
      return true;
    }

    try {
      console.log('[useTrading] Approving builder fee...');
      const success = await exchangeClient.checkAndApproveBuilderFee(address, signTypedData);
      
      if (success) {
        setBuilderFeeApproved(true);
        console.log('[useTrading] Builder fee approved');
      }
      
      return success;
    } catch (error) {
      console.error('[useTrading] Failed to approve builder fee:', error);
      setLastError((error as Error).message);
      return false;
    }
  }, [address, builderFeeApproved, signTypedData, setBuilderFeeApproved]);

  // 下单
  const placeOrder = useCallback(async (params: PlaceOrderParams): Promise<TradeResult> => {
    const { coin, side, orderType, size, price, reduceOnly = false, tif = 'Gtc', slippagePercent = 1 } = params;

    if (!isConnected || !address) {
      return { success: false, error: 'Please connect wallet' };
    }

    setIsSubmitting(true);
    setLastError(null);

    try {
      // 检查 Builder Fee 授权
      const feeApproved = await approveBuilderFee();
      if (!feeApproved) {
        return { success: false, error: 'Failed to approve builder fee' };
      }

      const assetId = getAssetId(coin);
      const szDecimals = getSzDecimals(coin);
      const isBuy = side === 'buy';

      // 计算价格
      let limitPx: string;
      let orderTif: TIF = tif;

      if (orderType === 'market') {
        // 市价单使用滑点价格
        const currentPrice = price || getCurrentPrice(coin);
        if (currentPrice === 0) {
          return { success: false, error: 'Cannot get current price' };
        }
        
        const slippage = slippagePercent / 100;
        const slippagePrice = isBuy
          ? currentPrice * (1 + slippage)
          : currentPrice * (1 - slippage);
        
        limitPx = floatToWire(slippagePrice, 6);
        orderTif = 'Ioc'; // 市价单使用 IOC
      } else {
        if (!price) {
          return { success: false, error: 'Price is required for limit order' };
        }
        limitPx = floatToWire(price, 6);
      }

      const sz = floatToWire(size, szDecimals);
      const cloid = generateCloid();

      console.log('[useTrading] Placing order:', {
        coin,
        side,
        orderType,
        size: sz,
        price: limitPx,
        reduceOnly,
        tif: orderTif,
      });

      const response = await exchangeClient.placeOrder(
        [{
          coin,
          assetId,
          isBuy,
          limitPx,
          sz,
          reduceOnly,
          orderType: { limit: { tif: orderTif } },
          cloid,
        }],
        signTypedData
      );

      console.log('[useTrading] Order response:', response);

      if (response.status === 'ok') {
        // 刷新订单和账户状态
        const [orders, clearinghouse] = await Promise.all([
          infoClient.getOpenOrders(address),
          infoClient.getClearinghouseState(address),
        ]);
        updateOpenOrders(orders);
        updateClearinghouseState(clearinghouse);

        return { success: true, response };
      } else {
        const errorMsg = response.response?.type || 'Order failed';
        setLastError(errorMsg);
        return { success: false, error: errorMsg, response };
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('[useTrading] Order error:', error);
      setLastError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isConnected,
    address,
    approveBuilderFee,
    getAssetId,
    getSzDecimals,
    getCurrentPrice,
    signTypedData,
    updateOpenOrders,
    updateClearinghouseState,
  ]);

  // 撤单
  const cancelOrder = useCallback(async (params: CancelOrderParams): Promise<TradeResult> => {
    const { coin, oid } = params;

    if (!isConnected || !address) {
      return { success: false, error: 'Please connect wallet' };
    }

    setIsSubmitting(true);
    setLastError(null);

    try {
      const assetId = getAssetId(coin);

      console.log('[useTrading] Canceling order:', { coin, oid, assetId });

      const response = await exchangeClient.cancelOrder(
        [{ assetId, oid }],
        signTypedData
      );

      console.log('[useTrading] Cancel response:', response);

      if (response.status === 'ok') {
        // 刷新订单列表
        const orders = await infoClient.getOpenOrders(address);
        updateOpenOrders(orders);

        return { success: true, response };
      } else {
        const errorMsg = response.response?.type || 'Cancel failed';
        setLastError(errorMsg);
        return { success: false, error: errorMsg, response };
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('[useTrading] Cancel error:', error);
      setLastError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, address, getAssetId, signTypedData, updateOpenOrders]);

  // 撤销所有订单
  const cancelAllOrders = useCallback(async (coin?: string): Promise<TradeResult> => {
    if (!isConnected || !address) {
      return { success: false, error: 'Please connect wallet' };
    }

    setIsSubmitting(true);
    setLastError(null);

    try {
      const orders = await infoClient.getOpenOrders(address);
      const ordersToCancel = coin
        ? orders.filter((o) => o.coin === coin)
        : orders;

      if (ordersToCancel.length === 0) {
        return { success: true };
      }

      const cancels = ordersToCancel.map((order) => ({
        assetId: getAssetId(order.coin),
        oid: order.oid,
      }));

      console.log('[useTrading] Canceling all orders:', cancels.length);

      const response = await exchangeClient.cancelOrder(cancels, signTypedData);

      if (response.status === 'ok') {
        const newOrders = await infoClient.getOpenOrders(address);
        updateOpenOrders(newOrders);
        return { success: true, response };
      } else {
        const errorMsg = response.response?.type || 'Cancel all failed';
        setLastError(errorMsg);
        return { success: false, error: errorMsg, response };
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('[useTrading] Cancel all error:', error);
      setLastError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, address, getAssetId, signTypedData, updateOpenOrders]);

  // 更新杠杆
  const updateLeverage = useCallback(async (
    coin: string,
    leverage: number,
    isCross: boolean
  ): Promise<TradeResult> => {
    if (!isConnected || !address) {
      return { success: false, error: 'Please connect wallet' };
    }

    setIsSubmitting(true);
    setLastError(null);

    try {
      const assetId = getAssetId(coin);

      console.log('[useTrading] Updating leverage:', { coin, leverage, isCross });

      const response = await exchangeClient.updateLeverage(
        assetId,
        leverage,
        isCross,
        signTypedData
      );

      if (response.status === 'ok') {
        // 刷新账户状态
        const clearinghouse = await infoClient.getClearinghouseState(address);
        updateClearinghouseState(clearinghouse);
        return { success: true, response };
      } else {
        const errorMsg = response.response?.type || 'Update leverage failed';
        setLastError(errorMsg);
        return { success: false, error: errorMsg, response };
      }
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error('[useTrading] Update leverage error:', error);
      setLastError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  }, [isConnected, address, getAssetId, signTypedData, updateClearinghouseState]);

  // 一键平仓
  const closePosition = useCallback(async (
    coin: string,
    slippagePercent: number = 1
  ): Promise<TradeResult> => {
    if (!isConnected || !address) {
      return { success: false, error: 'Please connect wallet' };
    }

    // 获取当前持仓
    const clearinghouse = await infoClient.getClearinghouseState(address);
    const position = clearinghouse.assetPositions.find(
      (ap) => ap.position.coin === coin
    )?.position;

    if (!position || parseFloat(position.szi) === 0) {
      return { success: false, error: 'No position to close' };
    }

    const size = Math.abs(parseFloat(position.szi));
    const isLong = parseFloat(position.szi) > 0;

    // 平仓方向与持仓相反
    const result = await placeOrder({
      coin,
      side: isLong ? 'sell' : 'buy',
      orderType: 'market',
      size,
      reduceOnly: true,
      slippagePercent,
    });

    return result;
  }, [isConnected, address, placeOrder]);

  return {
    // 状态
    isSubmitting,
    lastError,
    builderFeeApproved,
    
    // 方法
    placeOrder,
    cancelOrder,
    cancelAllOrders,
    updateLeverage,
    closePosition,
    approveBuilderFee,
    
    // 工具
    getAssetId,
    getSzDecimals,
    getCurrentPrice,
  };
}
