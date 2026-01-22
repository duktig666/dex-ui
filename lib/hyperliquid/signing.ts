/**
 * HyperLiquid EIP-712 签名工具
 */

import { L1_ACTION_DOMAIN, EIP712_DOMAIN, IS_TESTNET } from './constants';

export interface ParsedSignature {
  r: string;
  s: string;
  v: number;
}

/**
 * 解析签名字符串为 r, s, v 格式
 * Hyperliquid API 需要这种格式
 */
export function parseSignature(signature: string): ParsedSignature {
  // 移除 0x 前缀（如果有）
  const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
  
  const r = '0x' + sig.slice(0, 64);
  const s = '0x' + sig.slice(64, 128);
  const v = parseInt(sig.slice(128, 130), 16);

  return { r, s, v };
}

// 定义签名函数类型
type SignTypedDataFn = (params: {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  primaryType: string;
  message: Record<string, unknown>;
}) => Promise<string>;

/**
 * 计算 action hash
 * 用于 L1 Action 签名
 */
function actionHash(
  action: Record<string, unknown>,
  vaultAddress: string | null,
  nonce: number
): string {
  // 简化处理：直接将 action 序列化
  const actionStr = JSON.stringify(action);
  const dataToHash = vaultAddress
    ? `${actionStr}${vaultAddress}${nonce}`
    : `${actionStr}${nonce}`;
  
  // 使用 Web Crypto API 计算 hash (在浏览器环境)
  // 这里返回一个占位符，实际签名时会用 EIP-712 structured data
  return dataToHash;
}

/**
 * 构建 L1 Action 的 EIP-712 类型数据
 */
function buildL1ActionTypedData(
  connectionId: string,
  isTestnet: boolean
) {
  return {
    domain: {
      ...L1_ACTION_DOMAIN,
      chainId: isTestnet ? 421614 : 42161,
    },
    types: {
      Agent: [
        { name: 'source', type: 'string' },
        { name: 'connectionId', type: 'bytes32' },
      ],
    },
    primaryType: 'Agent',
    message: {
      source: isTestnet ? 'b' : 'a', // 'a' for mainnet, 'b' for testnet
      connectionId,
    },
  };
}

/**
 * 为 L1 Action 签名
 * 用于交易类操作 (下单、撤单、修改订单、更新杠杆等)
 */
export async function signL1Action(
  action: Record<string, unknown>,
  nonce: number,
  signTypedData: SignTypedDataFn,
  vaultAddress: string | null = null,
  isTestnet: boolean = IS_TESTNET
): Promise<string> {
  // 构建要签名的数据
  // HyperLiquid 使用特殊的签名方案
  const actionData = {
    ...action,
    nonce,
    ...(vaultAddress ? { vaultAddress } : {}),
  };

  // 将 action 数据转换为 bytes32 格式的 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(actionData));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const connectionId = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const typedData = buildL1ActionTypedData(connectionId, isTestnet);

  // 调用钱包签名
  const signature = await signTypedData({
    domain: typedData.domain as Record<string, unknown>,
    types: typedData.types as Record<string, unknown>,
    primaryType: typedData.primaryType,
    message: typedData.message as Record<string, unknown>,
  });

  return signature;
}

/**
 * 构建 User Signed Action 的 EIP-712 类型数据
 * 用于授权类操作 (ApproveBuilderFee 等)
 */
function buildUserSignedActionTypedData(
  action: Record<string, unknown>,
  isTestnet: boolean
) {
  // 根据 action 类型构建不同的类型定义
  const actionType = action.type as string;

  if (actionType === 'approveBuilderFee') {
    return {
      domain: {
        name: 'HyperliquidSignTransaction',
        version: '1',
        chainId: isTestnet ? 421614 : 42161,
        verifyingContract: '0x0000000000000000000000000000000000000000',
      },
      types: {
        'HyperliquidTransaction:ApproveBuilderFee': [
          { name: 'hyperliquidChain', type: 'string' },
          { name: 'maxFeeRate', type: 'string' },
          { name: 'builder', type: 'address' },
          { name: 'nonce', type: 'uint64' },
        ],
      },
      primaryType: 'HyperliquidTransaction:ApproveBuilderFee',
      message: {
        hyperliquidChain: action.hyperliquidChain,
        maxFeeRate: action.maxFeeRate,
        builder: (action.builder as string).toLowerCase(), // 必须小写
        nonce: action.nonce,
      },
    };
  }

  throw new Error(`Unknown action type: ${actionType}`);
}

/**
 * 为 User Signed Action 签名
 * 用于授权类操作 (ApproveBuilderFee, ApproveAgent 等)
 */
export async function signUserSignedAction(
  action: Record<string, unknown>,
  signTypedData: SignTypedDataFn,
  isTestnet: boolean = IS_TESTNET
): Promise<string> {
  const typedData = buildUserSignedActionTypedData(action, isTestnet);

  const signature = await signTypedData({
    domain: typedData.domain as Record<string, unknown>,
    types: typedData.types as Record<string, unknown>,
    primaryType: typedData.primaryType,
    message: typedData.message as Record<string, unknown>,
  });

  return signature;
}

/**
 * 为内部转账签名
 */
export async function signUsdTransfer(
  destination: string,
  amount: string,
  nonce: number,
  signTypedData: SignTypedDataFn,
  isTestnet: boolean = IS_TESTNET
): Promise<string> {
  const typedData = {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: isTestnet ? 421614 : 42161,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    types: {
      'HyperliquidTransaction:UsdSend': [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'destination', type: 'string' },
        { name: 'amount', type: 'string' },
        { name: 'time', type: 'uint64' },
      ],
    },
    primaryType: 'HyperliquidTransaction:UsdSend',
    message: {
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      destination,
      amount,
      time: nonce,
    },
  };

  return signTypedData({
    domain: typedData.domain as Record<string, unknown>,
    types: typedData.types as Record<string, unknown>,
    primaryType: typedData.primaryType,
    message: typedData.message as Record<string, unknown>,
  });
}

/**
 * 为提现签名
 */
export async function signWithdraw(
  destination: string,
  amount: string,
  nonce: number,
  signTypedData: SignTypedDataFn,
  isTestnet: boolean = IS_TESTNET
): Promise<string> {
  const typedData = {
    domain: {
      name: 'HyperliquidSignTransaction',
      version: '1',
      chainId: isTestnet ? 421614 : 42161,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    types: {
      'HyperliquidTransaction:Withdraw': [
        { name: 'hyperliquidChain', type: 'string' },
        { name: 'destination', type: 'string' },
        { name: 'amount', type: 'string' },
        { name: 'time', type: 'uint64' },
      ],
    },
    primaryType: 'HyperliquidTransaction:Withdraw',
    message: {
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      destination,
      amount,
      time: nonce,
    },
  };

  return signTypedData({
    domain: typedData.domain as Record<string, unknown>,
    types: typedData.types as Record<string, unknown>,
    primaryType: typedData.primaryType,
    message: typedData.message as Record<string, unknown>,
  });
}
