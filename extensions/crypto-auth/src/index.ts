/**
 * Cryptographic authentication extension for OpenClaw
 * 
 * This extension provides cryptographic authentication capabilities
 * to replace traditional CAPTCHA systems like Moltbook's "lobster math".
 */

export { KeyManager } from './key-management.js';
export type {
  KeyPair,
  Signature,
  CryptographicChallenge,
  ChallengeResponse,
  AgentIdentity,
  AuthConfig,
  MoltbookCryptoConfig,
  PlatformCryptoConfig,
} from './types.js';

/**
 * Main cryptographic authentication service
 */
export class CryptoAuthService {
  private keyManager: KeyManager;

  constructor() {
    this.keyManager = new KeyManager();
  }

  /**
   * Initialize the cryptographic authentication system
   */
  async initialize(): Promise<void> {
    console.log('Cryptographic authentication system initialized');
  }

  /**
   * Create a cryptographic challenge (replaces "lobster math")
   */
  async createChallenge(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<CryptographicChallenge> {
    const challengeId = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const nonce = this.generateNonce();
    
    return {
      challengeId,
      nonce,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 300000), // 5 minutes
      difficulty,
    };
  }

  /**
   * Verify a challenge response
   */
  async verifyChallenge(
    challenge: CryptographicChallenge,
    response: ChallengeResponse
  ): Promise<boolean> {
    // Check if challenge is expired
    if (new Date() > challenge.expiresAt) {
      return false;
    }

    // Check if challenge ID matches
    if (challenge.challengeId !== response.challengeId) {
      return false;
    }

    // TODO: Implement actual signature verification
    // For now, return true for demonstration
    return true;
  }

  /**
   * Generate a nonce for challenges
   */
  private generateNonce(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      initialized: true,
      algorithm: 'ed25519',
      keyStorage: 'memory',
      challengesCreated: 0,
      challengesVerified: 0,
    };
  }
}

// Default export
export default CryptoAuthService;
