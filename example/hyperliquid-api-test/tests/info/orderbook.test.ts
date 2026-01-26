import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI } from '../setup';
import type { InfoAPI } from '../../src/api/info';

describe('Orderbook API (l2Book)', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('perpetual orderbook', () => {
    it('should return BTC perpetual orderbook', async () => {
      const response = await infoApi.l2Book('BTC');

      expect(response).toBeDefined();
      expect(response.coin).toBe('BTC');
      expect(response.time).toBeDefined();
      expect(typeof response.time).toBe('number');
      expect(response.levels).toBeDefined();
      expect(Array.isArray(response.levels)).toBe(true);
      expect(response.levels.length).toBe(2);
    });

    it('should have bids and asks arrays', async () => {
      const response = await infoApi.l2Book('BTC');
      const [bids, asks] = response.levels;

      expect(Array.isArray(bids)).toBe(true);
      expect(Array.isArray(asks)).toBe(true);
    });

    it('should have price, size and count for each level', async () => {
      const response = await infoApi.l2Book('BTC');
      const [bids, asks] = response.levels;

      if (bids.length > 0) {
        const bid = bids[0];
        expect(bid.px).toBeDefined();
        expect(bid.sz).toBeDefined();
        expect(bid.n).toBeDefined();
        expect(typeof bid.n).toBe('number');
      }

      if (asks.length > 0) {
        const ask = asks[0];
        expect(ask.px).toBeDefined();
        expect(ask.sz).toBeDefined();
        expect(ask.n).toBeDefined();
      }
    });

    it('should have bids in descending price order', async () => {
      const response = await infoApi.l2Book('BTC');
      const [bids] = response.levels;

      if (bids.length >= 2) {
        for (let i = 0; i < bids.length - 1; i++) {
          const currentPrice = parseFloat(bids[i].px);
          const nextPrice = parseFloat(bids[i + 1].px);
          expect(currentPrice).toBeGreaterThanOrEqual(nextPrice);
        }
      }
    });

    it('should have asks in ascending price order', async () => {
      const response = await infoApi.l2Book('BTC');
      const [, asks] = response.levels;

      if (asks.length >= 2) {
        for (let i = 0; i < asks.length - 1; i++) {
          const currentPrice = parseFloat(asks[i].px);
          const nextPrice = parseFloat(asks[i + 1].px);
          expect(currentPrice).toBeLessThanOrEqual(nextPrice);
        }
      }
    });

    it('should return ETH perpetual orderbook', async () => {
      const response = await infoApi.l2Book('ETH');

      expect(response).toBeDefined();
      expect(response.coin).toBe('ETH');
    });
  });

  describe('orderbook with aggregation', () => {
    it('should return orderbook with nSigFigs aggregation', async () => {
      const response = await infoApi.l2Book('BTC', 5);

      expect(response).toBeDefined();
      expect(response.coin).toBe('BTC');
      expect(response.levels).toBeDefined();
    });

    it('should return orderbook with nSigFigs=2 for coarse aggregation', async () => {
      const response = await infoApi.l2Book('BTC', 2);

      expect(response).toBeDefined();
      expect(response.levels).toBeDefined();
    });
  });

  describe('spot orderbook', () => {
    it('should return spot orderbook if markets exist', async () => {
      // 首先获取现货市场列表
      const spotMeta = await infoApi.spotMeta();

      if (spotMeta.universe.length > 0) {
        const marketName = spotMeta.universe[0].name;
        const response = await infoApi.l2Book(marketName);

        expect(response).toBeDefined();
        expect(response.coin).toBe(marketName);
        expect(response.levels).toBeDefined();
        expect(response.levels.length).toBe(2);
      }
    });
  });
});
