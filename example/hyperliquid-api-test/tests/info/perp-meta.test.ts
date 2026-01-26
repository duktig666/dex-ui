import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI } from '../setup';
import type { InfoAPI } from '../../src/api/info';

describe('Perpetual Metadata API', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('meta', () => {
    it('should return perpetual contract metadata', async () => {
      const response = await infoApi.meta();

      expect(response).toBeDefined();
      expect(response.universe).toBeDefined();
      expect(Array.isArray(response.universe)).toBe(true);
      expect(response.universe.length).toBeGreaterThan(0);
    });

    it('should include BTC in universe', async () => {
      const response = await infoApi.meta();
      const btc = response.universe.find((a) => a.name === 'BTC');

      expect(btc).toBeDefined();
      expect(btc?.name).toBe('BTC');
    });

    it('should have required fields for each asset', async () => {
      const response = await infoApi.meta();
      const asset = response.universe[0];

      expect(asset.name).toBeDefined();
      expect(typeof asset.name).toBe('string');
      expect(asset.szDecimals).toBeDefined();
      expect(typeof asset.szDecimals).toBe('number');
      expect(asset.maxLeverage).toBeDefined();
      expect(typeof asset.maxLeverage).toBe('number');
    });

    it('should include ETH in universe', async () => {
      const response = await infoApi.meta();
      const eth = response.universe.find((a) => a.name === 'ETH');

      expect(eth).toBeDefined();
      expect(eth?.name).toBe('ETH');
    });
  });

  describe('metaAndAssetCtxs', () => {
    it('should return metadata with real-time context', async () => {
      const response = await infoApi.metaAndAssetCtxs();

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(2);
    });

    it('should have matching lengths for meta and context arrays', async () => {
      const [meta, assetCtxs] = await infoApi.metaAndAssetCtxs();

      expect(meta.universe.length).toBe(assetCtxs.length);
    });

    it('should have real-time price data in context', async () => {
      const [, assetCtxs] = await infoApi.metaAndAssetCtxs();
      const btcCtx = assetCtxs[0];

      expect(btcCtx).toBeDefined();
      expect(btcCtx.midPx).toBeDefined();
      expect(parseFloat(btcCtx.midPx)).toBeGreaterThan(0);
    });

    it('should have funding rate in context', async () => {
      const [, assetCtxs] = await infoApi.metaAndAssetCtxs();
      const btcCtx = assetCtxs[0];

      expect(btcCtx.funding).toBeDefined();
      expect(typeof btcCtx.funding).toBe('string');
    });

    it('should have open interest in context', async () => {
      const [, assetCtxs] = await infoApi.metaAndAssetCtxs();
      const btcCtx = assetCtxs[0];

      expect(btcCtx.openInterest).toBeDefined();
    });

    it('should have 24h volume in context', async () => {
      const [, assetCtxs] = await infoApi.metaAndAssetCtxs();
      const btcCtx = assetCtxs[0];

      expect(btcCtx.dayNtlVlm).toBeDefined();
    });

    it('should have oracle and mark price', async () => {
      const [, assetCtxs] = await infoApi.metaAndAssetCtxs();
      const btcCtx = assetCtxs[0];

      expect(btcCtx.oraclePx).toBeDefined();
      expect(btcCtx.markPx).toBeDefined();
      expect(parseFloat(btcCtx.oraclePx)).toBeGreaterThan(0);
      expect(parseFloat(btcCtx.markPx)).toBeGreaterThan(0);
    });
  });
});
