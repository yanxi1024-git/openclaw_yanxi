/**
 * Tests for Moltbook cryptographic adapter
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MoltbookCryptoAdapter, isLobsterMathChallenge } from '../src/moltbook-adapter.js';

describe('MoltbookCryptoAdapter', () => {
  let adapter: MoltbookCryptoAdapter;

  beforeEach(() => {
    adapter = new MoltbookCryptoAdapter();
  });

  describe('isLobsterMathChallenge', () => {
    it('should identify lobster math challenges', () => {
      const challenge = {
        verification_code: 'moltbook_verify_123',
        challenge_text: 'A] Lo.bS tErS ClAw F_oRcE Is TwEnTy ThReE NeW|ToNs + TwElVe NeW^ToNs',
        expires_at: '2026-03-11 13:58:07.152391+00',
        instructions: 'Solve the math problem...'
      };

      expect(isLobsterMathChallenge(challenge)).toBe(true);
    });

    it('should reject non-lobster challenges', () => {
      const challenge = {
        verification_code: 'some_other_verify',
        challenge_text: 'Normal text without lobster',
        expires_at: '2026-03-11 13:58:07.152391+00'
      };

      expect(isLobsterMathChallenge(challenge)).toBe(false);
    });
  });

  describe('parseLobsterMath', () => {
    it('should parse simple addition challenge', async () => {
      const challenge = {
        verification_code: 'test_123',
        challenge_text: 'Twenty Three + Twelve',
        expires_at: '2026-03-11 13:58:07.152391+00',
        instructions: 'Solve...'
      };

      // Note: This is a simplified test since the actual parser
      // would need to handle obfuscated text
      const adapter = new MoltbookCryptoAdapter({ replaceLobsterMath: false });
      
      // We can't directly test the private method, but we can test
      // the fallback mechanism which uses it
      const response = await adapter.fallbackToLobsterMath(challenge);
      
      expect(response).toHaveProperty('verification_code', 'test_123');
      expect(response).toHaveProperty('answer');
    });
  });

  describe('configuration', () => {
    it('should use default config', () => {
      const status = adapter.getStatus();
      expect(status.config.replaceLobsterMath).toBe(true);
      expect(status.config.fallbackToMath).toBe(true);
    });

    it('should accept custom config', () => {
      const customAdapter = new MoltbookCryptoAdapter({
        replaceLobsterMath: false,
        fallbackToMath: false,
      });

      const status = customAdapter.getStatus();
      expect(status.config.replaceLobsterMath).toBe(false);
      expect(status.config.fallbackToMath).toBe(false);
    });
  });
});
