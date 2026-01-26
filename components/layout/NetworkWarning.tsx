/**
 * 网络警告组件
 * 当钱包连接到错误网络时显示警告并提供切换按钮
 */

'use client';

import { useNetworkCheck } from '@/hooks/useNetworkCheck';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface NetworkWarningProps {
  /** 是否可以关闭（仅关闭 UI，不影响检测） */
  dismissible?: boolean;
  /** 紧凑模式（用于表单内） */
  compact?: boolean;
}

export function NetworkWarning({ dismissible = false, compact = false }: NetworkWarningProps) {
  const {
    isConnected,
    isCorrectNetwork,
    expectedNetworkName,
    currentNetworkName,
    switchToCorrectNetwork,
    isSwitching,
  } = useNetworkCheck();
  const [dismissed, setDismissed] = useState(false);

  // 未连接钱包或网络正确时不显示
  if (!isConnected || isCorrectNetwork || dismissed) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
        <span className="text-yellow-500 flex-1">
          Wrong network. Switch to {expectedNetworkName}
        </span>
        <button
          onClick={switchToCorrectNetwork}
          disabled={isSwitching}
          className="px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded hover:bg-yellow-400 disabled:opacity-50"
        >
          {isSwitching ? 'Switching...' : 'Switch'}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center gap-3 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/30">
      <AlertTriangle className="w-4 h-4 text-yellow-500" />
      <span className="text-yellow-500 text-sm">
        You&apos;re connected to <span className="font-medium">{currentNetworkName}</span>. Please
        switch to <span className="font-medium">{expectedNetworkName}</span> to use this app.
      </span>
      <button
        onClick={switchToCorrectNetwork}
        disabled={isSwitching}
        className="px-4 py-1 bg-yellow-500 text-black text-sm font-medium rounded hover:bg-yellow-400 disabled:opacity-50 transition-colors"
      >
        {isSwitching ? 'Switching...' : 'Switch Network'}
      </button>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 p-1 text-yellow-500/70 hover:text-yellow-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * 网络检查包装器
 * 当网络错误时显示警告，阻止子组件渲染
 */
interface NetworkGateProps {
  children: React.ReactNode;
  /** 网络错误时显示的内容，默认显示警告 */
  fallback?: React.ReactNode;
}

export function NetworkGate({ children, fallback }: NetworkGateProps) {
  const {
    isConnected,
    isCorrectNetwork,
    expectedNetworkName,
    switchToCorrectNetwork,
    isSwitching,
  } = useNetworkCheck();

  if (!isConnected) {
    return <>{children}</>;
  }

  if (!isCorrectNetwork) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <div>
          <h3 className="text-lg font-medium text-white mb-1">Wrong Network</h3>
          <p className="text-text-secondary text-sm">
            Please switch to {expectedNetworkName} to continue
          </p>
        </div>
        <button
          onClick={switchToCorrectNetwork}
          disabled={isSwitching}
          className="px-6 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-400 disabled:opacity-50 transition-colors"
        >
          {isSwitching ? 'Switching...' : 'Switch Network'}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
