import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI, getTestUserAddress } from '../setup';
import type { InfoAPI } from '../../src/api/info';
import { CONFIG } from '../../src/config';

describe('Perpetual Account API', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('clearinghouseState', () => {
    it('should return account state for zero address', async () => {
      const response = await infoApi.clearinghouseState(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      expect(response.marginSummary).toBeDefined();
      expect(response.withdrawable).toBeDefined();
      expect(response.assetPositions).toBeDefined();
      expect(Array.isArray(response.assetPositions)).toBe(true);
    });

    it('should have margin summary fields', async () => {
      const response = await infoApi.clearinghouseState(CONFIG.TEST_USER);
      const { marginSummary } = response;

      expect(marginSummary.accountValue).toBeDefined();
      expect(marginSummary.totalNtlPos).toBeDefined();
      expect(marginSummary.totalRawUsd).toBeDefined();
      expect(marginSummary.totalMarginUsed).toBeDefined();
    });

    it('should return account state for test user', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.clearinghouseState(userAddress);

      expect(response).toBeDefined();
      expect(response.marginSummary).toBeDefined();
      expect(response.time).toBeDefined();
      expect(typeof response.time).toBe('number');
    });

    it('should have cross margin summary', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.clearinghouseState(userAddress);

      expect(response.crossMarginSummary).toBeDefined();
    });

    it('should have position details if positions exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.clearinghouseState(userAddress);

      if (response.assetPositions.length > 0) {
        const position = response.assetPositions[0];

        expect(position.type).toBe('oneWay');
        expect(position.position).toBeDefined();
        expect(position.position.coin).toBeDefined();
        expect(position.position.szi).toBeDefined();
        expect(position.position.entryPx).toBeDefined();
        expect(position.position.leverage).toBeDefined();
      }
    });
  });

  describe('openOrders', () => {
    it('should return open orders for user', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.openOrders(userAddress);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return empty array for zero address', async () => {
      const response = await infoApi.openOrders(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have order fields if orders exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.openOrders(userAddress);

      if (response.length > 0) {
        const order = response[0];

        expect(order.coin).toBeDefined();
        expect(order.oid).toBeDefined();
        expect(order.side).toBeDefined();
        expect(['B', 'A']).toContain(order.side);
        expect(order.limitPx).toBeDefined();
        expect(order.sz).toBeDefined();
        expect(order.origSz).toBeDefined();
        expect(order.timestamp).toBeDefined();
      }
    });
  });

  describe('frontendOpenOrders', () => {
    it('should return frontend open orders', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.frontendOpenOrders(userAddress);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have extended order fields if orders exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.frontendOpenOrders(userAddress);

      if (response.length > 0) {
        const order = response[0];

        // 基础字段
        expect(order.coin).toBeDefined();
        expect(order.oid).toBeDefined();

        // 扩展字段
        expect(order.orderType).toBeDefined();
        expect(order.tif).toBeDefined();
        expect(typeof order.reduceOnly).toBe('boolean');
      }
    });
  });

  describe('userRateLimit', () => {
    it('should return rate limit info for user', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userRateLimit(userAddress);

      expect(response).toBeDefined();
      expect(response.cumVlm).toBeDefined();
      expect(response.nRequestsUsed).toBeDefined();
      expect(response.nRequestsCap).toBeDefined();
      expect(response.nRequestsSurplus).toBeDefined();
    });

    it('should have valid numeric values', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userRateLimit(userAddress);

      expect(typeof response.nRequestsUsed).toBe('number');
      expect(typeof response.nRequestsCap).toBe('number');
      expect(typeof response.nRequestsSurplus).toBe('number');
      expect(response.nRequestsCap).toBeGreaterThan(0);
    });
  });
});
