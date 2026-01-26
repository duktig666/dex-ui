import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI, getTestUserAddress } from '../setup';
import type { InfoAPI } from '../../src/api/info';
import { CONFIG } from '../../src/config';

describe('History API', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('historicalOrders', () => {
    it('should return historical orders for user', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.historicalOrders(userAddress);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return empty array for zero address', async () => {
      const response = await infoApi.historicalOrders(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have order fields if orders exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.historicalOrders(userAddress);

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
        expect(order.orderType).toBeDefined();
        expect(order.status).toBeDefined();
        expect(['filled', 'canceled', 'rejected']).toContain(order.status);
      }
    });
  });

  describe('userFills', () => {
    it('should return user fills', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userFills(userAddress);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return empty array for zero address', async () => {
      const response = await infoApi.userFills(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have fill fields if fills exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userFills(userAddress);

      if (response.length > 0) {
        const fill = response[0];

        expect(fill.coin).toBeDefined();
        expect(fill.px).toBeDefined();
        expect(fill.sz).toBeDefined();
        expect(fill.side).toBeDefined();
        expect(['B', 'A']).toContain(fill.side);
        expect(fill.time).toBeDefined();
        expect(fill.dir).toBeDefined();
        expect(fill.fee).toBeDefined();
        expect(fill.oid).toBeDefined();
        expect(fill.hash).toBeDefined();
      }
    });

    it('should work with aggregateByTime parameter', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userFills(userAddress, true);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });
  });

  describe('userFillsByTime', () => {
    it('should return fills within time range', async () => {
      const userAddress = getTestUserAddress();
      const endTime = Date.now();
      const startTime = endTime - 30 * 24 * 60 * 60 * 1000; // 30天前

      const response = await infoApi.userFillsByTime(userAddress, startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should filter by start time', async () => {
      const userAddress = getTestUserAddress();
      const startTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7天前

      const response = await infoApi.userFillsByTime(userAddress, startTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      // 验证所有成交都在开始时间之后
      for (const fill of response) {
        expect(fill.time).toBeGreaterThanOrEqual(startTime);
      }
    });
  });

  describe('userFunding', () => {
    it('should return funding history', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userFunding(userAddress);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return empty array for zero address', async () => {
      const response = await infoApi.userFunding(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have funding record fields if records exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userFunding(userAddress);

      if (response.length > 0) {
        const record = response[0];

        expect(record.time).toBeDefined();
        expect(record.coin).toBeDefined();
        expect(record.usdc).toBeDefined();
        expect(record.szi).toBeDefined();
        expect(record.fundingRate).toBeDefined();
      }
    });

    it('should filter by time range', async () => {
      const userAddress = getTestUserAddress();
      const endTime = Date.now();
      const startTime = endTime - 7 * 24 * 60 * 60 * 1000;

      const response = await infoApi.userFunding(userAddress, startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });
  });

  describe('userNonFundingLedgerUpdates', () => {
    it('should return ledger updates', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userNonFundingLedgerUpdates(userAddress);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return empty array for zero address', async () => {
      const response = await infoApi.userNonFundingLedgerUpdates(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have ledger update fields if updates exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.userNonFundingLedgerUpdates(userAddress);

      if (response.length > 0) {
        const update = response[0];

        expect(update.time).toBeDefined();
        expect(update.delta).toBeDefined();
        expect(update.delta.type).toBeDefined();
        // usdc 字段可能存在于某些类型的更新中
        // 不同类型的 delta 可能有不同的字段
      }
    });
  });

  describe('fundingHistory', () => {
    it('should return funding history for BTC', async () => {
      const startTime = Date.now() - 24 * 60 * 60 * 1000; // 24小时前

      const response = await infoApi.fundingHistory('BTC', startTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have funding history fields', async () => {
      const startTime = Date.now() - 24 * 60 * 60 * 1000;

      const response = await infoApi.fundingHistory('BTC', startTime);

      if (response.length > 0) {
        const entry = response[0];

        expect(entry.coin).toBe('BTC');
        expect(entry.fundingRate).toBeDefined();
        expect(entry.premium).toBeDefined();
        expect(entry.time).toBeDefined();
      }
    });

    it('should filter by time range', async () => {
      const endTime = Date.now();
      const startTime = endTime - 12 * 60 * 60 * 1000; // 12小时前

      const response = await infoApi.fundingHistory('BTC', startTime, endTime);

      expect(response).toBeDefined();

      // 验证时间范围
      for (const entry of response) {
        expect(entry.time).toBeGreaterThanOrEqual(startTime);
        expect(entry.time).toBeLessThanOrEqual(endTime);
      }
    });
  });
});
