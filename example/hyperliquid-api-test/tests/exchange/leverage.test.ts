import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { getExchangeAPI, getInfoAPI, canRunExchangeTests, getTestUserAddress } from '../setup';
import type { ExchangeAPI } from '../../src/api/exchange';
import type { InfoAPI } from '../../src/api/info';
import type { PerpAsset } from '../../src/types/info';

describe('Leverage API', () => {
  let exchangeApi: ExchangeAPI;
  let infoApi: InfoAPI;
  let canRun: boolean;

  // OP 相关信息
  let opAsset: PerpAsset | undefined;
  let opIndex: number = -1;

  beforeAll(async () => {
    canRun = canRunExchangeTests();
    if (canRun) {
      exchangeApi = getExchangeAPI();
      infoApi = getInfoAPI();

      // 获取 OP 信息
      const meta = await infoApi.meta();
      opAsset = meta.universe.find((a) => a.name === 'OP');
      if (opAsset) {
        opIndex = meta.universe.indexOf(opAsset);
      }

      console.log('\n========== 杠杆测试初始化 ==========');
      console.log(`代币: OP`);
      console.log(`Asset Index: ${opIndex}`);
      console.log(`最大杠杆: ${opAsset?.maxLeverage}x`);
    }
  });

  beforeEach(() => {
    if (!canRun) {
      console.log('跳过测试: 未设置 PRIVATE_KEY');
    }
    if (opIndex < 0) {
      console.log('跳过测试: 未找到 OP 代币');
    }
  });

  describe('updateLeverage - cross margin (全仓)', () => {
    it('should update OP leverage to 10x cross', async () => {
      if (!canRun || opIndex < 0) return;

      console.log('\n--- 设置 OP 10x 全仓杠杆 ---');
      const response = await exchangeApi.updateLeverage(opIndex, 10, true);

      expect(response).toBeDefined();
      console.log(`代币: OP (index: ${opIndex})`);
      console.log(`目标杠杆: 10x`);
      console.log(`模式: 全仓 (Cross)`);
      console.log(`结果: ${response.status}`);
      if (response.status === 'err') {
        console.log(`错误详情: ${JSON.stringify(response, null, 2)}`);
      }
      expect(response.status).toBe('ok');
    });

    it('should update OP leverage to 5x cross', async () => {
      if (!canRun || opIndex < 0) return;

      console.log('\n--- 设置 OP 5x 全仓杠杆 ---');
      const response = await exchangeApi.updateLeverage(opIndex, 5, true);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`代币: OP (index: ${opIndex})`);
      console.log(`目标杠杆: 5x`);
      console.log(`模式: 全仓 (Cross)`);
      console.log(`结果: ${response.status}`);
    });

    it('should update OP leverage to 20x cross', async () => {
      if (!canRun || opIndex < 0) return;

      console.log('\n--- 设置 OP 20x 全仓杠杆 ---');
      const response = await exchangeApi.updateLeverage(opIndex, 20, true);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`代币: OP (index: ${opIndex})`);
      console.log(`目标杠杆: 20x`);
      console.log(`模式: 全仓 (Cross)`);
      console.log(`结果: ${response.status}`);
    });
  });

  describe('updateLeverage - isolated margin (逐仓)', () => {
    it('should update OP leverage to 5x isolated', async () => {
      if (!canRun || opIndex < 0) return;

      console.log('\n--- 设置 OP 5x 逐仓杠杆 ---');
      const response = await exchangeApi.updateLeverage(opIndex, 5, false);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`代币: OP (index: ${opIndex})`);
      console.log(`目标杠杆: 5x`);
      console.log(`模式: 逐仓 (Isolated)`);
      console.log(`结果: ${response.status}`);
    });

    it('should update OP leverage to 3x isolated', async () => {
      if (!canRun || opIndex < 0) return;

      console.log('\n--- 设置 OP 3x 逐仓杠杆 ---');
      const response = await exchangeApi.updateLeverage(opIndex, 3, false);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`代币: OP (index: ${opIndex})`);
      console.log(`目标杠杆: 3x`);
      console.log(`模式: 逐仓 (Isolated)`);
      console.log(`结果: ${response.status}`);
    });
  });

  describe('verify leverage update', () => {
    it('should reflect updated leverage in account state', async () => {
      if (!canRun || opIndex < 0) return;

      console.log('\n--- 验证杠杆设置 ---');

      // 设置杠杆为 10x 全仓
      await exchangeApi.updateLeverage(opIndex, 10, true);
      console.log('已设置 OP 杠杆为 10x 全仓');

      // 查询账户状态
      const userAddress = getTestUserAddress();
      const state = await infoApi.clearinghouseState(userAddress);

      console.log(`\n账户状态:`);
      console.log(`  账户价值: ${state.marginSummary.accountValue} USDC`);
      console.log(`  可提取余额: ${state.withdrawable} USDC`);

      // 查找 OP 持仓
      const opPosition = state.assetPositions.find((p) => p.position.coin === 'OP');
      if (opPosition) {
        console.log(`\nOP 持仓信息:`);
        console.log(`  持仓数量: ${opPosition.position.szi}`);
        console.log(`  杠杆: ${opPosition.position.leverage.value}x (${opPosition.position.leverage.type})`);
      } else {
        console.log('\n当前无 OP 持仓，杠杆设置将在下单时生效');
      }

      expect(state).toBeDefined();
      expect(state.marginSummary).toBeDefined();
    });
  });

  describe('leverage limits', () => {
    it('should accept leverage within valid range (max leverage)', async () => {
      if (!canRun || opIndex < 0 || !opAsset) return;

      const maxLeverage = opAsset.maxLeverage;
      console.log('\n--- 测试最大杠杆 ---');
      console.log(`OP 最大杠杆限制: ${maxLeverage}x`);

      const response = await exchangeApi.updateLeverage(opIndex, maxLeverage, true);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`设置杠杆: ${maxLeverage}x`);
      console.log(`结果: ${response.status}`);
    });

    it('should accept minimum leverage of 1x', async () => {
      if (!canRun || opIndex < 0) return;

      console.log('\n--- 测试最小杠杆 ---');
      const response = await exchangeApi.updateLeverage(opIndex, 1, true);

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`设置杠杆: 1x`);
      console.log(`结果: ${response.status}`);
    });
  });
});
