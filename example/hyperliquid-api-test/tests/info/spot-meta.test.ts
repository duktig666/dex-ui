import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI } from '../setup';
import type { InfoAPI } from '../../src/api/info';

describe('Spot Metadata API', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('spotMeta', () => {
    it('should return spot token and market metadata', async () => {
      const response = await infoApi.spotMeta();

      expect(response).toBeDefined();
      expect(response.tokens).toBeDefined();
      expect(response.universe).toBeDefined();
      expect(Array.isArray(response.tokens)).toBe(true);
      expect(Array.isArray(response.universe)).toBe(true);
    });

    it('should have USDC in tokens list', async () => {
      const response = await infoApi.spotMeta();
      const usdc = response.tokens.find((t) => t.name === 'USDC');

      expect(usdc).toBeDefined();
      expect(usdc?.szDecimals).toBeDefined();
      expect(usdc?.weiDecimals).toBeDefined();
    });

    it('should have required fields for each token', async () => {
      const response = await infoApi.spotMeta();
      const token = response.tokens[0];

      expect(token.name).toBeDefined();
      expect(typeof token.name).toBe('string');
      expect(token.szDecimals).toBeDefined();
      expect(typeof token.szDecimals).toBe('number');
      expect(token.weiDecimals).toBeDefined();
      expect(typeof token.weiDecimals).toBe('number');
      expect(token.index).toBeDefined();
      expect(typeof token.index).toBe('number');
      expect(token.tokenId).toBeDefined();
    });

    it('should have required fields for each market', async () => {
      const response = await infoApi.spotMeta();

      if (response.universe.length > 0) {
        const market = response.universe[0];

        expect(market.name).toBeDefined();
        expect(typeof market.name).toBe('string');
        expect(market.name).toContain('/'); // 格式: BASE/QUOTE
        expect(market.tokens).toBeDefined();
        expect(Array.isArray(market.tokens)).toBe(true);
        expect(market.tokens.length).toBe(2);
        expect(market.index).toBeDefined();
      }
    });
  });

  describe('spotMetaAndAssetCtxs', () => {
    it('should return spot metadata with real-time context', async () => {
      const response = await infoApi.spotMetaAndAssetCtxs();

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBe(2);
    });

    it('should return arrays for meta and context', async () => {
      const [spotMeta, spotAssetCtxs] = await infoApi.spotMetaAndAssetCtxs();

      // 验证返回结构正确
      expect(spotMeta.universe).toBeDefined();
      expect(Array.isArray(spotMeta.universe)).toBe(true);
      expect(Array.isArray(spotAssetCtxs)).toBe(true);
      // 注意：universe 和 assetCtxs 长度可能不完全匹配
    });

    it('should have price data in context if markets exist', async () => {
      const [spotMeta, spotAssetCtxs] = await infoApi.spotMetaAndAssetCtxs();

      if (spotMeta.universe.length > 0 && spotAssetCtxs.length > 0) {
        const ctx = spotAssetCtxs[0];

        expect(ctx.midPx).toBeDefined();
        expect(ctx.markPx).toBeDefined();
      }
    });

    it('should have 24h volume in context', async () => {
      const [spotMeta, spotAssetCtxs] = await infoApi.spotMetaAndAssetCtxs();

      if (spotMeta.universe.length > 0 && spotAssetCtxs.length > 0) {
        const ctx = spotAssetCtxs[0];
        expect(ctx.dayNtlVlm).toBeDefined();
      }
    });

    it('should have circulating supply in context', async () => {
      const [spotMeta, spotAssetCtxs] = await infoApi.spotMetaAndAssetCtxs();

      if (spotMeta.universe.length > 0 && spotAssetCtxs.length > 0) {
        const ctx = spotAssetCtxs[0];
        expect(ctx.circulatingSupply).toBeDefined();
      }
    });
  });
});
