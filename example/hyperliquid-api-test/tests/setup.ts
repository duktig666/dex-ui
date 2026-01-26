import { config } from 'dotenv';
import { privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http, type WalletClient, type Account } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { HttpClient } from '../src/utils/http-client';
import { InfoAPI } from '../src/api/info';
import { ExchangeAPI } from '../src/api/exchange';
import { CONFIG } from '../src/config';

// 加载环境变量
config();

/**
 * 获取测试钱包
 * 从 PRIVATE_KEY 环境变量读取私钥
 */
export function getTestWallet(): { account: Account; walletClient: WalletClient } {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required for exchange tests');
  }

  // 确保私钥格式正确
  const formattedKey = privateKey.startsWith('0x')
    ? (privateKey as `0x${string}`)
    : (`0x${privateKey}` as `0x${string}`);

  const account = privateKeyToAccount(formattedKey);
  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(),
  });

  return { account, walletClient };
}

/**
 * 获取测试用户地址
 * 优先从环境变量读取，否则使用默认零地址
 */
export function getTestUserAddress(): string {
  const privateKey = process.env.PRIVATE_KEY;
  if (privateKey) {
    const { account } = getTestWallet();
    return account.address;
  }
  return CONFIG.TEST_USER;
}

/**
 * 获取 HTTP 客户端
 */
export function getHttpClient(): HttpClient {
  return new HttpClient(CONFIG.REST_API);
}

/**
 * 获取 Info API 客户端
 */
export function getInfoAPI(): InfoAPI {
  return new InfoAPI(getHttpClient());
}

/**
 * 获取 Exchange API 客户端
 * 注意：需要 PRIVATE_KEY 环境变量
 */
export function getExchangeAPI(): ExchangeAPI {
  const { account, walletClient } = getTestWallet();
  return new ExchangeAPI(getHttpClient(), walletClient, account);
}

/**
 * 检查是否可以运行 Exchange 测试
 */
export function canRunExchangeTests(): boolean {
  return !!process.env.PRIVATE_KEY;
}

/**
 * 跳过 Exchange 测试的辅助函数
 */
export function skipIfNoPrivateKey(): void {
  if (!canRunExchangeTests()) {
    console.log('Skipping test: PRIVATE_KEY not set');
  }
}
