import { encode } from '@msgpack/msgpack';
import { keccak256, type WalletClient, type Account, toHex, hexToBytes } from 'viem';
import type { Signature, EIP712Domain, L1Action, UserSignedAction } from '../types/exchange';
import { CONFIG, HYPERLIQUID_CHAIN } from '../config';

// ============================================================
// EIP-712 类型定义 (按照 HyperLiquid Python SDK 规范)
// ============================================================

/** L1Action 签名域 - 与 HyperLiquid SDK 一致 */
const L1_ACTION_DOMAIN = {
  name: 'Exchange',
  version: '1',
  chainId: 1337,
  verifyingContract: '0x0000000000000000000000000000000000000000' as `0x${string}`,
} as const;

/** L1Action 签名类型 - 使用 Agent (phantom agent) */
const L1_ACTION_TYPES = {
  Agent: [
    { name: 'source', type: 'string' },
    { name: 'connectionId', type: 'bytes32' },
  ],
} as const;

/** ApproveBuilderFee 签名类型 (字段顺序必须与 Python SDK 一致: hyperliquidChain, maxFeeRate, builder, nonce) */
const APPROVE_BUILDER_FEE_TYPES = {
  'HyperliquidTransaction:ApproveBuilderFee': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'maxFeeRate', type: 'string' },
    { name: 'builder', type: 'address' },
    { name: 'nonce', type: 'uint64' },
  ],
} as const;

/** UsdSend 签名类型 */
const USD_SEND_TYPES = {
  HyperliquidTransaction: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'destination', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'time', type: 'uint64' },
  ],
} as const;

/** Withdraw3 签名类型 */
const WITHDRAW3_TYPES = {
  HyperliquidTransaction: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'destination', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'time', type: 'uint64' },
  ],
} as const;

/** SpotSend 签名类型 */
const SPOT_SEND_TYPES = {
  HyperliquidTransaction: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'destination', type: 'string' },
    { name: 'token', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'time', type: 'uint64' },
  ],
} as const;

/** UsdClassTransfer 签名类型 (字段顺序与 Python SDK 一致) */
const USD_CLASS_TRANSFER_TYPES = {
  'HyperliquidTransaction:UsdClassTransfer': [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'amount', type: 'string' },
    { name: 'toPerp', type: 'bool' },
    { name: 'nonce', type: 'uint64' },
  ],
} as const;

/** ApproveAgent 签名类型 */
const APPROVE_AGENT_TYPES = {
  HyperliquidTransaction: [
    { name: 'hyperliquidChain', type: 'string' },
    { name: 'agentAddress', type: 'address' },
    { name: 'agentName', type: 'string' },
    { name: 'nonce', type: 'uint64' },
  ],
} as const;

// ============================================================
// 签名辅助函数
// ============================================================

/**
 * 解析签名字符串为 {r, s, v} 对象
 * 签名格式: 0x + r(64) + s(64) + v(2) = 132 字符
 */
export function parseSignature(signature: string): Signature {
  const sig = signature.startsWith('0x') ? signature.slice(2) : signature;
  if (sig.length !== 130) {
    throw new Error(`Invalid signature length: expected 130, got ${sig.length}`);
  }
  return {
    r: '0x' + sig.slice(0, 64),
    s: '0x' + sig.slice(64, 128),
    v: parseInt(sig.slice(128, 130), 16),
  };
}

/**
 * 注意: HyperLiquid Python SDK 不对键进行排序
 * msgpack 编码按照对象字段的声明顺序进行
 * 因此调用方必须确保 action 对象的字段顺序与 Python SDK 一致
 */

/**
 * 将地址转换为字节数组
 */
function addressToBytes(address: string): Uint8Array {
  const hex = address.startsWith('0x') ? address.slice(2) : address;
  return hexToBytes(`0x${hex}` as `0x${string}`);
}

/**
 * 计算 L1 Action 的哈希值
 * 按照 HyperLiquid Python SDK 规范:
 * data = msgpack(action) + nonce(8字节大端) + vault_flag + [vault_address]
 *
 * 重要: action 对象的字段顺序必须与 Python SDK 一致，不能重新排序!
 */
export function computeActionHash(
  action: L1Action,
  nonce: number,
  vaultAddress: string | null = null
): `0x${string}` {
  // 1. msgpack 编码 action (注意: 不排序键，按原始顺序编码)
  const actionData = encode(action);

  // 2. nonce 转为 8 字节大端序
  const nonceBytes = new Uint8Array(8);
  const view = new DataView(nonceBytes.buffer);
  view.setBigUint64(0, BigInt(nonce), false); // big-endian

  // 3. vault 标志和地址
  let vaultData: Uint8Array;
  if (vaultAddress === null || vaultAddress === '0x0000000000000000000000000000000000000000') {
    vaultData = new Uint8Array([0]); // 无 vault
  } else {
    const addrBytes = addressToBytes(vaultAddress);
    vaultData = new Uint8Array(1 + 20);
    vaultData[0] = 1;
    vaultData.set(addrBytes, 1);
  }

  // 4. 拼接所有数据
  const totalLength = actionData.length + nonceBytes.length + vaultData.length;
  const combined = new Uint8Array(totalLength);
  combined.set(actionData, 0);
  combined.set(nonceBytes, actionData.length);
  combined.set(vaultData, actionData.length + nonceBytes.length);

  // 5. keccak256 哈希
  return keccak256(combined);
}

/**
 * 构造 phantom agent
 * source: "a" = mainnet, "b" = testnet
 */
function constructPhantomAgent(hash: `0x${string}`, isMainnet: boolean) {
  return {
    source: isMainnet ? 'a' : 'b',
    connectionId: hash,
  };
}

