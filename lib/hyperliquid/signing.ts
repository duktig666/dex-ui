/**
 * HyperLiquid EIP-712 签名工具
 */

import { keccak256, encodeAbiParameters, parseAbiParameters, toHex } from 'viem';
import { encode as msgpackEncode } from '@msgpack/msgpack';
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
 * 计算 connectionId
 * HyperLiquid 使用 keccak256(abi.encode(actionHash, nonce)) 或
 * keccak256(abi.encode(actionHash, vaultAddress, nonce))
 */
function computeConnectionId(
  actionHash: `0x${string}`,
  vaultAddress: string | null,
  nonce: number
): `0x${string}` {
  if (vaultAddress) {
    return keccak256(
      encodeAbiParameters(
        parseAbiParameters('bytes32, address, uint64'),
        [actionHash, vaultAddress as `0x${string}`, BigInt(nonce)]
      )
    );
  }
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters('bytes32, uint64'),
      [actionHash, BigInt(nonce)]
    )
  );
}

/**
 * 构建 L1 Action 的 EIP-712 类型数据
 * 注意：L1 Action 使用固定的 chainId 1337 (HyperLiquid L1)
 */
function buildL1ActionTypedData(
  connectionId: string,
  isTestnet: boolean
) {
  return {
    domain: {
      ...L1_ACTION_DOMAIN,
      // chainId 固定为 1337，不要覆盖
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
 * 
 * HyperLiquid 签名流程:
 * 1. 使用 msgpack 编码 action
 * 2. 计算 keccak256(msgpack(action)) 得到 actionHash
 * 3. 计算 connectionId = keccak256(abi.encode(actionHash, nonce))
 * 4. EIP-712 签名 { source: 'a'|'b', connectionId }
 */
export async function signL1Action(
  action: Record<string, unknown>,
  nonce: number,
  signTypedData: SignTypedDataFn,
  vaultAddress: string | null = null,
  isTestnet: boolean = IS_TESTNET
): Promise<string> {
  // 1. 使用 msgpack 编码 action
  const actionBytes = msgpackEncode(action);
  
  // 2. 计算 action hash (keccak256)
  const actionHash = keccak256(toHex(actionBytes)) as `0x${string}`;
  
  // 3. 计算 connectionId
  const connectionId = computeConnectionId(actionHash, vaultAddress, nonce);

  // 4. 构建 EIP-712 类型数据
  const typedData = buildL1ActionTypedData(connectionId, isTestnet);

  // 5. 调用钱包签名
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
