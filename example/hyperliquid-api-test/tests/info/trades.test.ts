import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI } from '../setup';
import type { InfoAPI } from '../../src/api/info';

describe('Trades API', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('recentTrades', () => {
    it('should return recent trades for BTC', async () => {
      const response = await infoApi.recentTrades('BTC');

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have required fields for each trade', async () => {
      const response = await infoApi.recentTrades('BTC');

      if (response.length > 0) {
        const trade = response[0];

        expect(trade.coin).toBeDefined();
        expect(trade.coin).toBe('BTC');
        expect(trade.side).toBeDefined();
        expect(['B', 'A']).toContain(trade.side);
        expect(trade.px).toBeDefined();
        expect(trade.sz).toBeDefined();
        expect(trade.time).toBeDefined();
        expect(typeof trade.time).toBe('number');
      }
    });

    it('should have valid price and size', async () => {
      const response = await infoApi.recentTrades('BTC');

      if (response.length > 0) {
        const trade = response[0];

        expect(parseFloat(trade.px)).toBeGreaterThan(0);
        expect(parseFloat(trade.sz)).toBeGreaterThan(0);
      }
    });

    it('should have trade hash and tid', async () => {
      const response = await infoApi.recentTrades('BTC');

      if (response.length > 0) {
        const trade = response[0];

        expect(trade.hash).toBeDefined();
        expect(trade.tid).toBeDefined();
        expect(typeof trade.tid).toBe('number');
      }
    });

    it('should return recent trades for ETH', async () => {
      const response = await infoApi.recentTrades('ETH');

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      if (response.length > 0) {
        expect(response[0].coin).toBe('ETH');
      }
    });
  });

  describe('allMids', () => {
    it('should return all mid prices', async () => {
      const response = await infoApi.allMids();

      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
    });

    it('should have BTC mid price', async () => {
      const response = await infoApi.allMids();

      expect(response['BTC']).toBeDefined();
      expect(parseFloat(response['BTC'])).toBeGreaterThan(0);
    });

    it('should have ETH mid price', async () => {
      const response = await infoApi.allMids();

      expect(response['ETH']).toBeDefined();
      expect(parseFloat(response['ETH'])).toBeGreaterThan(0);
    });

    it('should have multiple assets', async () => {
      const response = await infoApi.allMids();
      const keys = Object.keys(response);

      expect(keys.length).toBeGreaterThan(1);
    });

    it('should have valid price values', async () => {
      const response = await infoApi.allMids();

      for (const [coin, price] of Object.entries(response)) {
        expect(typeof price).toBe('string');
        const numPrice = parseFloat(price);
        expect(numPrice).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
