import { describe, it, expect, beforeAll } from 'vitest';
import { encode } from '@msgpack/msgpack';
import { keccak256 } from 'viem';
import {
  parseSignature,
  computeActionHash,
  buildApproveBuilderFeeMessage,
  buildUsdSendMessage,
  buildWithdraw3Message,
} from '../../src/utils/signer';
import type { OrderAction, UpdateLeverageAction } from '../../src/types/exchange';

describe('Signature Utilities', () => {
  describe('parseSignature', () => {
    it('should parse valid signature string', () => {
      // 65 字节签名 = 130 个十六进制字符
      const validSig =
        '0xf5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e71c';

      const result = parseSignature(validSig);

      expect(result.r).toBe('0xf5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d');
      expect(result.s).toBe('0x367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e7');
      expect(result.v).toBe(28); // 0x1c = 28
    });

    it('should parse signature without 0x prefix', () => {
      const sigWithoutPrefix =
        'f5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e71c';

      const result = parseSignature(sigWithoutPrefix);

      expect(result.r.startsWith('0x')).toBe(true);
      expect(result.s.startsWith('0x')).toBe(true);
      expect(result.v).toBe(28);
    });

    it('should throw error for invalid signature length', () => {
      const invalidSig = '0x1234';

      expect(() => parseSignature(invalidSig)).toThrow('Invalid signature length');
    });

    it('should extract v = 27 (0x1b)', () => {
      const sig =
        '0xf5b8db073089fe8c4c283d27c4cedcfd295f38d6e30254c68cedcd68d8d88d2d367c5089243243428f99f60e36ef467bcee7133ce006651faaa863dc576651e71b';

      const result = parseSignature(sig);

      expect(result.v).toBe(27); // 0x1b = 27
    });
  });

  describe('computeActionHash', () => {
    it('should hash order action correctly', () => {
      const action: OrderAction = {
        type: 'order',
        orders: [
          {
            a: 0,
            b: true,
            p: '50000',
            s: '0.001',
            r: false,
            t: { limit: { tif: 'Gtc' } },
          },
        ],
        grouping: 'na',
      };

      const nonce = 1234567890;
      const hash = computeActionHash(action, nonce);

      expect(hash).toBeDefined();
      expect(hash.startsWith('0x')).toBe(true);
      expect(hash.length).toBe(66); // 0x + 64 hex chars
    });

    it('should produce different hashes for different actions', () => {
      const action1: UpdateLeverageAction = {
        type: 'updateLeverage',
        asset: 0,
        isCross: true,
        leverage: 10,
      };

      const action2: UpdateLeverageAction = {
        type: 'updateLeverage',
        asset: 0,
        isCross: true,
        leverage: 20,
      };

      const nonce = 1234567890;
      const hash1 = computeActionHash(action1, nonce);
      const hash2 = computeActionHash(action2, nonce);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce consistent hash for same action', () => {
      const action: UpdateLeverageAction = {
        type: 'updateLeverage',
        asset: 0,
        isCross: true,
        leverage: 10,
      };

      const nonce = 1234567890;
      const hash1 = computeActionHash(action, nonce);
      const hash2 = computeActionHash(action, nonce);

      expect(hash1).toBe(hash2);
    });
  });

  describe('msgpack encoding', () => {
    it('should encode action to msgpack format', () => {
      const action = {
        type: 'updateLeverage',
        asset: 0,
        leverage: 10,
        isCross: true,
      };

      const encoded = encode(action);

      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should produce consistent encoding', () => {
      const action = {
        type: 'updateLeverage',
        asset: 0,
        leverage: 10,
        isCross: true,
      };

      const encoded1 = encode(action);
      const encoded2 = encode(action);

      expect(Buffer.from(encoded1).equals(Buffer.from(encoded2))).toBe(true);
    });
  });

  describe('keccak256 hashing', () => {
    it('should hash msgpack encoded data', () => {
      const action = { type: 'test', value: 123 };
      const encoded = encode(action);
      const hash = keccak256(encoded);

      expect(hash).toBeDefined();
      expect(hash.startsWith('0x')).toBe(true);
      expect(hash.length).toBe(66);
    });
  });

  describe('buildApproveBuilderFeeMessage', () => {
    it('should build correct message structure', () => {
      const builder = '0x1234567890123456789012345678901234567890';
      const maxFeeRate = '10';
      const nonce = 1705123456789;

      const message = buildApproveBuilderFeeMessage(builder, maxFeeRate, nonce);

      expect(message.hyperliquidChain).toBe('Testnet');
      expect(message.maxFeeRate).toBe('10');
      expect(message.builder).toBe(builder.toLowerCase());
      expect(message.nonce).toBe(BigInt(nonce));
    });

    it('should lowercase builder address', () => {
      const builder = '0xABCDEF1234567890123456789012345678901234';
      const message = buildApproveBuilderFeeMessage(builder, '10', 123);

      expect(message.builder).toBe(builder.toLowerCase());
    });
  });

  describe('buildUsdSendMessage', () => {
    it('should build correct message structure', () => {
      const destination = '0x1234567890123456789012345678901234567890';
      const amount = '100';
      const time = 1705123456789;

      const message = buildUsdSendMessage(destination, amount, time);

      expect(message.hyperliquidChain).toBe('Testnet');
      expect(message.destination).toBe(destination.toLowerCase());
      expect(message.amount).toBe('100');
      expect(message.time).toBe(BigInt(time));
    });
  });

  describe('buildWithdraw3Message', () => {
    it('should build correct message structure', () => {
      const destination = '0x1234567890123456789012345678901234567890';
      const amount = '50';
      const time = 1705123456789;

      const message = buildWithdraw3Message(destination, amount, time);

      expect(message.hyperliquidChain).toBe('Testnet');
      expect(message.destination).toBe(destination.toLowerCase());
      expect(message.amount).toBe('50');
      expect(message.time).toBe(BigInt(time));
    });
  });
});