/**
 * 签名 L1 动作 (order, cancel, updateLeverage 等)
 * 使用 HyperLiquid Python SDK 的 phantom agent 签名方式
 */
export async function signL1Action(
  walletClient: WalletClient,
  account: Account,
  action: L1Action,
  nonce: number,
  vaultAddress: `0x${string}` | null = null
): Promise<Signature> {
  // 1. 计算 action hash
  const actionHash = computeActionHash(action, nonce, vaultAddress);

  // 2. 构造 phantom agent
  const isMainnet = CONFIG.CHAIN_ID === 42161;
  const phantomAgent = constructPhantomAgent(actionHash, isMainnet);

  // 3. EIP-712 签名
  const signature = await walletClient.signTypedData({
    account,
    domain: L1_ACTION_DOMAIN,
    types: L1_ACTION_TYPES,
    primaryType: 'Agent',
    message: phantomAgent,
  });

  return parseSignature(signature);
}

/**
 * 构建 ApproveBuilderFee 动作签名消息
 * 字段顺序与 Python SDK 一致: hyperliquidChain, maxFeeRate, builder, nonce
 */
export function buildApproveBuilderFeeMessage(
  builder: string,
  maxFeeRate: string,
  nonce: number
) {
  return {
    hyperliquidChain: HYPERLIQUID_CHAIN,
    maxFeeRate,
    builder: builder.toLowerCase() as `0x${string}`,
    nonce: BigInt(nonce),
  };
}

/**
 * 签名 ApproveBuilderFee 动作
 */
export async function signApproveBuilderFee(
  walletClient: WalletClient,
  account: Account,
  builder: string,
  maxFeeRate: string,
  nonce: number
): Promise<Signature> {
  const message = buildApproveBuilderFeeMessage(builder, maxFeeRate, nonce);

  const signature = await walletClient.signTypedData({
    account,
    domain: CONFIG.DOMAIN as EIP712Domain,
    types: APPROVE_BUILDER_FEE_TYPES,
    primaryType: 'HyperliquidTransaction:ApproveBuilderFee',
    message,
  });

  return parseSignature(signature);
}

/**
 * 构建 UsdSend 动作签名消息
 */
export function buildUsdSendMessage(
  destination: string,
  amount: string,
  time: number
) {
  return {
    hyperliquidChain: HYPERLIQUID_CHAIN,
    destination: destination.toLowerCase(),
    amount,
    time: BigInt(time),
  };
}

/**
 * 签名 UsdSend 动作
 */
export async function signUsdSend(
  walletClient: WalletClient,
  account: Account,
  destination: string,
  amount: string,
  time: number
): Promise<Signature> {
  const message = buildUsdSendMessage(destination, amount, time);

  const signature = await walletClient.signTypedData({
    account,
    domain: CONFIG.DOMAIN as EIP712Domain,
    types: USD_SEND_TYPES,
    primaryType: 'HyperliquidTransaction',
    message,
  });

  return parseSignature(signature);
}

/**
 * 构建 Withdraw3 动作签名消息
 */
export function buildWithdraw3Message(
  destination: string,
  amount: string,
  time: number
) {
  return {
    hyperliquidChain: HYPERLIQUID_CHAIN,
    destination: destination.toLowerCase(),
    amount,
    time: BigInt(time),
  };
}

/**
 * 签名 Withdraw3 动作
 */
export async function signWithdraw3(
  walletClient: WalletClient,
  account: Account,
  destination: string,
  amount: string,
  time: number
): Promise<Signature> {
  const message = buildWithdraw3Message(destination, amount, time);

  const signature = await walletClient.signTypedData({
    account,
    domain: CONFIG.DOMAIN as EIP712Domain,
    types: WITHDRAW3_TYPES,
    primaryType: 'HyperliquidTransaction',
    message,
  });

  return parseSignature(signature);
}

/**
 * 签名 SpotSend 动作
 */
export async function signSpotSend(
  walletClient: WalletClient,
  account: Account,
  destination: string,
  token: string,
  amount: string,
  time: number
): Promise<Signature> {
  const message = {
    hyperliquidChain: HYPERLIQUID_CHAIN,
    destination: destination.toLowerCase(),
    token,
    amount,
    time: BigInt(time),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: CONFIG.DOMAIN as EIP712Domain,
    types: SPOT_SEND_TYPES,
    primaryType: 'HyperliquidTransaction',
    message,
  });

  return parseSignature(signature);
}

/**
 * 签名 ApproveAgent 动作
 */
export async function signApproveAgent(
  walletClient: WalletClient,
  account: Account,
  agentAddress: string,
  agentName: string,
  nonce: number
): Promise<Signature> {
  const message = {
    hyperliquidChain: HYPERLIQUID_CHAIN,
    agentAddress: agentAddress.toLowerCase() as `0x${string}`,
    agentName: agentName || '',
    nonce: BigInt(nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: CONFIG.DOMAIN as EIP712Domain,
    types: APPROVE_AGENT_TYPES,
    primaryType: 'HyperliquidTransaction',
    message,
  });

  return parseSignature(signature);
}

/**
 * 签名 UsdClassTransfer 动作 (永续/现货互转)
 */
export async function signUsdClassTransfer(
  walletClient: WalletClient,
  account: Account,
  amount: string,
  toPerp: boolean,
  nonce: number
): Promise<Signature> {
  const message = {
    hyperliquidChain: HYPERLIQUID_CHAIN,
    amount,
    toPerp,
    nonce: BigInt(nonce),
  };

  const signature = await walletClient.signTypedData({
    account,
    domain: CONFIG.DOMAIN as EIP712Domain,
    types: USD_CLASS_TRANSFER_TYPES,
    primaryType: 'HyperliquidTransaction:UsdClassTransfer',
    message,
  });

  return parseSignature(signature);
}
