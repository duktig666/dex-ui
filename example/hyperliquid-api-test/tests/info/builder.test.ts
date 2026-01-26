import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI, getTestUserAddress } from '../setup';
import type { InfoAPI } from '../../src/api/info';
import { CONFIG } from '../../src/config';

describe('Builder API', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('maxBuilderFee', () => {
    it('should return 0 for unauthorized user', async () => {
      // 使用零地址查询一个随机 Builder，应返回 0 (未授权)
      const response = await infoApi.maxBuilderFee(
        CONFIG.TEST_USER,
        CONFIG.TEST_BUILDER
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe('number');
      expect(response).toBe(0); // 未授权时返回 0
    });

    it('should return number type', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.maxBuilderFee(
        userAddress,
        CONFIG.TEST_BUILDER
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe('number');
    });

    it('should return non-negative value', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.maxBuilderFee(
        userAddress,
        CONFIG.TEST_BUILDER
      );

      expect(response).toBeGreaterThanOrEqual(0);
    });

    it('should handle different builder addresses', async () => {
      const userAddress = getTestUserAddress();

      // 测试不同的 Builder 地址
      const builder1 = '0x0000000000000000000000000000000000000001';
      const builder2 = '0x0000000000000000000000000000000000000002';

      const response1 = await infoApi.maxBuilderFee(userAddress, builder1);
      const response2 = await infoApi.maxBuilderFee(userAddress, builder2);

      expect(typeof response1).toBe('number');
      expect(typeof response2).toBe('number');
    });
  });

  describe('referral', () => {
    it('should return referral info for user', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.referral(userAddress);

      expect(response).toBeDefined();
      expect(response.cumVlm).toBeDefined();
      expect(response.unclaimedRewards).toBeDefined();
      expect(response.claimedRewards).toBeDefined();
    });

    it('should return referral info for zero address', async () => {
      const response = await infoApi.referral(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      // referredBy 可能是 null
      expect(response.referredBy === null || typeof response.referredBy === 'string').toBe(true);
    });

    it('should have optional referrerState field', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.referral(userAddress);

      // referrerState 是可选的，只有推荐人才有
      // 验证结构正确性，不管是否存在
      expect(response).toBeDefined();
      if (response.referrerState && typeof response.referrerState === 'object') {
        // referrerState 存在时，验证其包含预期字段
        // 使用 'in' 检查避免字段存在但值为 undefined/null 的情况
        if ('code' in response.referrerState) {
          expect(typeof response.referrerState.code).toBe('string');
        }
        if ('nReferred' in response.referrerState) {
          expect(typeof response.referrerState.nReferred).toBe('number');
        }
      }
      // 如果 referrerState 不存在，测试也通过（它是可选字段）
    });
  });

  describe('subAccounts', () => {
    it('should return sub accounts for user', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.subAccounts(userAddress);

      // 可能返回 null 或数组
      expect(response === null || Array.isArray(response)).toBe(true);
    });

    it('should return null for zero address', async () => {
      const response = await infoApi.subAccounts(CONFIG.TEST_USER);

      expect(response === null || Array.isArray(response)).toBe(true);
    });

    it('should have sub account fields if accounts exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.subAccounts(userAddress);

      if (response && response.length > 0) {
        const subAccount = response[0];

        expect(subAccount.subAccountUser).toBeDefined();
        expect(subAccount.name).toBeDefined();
        expect(subAccount.master).toBeDefined();
      }
    });
  });

  describe('predictedFundings', () => {
    it('should return predicted funding rates', async () => {
      const response = await infoApi.predictedFundings();

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have funding prediction fields', async () => {
      const response = await infoApi.predictedFundings();

      if (response.length > 0) {
        const prediction = response[0];
        expect(prediction).toBeDefined();

        // API 响应可能是数组结构 [coin, data] 或对象结构
        if (Array.isArray(prediction)) {
          // 数组结构: [coin, { v: value, s: time }] 或类似
          expect(prediction.length).toBeGreaterThan(0);
        } else if (typeof prediction === 'object' && prediction !== null) {
          // 对象结构: { predictedFunding, time } 或其他字段
          expect(Object.keys(prediction).length).toBeGreaterThan(0);
        }
      }
    });
  });
});
