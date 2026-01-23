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
  BUILDER_FEE_SPOT,
  IS_TESTNET,
} from '@/lib/hyperliquid';
import type { TIF, ExchangeResponse } from '@/lib/hyperliquid/types';

// 市场类型
export type MarketType = 'perp' | 'spot';

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
  marketType?: MarketType; // 市场类型，默认 perp
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
    builderFeeMaxRate,
    builderFeeChecked,
    setBuilderFeeMaxRate,
    setBuilderFeeChecked,
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
  // HyperLiquid L1 Action 需要 chainId 1337，但钱包会验证 chainId 匹配
  // 尝试多种方法绕过验证
  const signTypedData = useCallback(async (params: {
    domain: Record<string, unknown>;
    types: Record<string, unknown>;
    primaryType: string;
    message: Record<string, unknown>;
  }): Promise<string> => {
    // 检查是否是 L1 Action 签名 (chainId 1337)
    const isL1Action = params.domain.chainId === 1337;
    
    console.log('[signTypedData] isL1Action:', isL1Action, 'chainId:', params.domain.chainId);
    
    if (isL1Action) {
      // 构建 EIP-712 类型数据
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          ...params.types,
        },
        primaryType: params.primaryType,
        domain: params.domain,
        message: params.message,
      };
      
      const typedDataString = JSON.stringify(typedData);
      console.log('[signTypedData] Attempting to sign with chainId 1337');
      
      // 尝试获取原始的 ethereum provider（绕过 AppKit 包装）
      const win = window as any;
      let provider = null;
      
      // 方法1: 检查是否有多个 providers (MetaMask 注入)
      if (win.ethereum?.providers?.length) {
        // 优先使用 MetaMask
        provider = win.ethereum.providers.find((p: any) => p.isMetaMask && !p.isTokenPocket);
        if (!provider) {
          provider = win.ethereum.providers[0];
        }
        console.log('[signTypedData] Found provider from providers array');
      }
      // 方法2: 直接使用 window.ethereum
      else if (win.ethereum) {
        provider = win.ethereum;
        console.log('[signTypedData] Using window.ethereum directly');
      }
      
      if (!provider) {
        throw new Error('No ethereum provider found. Please install MetaMask or another wallet.');
      }
      
      try {
        // 先尝试直接签名
        const signature = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [address, typedDataString],
        });
        console.log('[signTypedData] Got signature:', signature);
        return signature as string;
      } catch (err: any) {
        console.log('[signTypedData] Direct signing failed:', err.message);
        
        // 如果失败，尝试使用 personal_sign 作为后备（不推荐，但某些场景可用）
        // 注意：这会改变签名格式，可能导致服务器验证失败
        
        // 抛出更有帮助的错误信息
        if (err.message?.includes('chainId')) {
          throw new Error(
            'Your wallet does not support signing for HyperLiquid L1 (chainId 1337). ' +
            'Please try using MetaMask or add HyperLiquid as a custom network with chainId 1337.'
          );
        }
        throw err;
      }
    }
    
    // 其他签名使用 wagmi 的标准方法
    const signature = await signTypedDataAsync({
      domain: params.domain as any,
      types: params.types as any,
      primaryType: params.primaryType,
      message: params.message as any,
    });
    return signature;
  }, [signTypedDataAsync, address]);

  // 检查并授权 Builder Fee（按需）
  // 如果已有足够的授权，直接返回 true，不会弹出签名
  const ensureBuilderFeeApproved = useCallback(async (
    marketType: MarketType = 'perp'
  ): Promise<boolean> => {
    if (!address) {
      setLastError('Please connect wallet');
      return false;
    }

    const requiredFee = marketType === 'spot' ? BUILDER_FEE_SPOT : BUILDER_FEE_PERP;

    // 如果已经检查过且费率足够，直接返回
    if (builderFeeChecked && builderFeeMaxRate !== null && builderFeeMaxRate >= requiredFee) {
      console.log('[useTrading] Builder fee already approved:', { builderFeeMaxRate, requiredFee });
      return true;
    }

    try {
      // 先查询当前状态
      const status = await exchangeClient.getBuilderFeeStatus(address);
      console.log('[useTrading] Builder fee status:', status);
      
      // 更新 store
      setBuilderFeeMaxRate(status.maxFee);
      setBuilderFeeChecked(true);

      // 检查是否需要授权
      if (status.maxFee >= requiredFee) {
        console.log('[useTrading] Builder fee sufficient, no approval needed');
        return true;
      }

      // 需要授权
      console.log('[useTrading] Approving builder fee for', marketType);
      const success = await exchangeClient.checkAndApproveBuilderFee(address, signTypedData, marketType);
      
      if (success) {
        // 使用较大的费率更新 store，因为授权时使用的是 max(PERP, SPOT)
        const newRate = Math.max(BUILDER_FEE_PERP, BUILDER_FEE_SPOT);
        setBuilderFeeMaxRate(newRate);
        console.log('[useTrading] Builder fee approved, new rate:', newRate);
      }
      
      return success;
    } catch (error) {
      console.error('[useTrading] Failed to approve builder fee:', error);
      setLastError((error as Error).message);
      return false;
    }
  }, [address, builderFeeChecked, builderFeeMaxRate, signTypedData, setBuilderFeeMaxRate, setBuilderFeeChecked]);

  // 向后兼容的 approveBuilderFee（默认永续市场）
  const approveBuilderFee = useCallback(async (): Promise<boolean> => {
    return ensureBuilderFeeApproved('perp');
  }, [ensureBuilderFeeApproved]);

  // 下单
  const placeOrder = useCallback(async (params: PlaceOrderParams): Promise<TradeResult> => {
    const { 
      coin, 
      side, 
      orderType, 
      size, 
      price, 
      reduceOnly = false, 
      tif = 'Gtc', 
      slippagePercent = 1,
      marketType = 'perp',
    } = params;

    if (!isConnected || !address) {
      return { success: false, error: 'Please connect wallet' };
    }

    setIsSubmitting(true);
    setLastError(null);

    try {
      // 检查 Builder Fee 授权（传入市场类型）
      const feeApproved = await ensureBuilderFeeApproved(marketType);
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
    ensureBuilderFeeApproved,
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
    builderFeeApproved: builderFeeMaxRate !== null && builderFeeMaxRate >= BUILDER_FEE_PERP,
    
    // 方法
    placeOrder,
    cancelOrder,
    cancelAllOrders,
    updateLeverage,
    closePosition,
    approveBuilderFee,
    ensureBuilderFeeApproved,
    
    // 工具
    getAssetId,
    getSzDecimals,
    getCurrentPrice,
  };
}
