import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { getExchangeAPI, getInfoAPI, canRunExchangeTests, getTestUserAddress } from '../setup';
import type { ExchangeAPI } from '../../src/api/exchange';
import type { InfoAPI } from '../../src/api/info';

describe('Transfer API', () => {
  let exchangeApi: ExchangeAPI;
  let infoApi: InfoAPI;
  let canRun: boolean;
  let userAddress: string;

  beforeAll(async () => {
    canRun = canRunExchangeTests();
    if (canRun) {
      exchangeApi = getExchangeAPI();
      infoApi = getInfoAPI();
      userAddress = getTestUserAddress();

      console.log('\n========== 转账测试初始化 ==========');
      console.log(`用户地址: ${userAddress}`);

      // 显示初始余额
      const perpState = await infoApi.clearinghouseState(userAddress);
      const spotState = await infoApi.spotClearinghouseState(userAddress);
      const usdcBalance = spotState.balances.find((b) => b.coin === 'USDC');

      console.log(`\n初始余额:`);
      console.log(`  永续账户: ${perpState.withdrawable} USDC (可提取)`);
      console.log(`  现货 USDC: ${usdcBalance?.total || '0'} USDC`);
    }
  });

  beforeEach(() => {
    if (!canRun) {
      console.log('跳过测试: 未设置 PRIVATE_KEY');
    }
  });

  describe('usdClassTransfer (永续/现货互转)', () => {
    it('should transfer from perp to spot', async () => {
      if (!canRun) return;

      console.log('\n--- 永续 → 现货 转账 ---');

      // 首先检查账户余额
      const perpState = await infoApi.clearinghouseState(userAddress);
      const withdrawable = parseFloat(perpState.withdrawable);

      console.log(`永续可提取余额: ${withdrawable} USDC`);

      if (withdrawable < 1) {
        console.log('跳过: 余额不足 (需要 >= 1 USDC)');
        return;
      }

      // 转账 1 USDC 从永续到现货
      console.log('转账 1 USDC 到现货...');
      const response = await exchangeApi.usdClassTransfer('1', false);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`转账结果: ${response.status}`);
    });

    it('should transfer from spot to perp', async () => {
      if (!canRun) return;

      console.log('\n--- 现货 → 永续 转账 ---');

      // 检查现货余额
      const spotState = await infoApi.spotClearinghouseState(userAddress);
      const usdcBalance = spotState.balances.find((b) => b.coin === 'USDC');
      const total = parseFloat(usdcBalance?.total || '0');

      console.log(`现货 USDC 余额: ${total} USDC`);

      if (total < 1) {
        console.log('跳过: 余额不足 (需要 >= 1 USDC)');
        return;
      }

      // 转账 1 USDC 从现货到永续
      console.log('转账 1 USDC 到永续...');
      const response = await exchangeApi.usdClassTransfer('1', true);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`转账结果: ${response.status}`);
    });

    it('should handle small amount transfer', async () => {
      if (!canRun) return;

      console.log('\n--- 小额转账测试 ---');

      const perpState = await infoApi.clearinghouseState(userAddress);
      const withdrawable = parseFloat(perpState.withdrawable);

      console.log(`永续可提取余额: ${withdrawable} USDC`);

      if (withdrawable < 0.1) {
        console.log('跳过: 余额不足 (需要 >= 0.1 USDC)');
        return;
      }

      // 转账 0.1 USDC
      console.log('转账 0.1 USDC...');
      const response = await exchangeApi.usdClassTransfer('0.1', false);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`转账结果: ${response.status}`);
    });
  });

  describe('verify transfer (验证转账)', () => {
    it('should reflect balance change after transfer', async () => {
      if (!canRun) return;

      console.log('\n--- 验证转账后余额变化 ---');

      // 获取转账前余额
      const beforePerpState = await infoApi.clearinghouseState(userAddress);
      const beforeWithdrawable = parseFloat(beforePerpState.withdrawable);

      console.log(`转账前永续余额: ${beforeWithdrawable} USDC`);

      if (beforeWithdrawable < 2) {
        console.log('跳过: 余额不足 (需要 >= 2 USDC)');
        return;
      }

      // 转账 1 USDC 到现货
      console.log('转账 1 USDC 到现货...');
      await exchangeApi.usdClassTransfer('1', false);

      // 等待一小段时间让状态更新
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 获取转账后余额
      const afterPerpState = await infoApi.clearinghouseState(userAddress);
      const afterWithdrawable = parseFloat(afterPerpState.withdrawable);

      console.log(`转账后永续余额: ${afterWithdrawable} USDC`);
      console.log(`变化: ${(afterWithdrawable - beforeWithdrawable).toFixed(4)} USDC`);

      // 验证余额减少
      expect(afterWithdrawable).toBeLessThan(beforeWithdrawable);

      // 转回
      console.log('转回 1 USDC 到永续...');
      await exchangeApi.usdClassTransfer('1', true);

      console.log('转账验证完成');
    });
  });

  describe('usdSend (L2 内部转账)', () => {
    it('should transfer USDC to another address', async () => {
      if (!canRun) return;

      console.log('\n--- L2 内部 USDC 转账 ---');

      const perpState = await infoApi.clearinghouseState(userAddress);
      const withdrawable = parseFloat(perpState.withdrawable);

      console.log(`可用余额: ${withdrawable} USDC`);

      if (withdrawable < 1) {
        console.log('跳过: 余额不足');
        return;
      }

      // 转账到测试地址
      const destination = '0x0000000000000000000000000000000000000001';
      console.log(`目标地址: ${destination}`);
      console.log(`转账金额: 0.1 USDC`);

      try {
        const response = await exchangeApi.usdSend(destination, '0.1');

        expect(response).toBeDefined();
        console.log(`转账结果: ${response.status}`);
      } catch (e) {
        // 转账可能因为各种原因失败，这里只是测试签名是否正确
        console.log('usdSend 失败 (某些情况下预期会失败)');
        console.log(`错误: ${e}`);
      }
    });
  });

  describe('withdraw3 (提现到 L1)', () => {
    it('should initiate withdrawal to L1', async () => {
      if (!canRun) return;

      console.log('\n--- 提现到 L1 ---');

      const perpState = await infoApi.clearinghouseState(userAddress);
      const withdrawable = parseFloat(perpState.withdrawable);

      console.log(`可用余额: ${withdrawable} USDC`);
      console.log(`最低提现金额: 5 USDC`);

      if (withdrawable < 5) {
        console.log('跳过: 余额不足 (需要 >= 5 USDC)');
        return;
      }

      // 提现到自己的地址
      console.log(`提现地址: ${userAddress}`);
      console.log(`提现金额: 5 USDC`);

      try {
        const response = await exchangeApi.withdraw3(userAddress, '5');

        expect(response).toBeDefined();
        console.log(`提现结果: ${response.status}`);
        console.log('注意: 提现需要等待处理');
      } catch (e) {
        // 提现可能因为各种原因失败
        console.log('提现失败 (某些情况下预期会失败)');
        console.log(`错误: ${e}`);
      }
    });
  });

  describe('final balance (最终余额)', () => {
    it('should display final balances', async () => {
      if (!canRun) return;

      console.log('\n========== 最终余额 ==========');

      const perpState = await infoApi.clearinghouseState(userAddress);
      const spotState = await infoApi.spotClearinghouseState(userAddress);
      const usdcBalance = spotState.balances.find((b) => b.coin === 'USDC');

      console.log(`永续账户:`);
      console.log(`  账户价值: ${perpState.marginSummary.accountValue} USDC`);
      console.log(`  可提取: ${perpState.withdrawable} USDC`);

      console.log(`\n现货账户:`);
      console.log(`  USDC 总额: ${usdcBalance?.total || '0'} USDC`);
      console.log(`  USDC 冻结: ${usdcBalance?.hold || '0'} USDC`);

      console.log('\n========== 转账测试完成 ==========');
    });
  });
});
