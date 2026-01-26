import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI } from '../setup';
import type { InfoAPI } from '../../src/api/info';

describe('Candle API (candleSnapshot)', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('hourly candles', () => {
    it('should return 1h candles for BTC', async () => {
      const endTime = Date.now();
      const startTime = endTime - 24 * 60 * 60 * 1000; // 24小时前

      const response = await infoApi.candleSnapshot('BTC', '1h', startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should have required OHLCV fields', async () => {
      const endTime = Date.now();
      const startTime = endTime - 24 * 60 * 60 * 1000;

      const response = await infoApi.candleSnapshot('BTC', '1h', startTime, endTime);

      if (response.length > 0) {
        const candle = response[0];

        expect(candle.t).toBeDefined(); // 开盘时间
        expect(candle.T).toBeDefined(); // 收盘时间
        expect(candle.o).toBeDefined(); // 开盘价
        expect(candle.h).toBeDefined(); // 最高价
        expect(candle.l).toBeDefined(); // 最低价
        expect(candle.c).toBeDefined(); // 收盘价
        expect(candle.v).toBeDefined(); // 成交量
      }
    });

    it('should have valid price values', async () => {
      const endTime = Date.now();
      const startTime = endTime - 24 * 60 * 60 * 1000;

      const response = await infoApi.candleSnapshot('BTC', '1h', startTime, endTime);

      if (response.length > 0) {
        const candle = response[0];

        const open = parseFloat(candle.o);
        const high = parseFloat(candle.h);
        const low = parseFloat(candle.l);
        const close = parseFloat(candle.c);

        expect(open).toBeGreaterThan(0);
        expect(high).toBeGreaterThanOrEqual(low);
        expect(high).toBeGreaterThanOrEqual(open);
        expect(high).toBeGreaterThanOrEqual(close);
        expect(low).toBeLessThanOrEqual(open);
        expect(low).toBeLessThanOrEqual(close);
      }
    });
  });

  describe('different intervals', () => {
    it('should return 1m candles', async () => {
      const endTime = Date.now();
      const startTime = endTime - 60 * 60 * 1000; // 1小时前

      const response = await infoApi.candleSnapshot('BTC', '1m', startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return 15m candles', async () => {
      const endTime = Date.now();
      const startTime = endTime - 24 * 60 * 60 * 1000;

      const response = await infoApi.candleSnapshot('BTC', '15m', startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return 4h candles', async () => {
      const endTime = Date.now();
      const startTime = endTime - 7 * 24 * 60 * 60 * 1000; // 7天前

      const response = await infoApi.candleSnapshot('BTC', '4h', startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return 1d candles', async () => {
      const endTime = Date.now();
      const startTime = endTime - 30 * 24 * 60 * 60 * 1000; // 30天前

      const response = await infoApi.candleSnapshot('BTC', '1d', startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    });
  });

  describe('ETH candles', () => {
    it('should return candles for ETH', async () => {
      const endTime = Date.now();
      const startTime = endTime - 24 * 60 * 60 * 1000;

      const response = await infoApi.candleSnapshot('ETH', '1h', startTime, endTime);

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);

      if (response.length > 0) {
        expect(response[0].s).toBe('ETH');
      }
    });
  });

  describe('candle ordering', () => {
    it('should return candles in chronological order', async () => {
      const endTime = Date.now();
      const startTime = endTime - 24 * 60 * 60 * 1000;

      const response = await infoApi.candleSnapshot('BTC', '1h', startTime, endTime);

      if (response.length >= 2) {
        for (let i = 0; i < response.length - 1; i++) {
          expect(response[i].t).toBeLessThan(response[i + 1].t);
        }
      }
    });
  });
});
