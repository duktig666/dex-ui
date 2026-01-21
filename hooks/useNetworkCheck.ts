/**
 * 网络检测 Hook
 * 检测钱包网络是否匹配 HyperLiquid 要求的网络
 */

import { useAccount, useSwitchChain } from 'wagmi';
import { useCallback, useMemo } from 'react';
import { CURRENT_NETWORK, IS_TESTNET } from '@/lib/hyperliquid/constants';
import { REQUIRED_CHAIN_ID } from '@/lib/wagmi/config';

export interface NetworkCheckResult {
  /** 当前钱包连接的 chainId */
  currentChainId: number | undefined;
  /** 期望的 chainId */
  expectedChainId: number;
  /** 钱包是否连接 */
  isConnected: boolean;
  /** 网络是否正确 */
  isCorrectNetwork: boolean;
  /** 网络名称（显示用） */
  expectedNetworkName: string;
  /** 当前网络名称 */
  currentNetworkName: string;
  /** 是否是测试网 */
  isTestnet: boolean;
  /** 切换到正确网络 */
  switchToCorrectNetwork: () => Promise<void>;
  /** 是否正在切换网络 */
  isSwitching: boolean;
  /** 切换错误 */
  switchError: Error | null;
}

// 常见网络名称映射
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  42161: 'Arbitrum One',
  421614: 'Arbitrum Sepolia',
  8453: 'Base',
  10: 'Optimism',
  137: 'Polygon',
};

export function useNetworkCheck(): NetworkCheckResult {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();

  const expectedChainId = REQUIRED_CHAIN_ID;
  const isCorrectNetwork = isConnected && chainId === expectedChainId;

  const expectedNetworkName = IS_TESTNET ? 'Arbitrum Sepolia' : 'Arbitrum One';
  const currentNetworkName = chainId ? (CHAIN_NAMES[chainId] || `Chain ${chainId}`) : 'Not Connected';

  const switchToCorrectNetwork = useCallback(async () => {
    if (!switchChain) {
      console.error('switchChain not available');
      return;
    }
    
    try {
      await switchChain({ chainId: expectedChainId });
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }, [switchChain, expectedChainId]);

  return useMemo(() => ({
    currentChainId: chainId,
    expectedChainId,
    isConnected,
    isCorrectNetwork,
    expectedNetworkName,
    currentNetworkName,
    isTestnet: IS_TESTNET,
    switchToCorrectNetwork,
    isSwitching,
    switchError: switchError as Error | null,
  }), [
    chainId, 
    expectedChainId, 
    isConnected, 
    isCorrectNetwork, 
    expectedNetworkName, 
    currentNetworkName,
    switchToCorrectNetwork, 
    isSwitching, 
    switchError
  ]);
}

/**
 * 检查是否可以执行需要签名的操作
 * 返回 true 表示可以执行，false 表示需要先切换网络
 */
export function useCanSign(): boolean {
  const { isConnected, isCorrectNetwork } = useNetworkCheck();
  return isConnected && isCorrectNetwork;
}
