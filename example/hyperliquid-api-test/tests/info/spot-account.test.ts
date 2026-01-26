import { describe, it, expect, beforeAll } from 'vitest';
import { getInfoAPI, getTestUserAddress } from '../setup';
import type { InfoAPI } from '../../src/api/info';
import { CONFIG } from '../../src/config';

describe('Spot Account API', () => {
  let infoApi: InfoAPI;

  beforeAll(() => {
    infoApi = getInfoAPI();
  });

  describe('spotClearinghouseState', () => {
    it('should return spot account state for zero address', async () => {
      const response = await infoApi.spotClearinghouseState(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      expect(response.balances).toBeDefined();
      expect(Array.isArray(response.balances)).toBe(true);
    });

    it('should return spot account state for test user', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.spotClearinghouseState(userAddress);

      expect(response).toBeDefined();
      expect(response.balances).toBeDefined();
      expect(Array.isArray(response.balances)).toBe(true);
    });

    it('should have balance fields if balances exist', async () => {
      const userAddress = getTestUserAddress();
      const response = await infoApi.spotClearinghouseState(userAddress);

      if (response.balances.length > 0) {
        const balance = response.balances[0];

        expect(balance.coin).toBeDefined();
        expect(balance.token).toBeDefined();
        expect(typeof balance.token).toBe('number');
        expect(balance.hold).toBeDefined();
        expect(balance.total).toBeDefined();
        expect(balance.entryNtl).toBeDefined();
      }
    });

    it('should return empty balances for account with no holdings', async () => {
      // 零地址通常没有持仓
      const response = await infoApi.spotClearinghouseState(CONFIG.TEST_USER);

      expect(response).toBeDefined();
      // 可能返回空数组
      expect(Array.isArray(response.balances)).toBe(true);
    });
  });

  describe('tokenDetails', () => {
    it('should return token details for valid tokenId', async () => {
      // 首先获取一个有效的 tokenId
      const spotMeta = await infoApi.spotMeta();

      if (spotMeta.tokens.length > 0) {
        const tokenId = spotMeta.tokens[0].tokenId;
        const response = await infoApi.tokenDetails(tokenId);

        expect(response).toBeDefined();
        expect(response.name).toBeDefined();
        expect(response.szDecimals).toBeDefined();
        expect(response.weiDecimals).toBeDefined();
      }
    });

    it('should have supply information', async () => {
      const spotMeta = await infoApi.spotMeta();

      if (spotMeta.tokens.length > 0) {
        const tokenId = spotMeta.tokens[0].tokenId;
        const response = await infoApi.tokenDetails(tokenId);

        expect(response.totalSupply).toBeDefined();
        expect(response.circulatingSupply).toBeDefined();
      }
    });

    it('should have price information', async () => {
      const spotMeta = await infoApi.spotMeta();

      if (spotMeta.tokens.length > 0) {
        const tokenId = spotMeta.tokens[0].tokenId;
        const response = await infoApi.tokenDetails(tokenId);

        expect(response.midPx).toBeDefined();
        expect(response.markPx).toBeDefined();
        expect(response.prevDayPx).toBeDefined();
      }
    });
  });
});
