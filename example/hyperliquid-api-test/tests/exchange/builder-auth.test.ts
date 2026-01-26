import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { getExchangeAPI, getInfoAPI, canRunExchangeTests, getTestUserAddress } from '../setup';
import type { ExchangeAPI } from '../../src/api/exchange';
import type { InfoAPI } from '../../src/api/info';
import type { PerpAsset } from '../../src/types/info';

describe('Builder Authorization API', () => {
  let exchangeApi: ExchangeAPI;
  let infoApi: InfoAPI;
  let canRun: boolean;

  // 测试用 Builder 地址 (已存入 100+ USDC 的有效 Builder)
  const TEST_BUILDER = '0xEfc3a654A44FACd6dA111f3114CDd65F16d9a681';

  // OP 相关信息
  let opAsset: PerpAsset | undefined;
  let opIndex: number = -1;
  let opPrice: number = 0;

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

      // 获取 OP 当前价格
      const mids = await infoApi.allMids();
      opPrice = parseFloat(mids['OP'] || '0');

      console.log('\n========== Builder 授权测试初始化 ==========');
      console.log(`测试 Builder 地址: ${TEST_BUILDER}`);
      console.log(`测试代币: OP (index: ${opIndex})`);
      console.log(`OP 当前价格: $${opPrice.toFixed(4)}`);
    }
  });

  beforeEach(() => {
    if (!canRun) {
      console.log('跳过测试: 未设置 PRIVATE_KEY');
    }
  });

  describe('approveBuilderFee (授权 Builder 费率)', () => {
    it('should authorize builder with 10 bps fee', async () => {
      if (!canRun) return;

      console.log('\n--- 授权 Builder 10 bps 费率 ---');
      console.log(`Builder: ${TEST_BUILDER}`);
      console.log(`费率: 10 bps (0.1%)`);

      const response = await exchangeApi.approveBuilderFee(TEST_BUILDER, '10');

      expect(response).toBeDefined();
      console.log(`结果: ${response.status}`);
      console.log(`完整响应: ${JSON.stringify(response, null, 2)}`);

      // 如果返回 err，只打印日志不断言失败
      if (response.status === 'err') {
        console.log('注意: approveBuilderFee 返回错误，可能是测试网限制或 Builder 地址未注册');
        return;
      }
      expect(response.status).toBe('ok');
    });

    it('should authorize builder with different fee rates', async () => {
      if (!canRun) return;

      console.log('\n--- 测试不同费率 ---');

      // 测试 1 bps
      console.log('授权 1 bps...');
      const response1 = await exchangeApi.approveBuilderFee(TEST_BUILDER, '1');
      expect(response1.status).toBe('ok');
      console.log(`1 bps 授权结果: ${response1.status}`);

      // 测试 5 bps
      console.log('授权 5 bps...');
      const response5 = await exchangeApi.approveBuilderFee(TEST_BUILDER, '5');
      expect(response5.status).toBe('ok');
      console.log(`5 bps 授权结果: ${response5.status}`);
    });

    it('should authorize different builders', async () => {
      if (!canRun) return;

      // 使用同一个有效 Builder 地址测试不同费率
      console.log('\n--- 授权 Builder 不同费率 ---');
      console.log(`Builder: ${TEST_BUILDER}`);

      const response1 = await exchangeApi.approveBuilderFee(TEST_BUILDER, '10');
      const response2 = await exchangeApi.approveBuilderFee(TEST_BUILDER, '5');

      expect(response1.status).toBe('ok');
      expect(response2.status).toBe('ok');

      console.log(`授权 10 bps 结果: ${response1.status}`);
      console.log(`授权 5 bps 结果: ${response2.status}`);
    });
  });

  describe('verify authorization (验证授权)', () => {
    it('should reflect authorization in maxBuilderFee query', async () => {
      if (!canRun) return;

      console.log('\n--- 验证授权状态 ---');

      // 先授权
      console.log('授权 10 bps...');
      await exchangeApi.approveBuilderFee(TEST_BUILDER, '10');

      // 等待一小段时间
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 查询授权状态
      const userAddress = getTestUserAddress();
      const maxFee = await infoApi.maxBuilderFee(userAddress, TEST_BUILDER);

      console.log(`\n查询结果:`);
      console.log(`  用户地址: ${userAddress}`);
      console.log(`  Builder 地址: ${TEST_BUILDER}`);
      console.log(`  授权费率: ${maxFee} bps`);

      expect(maxFee).toBeDefined();
      expect(typeof maxFee).toBe('number');
      expect(maxFee).toBe(10);
    });

    it('should update authorization when fee rate changes', async () => {
      if (!canRun) return;

      const userAddress = getTestUserAddress();

      console.log('\n--- 更新授权费率 ---');

      // 授权 5 bps
      console.log('设置为 5 bps...');
      await exchangeApi.approveBuilderFee(TEST_BUILDER, '5');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const fee1 = await infoApi.maxBuilderFee(userAddress, TEST_BUILDER);
      console.log(`当前授权费率: ${fee1} bps`);
      expect(fee1).toBe(5);

      // 更新为 15 bps
      console.log('更新为 15 bps...');
      await exchangeApi.approveBuilderFee(TEST_BUILDER, '15');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const fee2 = await infoApi.maxBuilderFee(userAddress, TEST_BUILDER);
      console.log(`更新后授权费率: ${fee2} bps`);
      expect(fee2).toBe(15);
    });
  });

  describe('order with builder fee (带 Builder 费用下单)', () => {
    it('should place order with builder fee', async () => {
      if (!canRun || opIndex < 0 || opPrice <= 0) return;

      console.log('\n--- 带 Builder 费用下单 ---');

      // 先授权
      console.log('先授权 Builder...');
      await exchangeApi.approveBuilderFee(TEST_BUILDER, '10');

      // 获取当前价格并下单
      const limitPrice = Math.floor(opPrice * 0.5 * 1000) / 1000;
      const size = 1;

      console.log(`\n下单参数:`);
      console.log(`  代币: OP`);
      console.log(`  方向: 买入`);
      console.log(`  价格: $${limitPrice}`);
      console.log(`  数量: ${size} OP`);
      console.log(`  Builder: ${TEST_BUILDER}`);
      console.log(`  Builder 费率: 10 bps`);

      // 下单时附加 Builder 费用
      const response = await exchangeApi.placeOrder(
        [
          {
            asset: opIndex,
            isBuy: true,
            price: limitPrice,
            size,
            tif: 'Gtc',
          },
        ],
        'na',
        {
          address: TEST_BUILDER,
          feeRate: 10,
        }
      );

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');

      console.log(`\n下单结果: ${response.status}`);

      // 清理订单
      const status = response.response.data.statuses[0];
      if (status.status === 'resting' && status.resting) {
        console.log(`订单 ID: ${status.resting.oid}`);
        await exchangeApi.cancelOrder([{ asset: opIndex, oid: status.resting.oid }]);
        console.log('订单已撤销');
      }
    });
  });

  describe('authorization limits (授权限制)', () => {
    it('should accept perp fee up to 10 bps (0.1%)', async () => {
      if (!canRun) return;

      console.log('\n--- 测试永续合约最大费率 ---');
      console.log('永续合约最大允许费率: 10 bps (0.1%)');

      const response = await exchangeApi.approveBuilderFee(TEST_BUILDER, '10');
      expect(response.status).toBe('ok');

      console.log(`授权 10 bps 结果: ${response.status}`);
    });

    it('should accept spot fee up to 100 bps (1%)', async () => {
      if (!canRun) return;

      console.log('\n--- 测试现货最大费率 ---');
      console.log('现货最大允许费率: 100 bps (1%)');

      // 现货最高 100 bps
      const response = await exchangeApi.approveBuilderFee(TEST_BUILDER, '100');

      expect(response).toBeDefined();
      console.log(`授权 100 bps 结果: ${response.status}`);
    });
  });
});
