/**
 * 用户数据 Store
 * 管理用户账户状态、持仓、订单等数据
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  ClearinghouseState,
  SpotClearinghouseState,
  Position,
  Order,
  UserFill,
  MarginSummary,
  FormattedPosition,
  FormattedOrder,
} from '@/lib/hyperliquid/types';
import { parsePrice, parseSize, sideToOrderSide, getSideFromPosition } from '@/lib/hyperliquid/utils';

// 用户 Store 状态
interface UserState {
  // 钱包地址
  address: string | null;
  isConnected: boolean;
  
  // Builder Fee 授权状态
  builderFeeApproved: boolean;
  builderFeeChecking: boolean;
  
  // 永续合约账户状态
  clearinghouseState: ClearinghouseState | null;
  marginSummary: MarginSummary | null;
  positions: Position[];
  formattedPositions: FormattedPosition[];
  
  // 现货账户状态
  spotClearinghouseState: SpotClearinghouseState | null;
  
  // 当前挂单
  openOrders: Order[];
  formattedOrders: FormattedOrder[];
  
  // 成交记录
  userFills: UserFill[];
  
  // 历史订单
  orderHistory: Order[];
  
  // 当前杠杆设置 (per asset)
  leverageMap: Map<string, { leverage: number; isCross: boolean }>;
  
  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

// 用户 Store Actions
interface UserActions {
  // 设置钱包地址
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  
  // Builder Fee
  setBuilderFeeApproved: (approved: boolean) => void;
  setBuilderFeeChecking: (checking: boolean) => void;
  
  // 更新账户状态
  updateClearinghouseState: (state: ClearinghouseState) => void;
  updateSpotClearinghouseState: (state: SpotClearinghouseState) => void;
  
  // 更新订单
  updateOpenOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  removeOrder: (oid: number) => void;
  updateOrderStatus: (oid: number, status: string) => void;
  
  // 更新成交记录
  updateUserFills: (fills: UserFill[]) => void;
  addFill: (fill: UserFill) => void;
  
  // 更新历史订单
  updateOrderHistory: (orders: Order[]) => void;
  
  // 更新杠杆
  updateLeverage: (coin: string, leverage: number, isCross: boolean) => void;
  
  // 设置错误
  setError: (error: string | null) => void;
  
  // 重置
  reset: () => void;
}

// 格式化持仓数据
function formatPosition(position: Position, markPx?: string): FormattedPosition {
  const size = parseSize(position.szi);
  const side = getSideFromPosition(size);
  const entryPrice = parsePrice(position.entryPx);
  const mark = markPx ? parsePrice(markPx) : parsePrice(position.positionValue) / Math.abs(size);
  const liquidationPrice = position.liquidationPx ? parsePrice(position.liquidationPx) : null;
  const unrealizedPnl = parsePrice(position.unrealizedPnl);
  const marginUsed = parsePrice(position.marginUsed);
  const notionalValue = Math.abs(size) * mark;
  const unrealizedPnlPercent = marginUsed > 0 ? unrealizedPnl / marginUsed : 0;

  return {
    coin: position.coin,
    size: Math.abs(size),
    side: side || 'long',
    leverage: position.leverage.value,
    marginMode: position.leverage.type,
    entryPrice,
    markPrice: mark,
    liquidationPrice,
    unrealizedPnl,
    unrealizedPnlPercent,
    marginUsed,
    notionalValue,
  };
}

// 格式化订单数据
function formatOrder(order: Order): FormattedOrder {
  const price = parsePrice(order.limitPx);
  const size = parseSize(order.sz);
  const origSize = parseSize(order.origSz);
  const filled = origSize - size;
  
  return {
    coin: order.coin,
    oid: order.oid,
    cloid: order.cloid,
    side: sideToOrderSide(order.side),
    type: order.isTrigger ? (order.orderType || 'trigger') : 'limit',
    price,
    size: origSize,
    filled,
    remaining: size,
    reduceOnly: order.reduceOnly || false,
    timestamp: order.timestamp,
    status: 'open',
    triggerPrice: order.triggerPx ? parsePrice(order.triggerPx) : undefined,
    tpsl: undefined,
  };
}

// 初始状态
const initialState: UserState = {
  address: null,
  isConnected: false,
  builderFeeApproved: false,
  builderFeeChecking: false,
  clearinghouseState: null,
  marginSummary: null,
  positions: [],
  formattedPositions: [],
  spotClearinghouseState: null,
  openOrders: [],
  formattedOrders: [],
  userFills: [],
  orderHistory: [],
  leverageMap: new Map(),
  isLoading: false,
  isInitialized: false,
  error: null,
};

// 创建 Store
export const useUserStore = create<UserState & UserActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setAddress: (address) => {
      set({ 
        address: address?.toLowerCase() || null,
        isConnected: !!address,
      });
    },

    setConnected: (connected) => {
      set({ isConnected: connected });
      if (!connected) {
        // 断开连接时重置用户数据
        set({
          clearinghouseState: null,
          marginSummary: null,
          positions: [],
          formattedPositions: [],
          spotClearinghouseState: null,
          openOrders: [],
          formattedOrders: [],
          userFills: [],
          builderFeeApproved: false,
          isInitialized: false,
        });
      }
    },

    setBuilderFeeApproved: (approved) => {
      set({ builderFeeApproved: approved });
    },

    setBuilderFeeChecking: (checking) => {
      set({ builderFeeChecking: checking });
    },

    updateClearinghouseState: (state) => {
      // 提取持仓
      const positions = state.assetPositions
        .map((ap) => ap.position)
        .filter((p) => parseFloat(p.szi) !== 0);
      
      // 格式化持仓
      const formattedPositions = positions.map((p) => formatPosition(p));
      
      // 提取杠杆设置
      const { leverageMap } = get();
      const newLeverageMap = new Map(leverageMap);
      
      state.assetPositions.forEach((ap) => {
        const position = ap.position;
        newLeverageMap.set(position.coin, {
          leverage: position.leverage.value,
          isCross: position.leverage.type === 'cross',
        });
      });

      set({
        clearinghouseState: state,
        marginSummary: state.marginSummary,
        positions,
        formattedPositions,
        leverageMap: newLeverageMap,
        isLoading: false,
        isInitialized: true,
      });
    },

    updateSpotClearinghouseState: (state) => {
      set({ spotClearinghouseState: state });
    },

    updateOpenOrders: (orders) => {
      const formattedOrders = orders.map(formatOrder);
      set({ openOrders: orders, formattedOrders });
    },

    addOrder: (order) => {
      const { openOrders, formattedOrders } = get();
      // 检查是否已存在
      if (openOrders.some((o) => o.oid === order.oid)) {
        return;
      }
      set({
        openOrders: [...openOrders, order],
        formattedOrders: [...formattedOrders, formatOrder(order)],
      });
    },

    removeOrder: (oid) => {
      const { openOrders, formattedOrders } = get();
      set({
        openOrders: openOrders.filter((o) => o.oid !== oid),
        formattedOrders: formattedOrders.filter((o) => o.oid !== oid),
      });
    },

    updateOrderStatus: (oid, status) => {
      const { formattedOrders } = get();
      const newOrders = formattedOrders.map((o) =>
        o.oid === oid ? { ...o, status } : o
      );
      set({ formattedOrders: newOrders });
    },

    updateUserFills: (fills) => {
      // 按时间排序，最新的在前
      const sortedFills = [...fills].sort((a, b) => b.time - a.time);
      set({ userFills: sortedFills });
    },

    addFill: (fill) => {
      const { userFills } = get();
      // 检查是否已存在
      if (userFills.some((f) => f.tid === fill.tid)) {
        return;
      }
      // 添加到开头
      set({ userFills: [fill, ...userFills].slice(0, 500) });
    },

    updateOrderHistory: (orders) => {
      set({ orderHistory: orders });
    },

    updateLeverage: (coin, leverage, isCross) => {
      const { leverageMap } = get();
      const newMap = new Map(leverageMap);
      newMap.set(coin, { leverage, isCross });
      set({ leverageMap: newMap });
    },

    setError: (error) => {
      set({ error, isLoading: false });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

// 选择器
export const selectAccountValue = (state: UserState) => {
  return state.marginSummary ? parseFloat(state.marginSummary.accountValue) : 0;
};

export const selectAvailableBalance = (state: UserState) => {
  return state.marginSummary ? parseFloat(state.marginSummary.withdrawable) : 0;
};

export const selectTotalUnrealizedPnl = (state: UserState) => {
  return state.formattedPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
};

export const selectPositionByCoin = (coin: string) => (state: UserState) => {
  return state.formattedPositions.find((p) => p.coin === coin);
};

export const selectOrdersByCoin = (coin: string) => (state: UserState) => {
  return state.formattedOrders.filter((o) => o.coin === coin);
};

export const selectLeverage = (coin: string) => (state: UserState) => {
  return state.leverageMap.get(coin) || { leverage: 10, isCross: true };
};

export const selectOpenOrdersCount = (state: UserState) => {
  return state.openOrders.length;
};

export const selectPositionsCount = (state: UserState) => {
  return state.positions.length;
};
