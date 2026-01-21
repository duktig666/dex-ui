"use client";

import { useEffect, createContext, useContext, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useMarketData } from "@/hooks/useMarketData";
import { useAccountState } from "@/hooks/useAccountState";
import { useMarketStore } from "@/stores/marketStore";
import { useUserStore } from "@/stores/userStore";

interface HyperliquidContextValue {
  isMarketDataLoading: boolean;
  isMarketDataInitialized: boolean;
  currentCoin: string;
  setCoin: (coin: string) => void;
}

const HyperliquidContext = createContext<HyperliquidContextValue>({
  isMarketDataLoading: true,
  isMarketDataInitialized: false,
  currentCoin: "BTC",
  setCoin: () => {},
});

export function useHyperliquid() {
  return useContext(HyperliquidContext);
}

interface HyperliquidProviderProps {
  children: ReactNode;
  initialCoin?: string;
}

export function HyperliquidProvider({ 
  children, 
  initialCoin = "BTC" 
}: HyperliquidProviderProps) {
  const { address, isConnected } = useAccount();
  
  // 初始化市场数据
  const { isLoading: isMarketDataLoading, isInitialized: isMarketDataInitialized } = useMarketData();
  
  // 初始化账户数据（当钱包连接时）
  useAccountState();

  // Store actions
  const currentCoin = useMarketStore((state) => state.currentCoin);
  const setCurrentCoin = useMarketStore((state) => state.setCurrentCoin);
  const setUserAddress = useUserStore((state) => state.setAddress);

  // 设置初始币种 - 只在组件挂载时运行一次
  useEffect(() => {
    if (initialCoin) {
      setCurrentCoin(initialCoin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 移除依赖，只在挂载时运行

  // 同步钱包地址到 user store
  useEffect(() => {
    setUserAddress(address || null);
  }, [address, setUserAddress]);

  const value: HyperliquidContextValue = {
    isMarketDataLoading,
    isMarketDataInitialized,
    currentCoin,
    setCoin: setCurrentCoin,
  };

  return (
    <HyperliquidContext.Provider value={value}>
      {children}
    </HyperliquidContext.Provider>
  );
}
