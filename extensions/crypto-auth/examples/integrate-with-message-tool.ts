/**
 * Example: Integrating cryptographic authentication with OpenClaw message tool
 * 
 * This example shows how to extend the message tool to support
 * cryptographic authentication for platforms like Moltbook.
 */

// Note: In real implementation, import from actual OpenClaw types
// import type { ChannelMessageActionName } from '../../../src/channels/plugins/types.js';

type ChannelMessageActionName = string;

import { MoltbookCryptoAdapter } from '../src/moltbook-adapter.js';

/**
 * Extended message tool parameters for cryptographic authentication
 */
interface CryptoMessageParams {
  // Standard message parameters
  action: ChannelMessageActionName;
  channel?: string;
  target?: string;
  message: string;
  
  // Cryptographic authentication parameters
  useCryptoAuth?: boolean;
  keyPairId?: string;
  cryptoConfig?: {
    replaceLobsterMath: boolean;
    fallbackToMath: boolean;
  };
}

/**
 * Enhanced message tool that supports cryptographic authentication
 */
export class CryptoEnhancedMessageTool {
  private moltbookAdapter: MoltbookCryptoAdapter;

  constructor() {
    this.moltbookAdapter = new MoltbookCryptoAdapter({
      replaceLobsterMath: true,
      fallbackToMath: true,
      enableReputation: true,
    });
  }

  /**
   * Enhanced send method with cryptographic authentication support
   */
  async sendWithCryptoAuth(params: CryptoMessageParams): Promise<any> {
    const { channel, useCryptoAuth = false, keyPairId, cryptoConfig } = params;

    // Check if this is a Moltbook message with crypto auth enabled
    const isMoltbookWithCrypto = channel === 'moltbook' && useCryptoAuth;

    if (!isMoltbookWithCrypto) {
      // Use standard message sending
      return this.sendStandardMessage(params);
    }

    // For Moltbook with crypto auth, we need to handle verification differently
    console.log('Using cryptographic authentication for Moltbook message');
    
    // In a real implementation, this would:
    // 1. Intercept the verification challenge
    // 2. Convert it to cryptographic challenge
    // 3. Sign with the agent's key pair
    // 4. Submit the cryptographic proof
    
    // For now, return a mock response
    return {
      success: true,
      message: 'Message sent with cryptographic authentication',
      cryptoAuth: {
        used: true,
        keyPairId,
        challengeType: 'cryptographic',
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Standard message sending (fallback)
   */
  private async sendStandardMessage(params: CryptoMessageParams): Promise<any> {
    // This would call the original message tool
    console.log('Using standard message sending');
    return {
      success: true,
      message: 'Message sent with standard authentication',
    };
  }

  /**
   * Handle Moltbook verification challenge
   */
  async handleVerificationChallenge(
    lobsterChallenge: any,
    keyPairId?: string
  ): Promise<any> {
    if (!this.moltbookAdapter) {
      throw new Error('Moltbook adapter not initialized');
    }

    try {
      // Try cryptographic verification
      const response = await this.moltbookAdapter.handleMoltbookVerification(
        lobsterChallenge,
        {
          replaceLobsterMath: true,
          fallbackToMath: true,
        }
      );

      return {
        success: true,
        method: 'cryptographic',
        response,
      };
    } catch (error) {
      console.error('Cryptographic verification failed:', error);
      
      // Fallback to standard lobster math
      const mathResponse = await this.moltbookAdapter.fallbackToLobsterMath(
        lobsterChallenge
      );

      return {
        success: true,
        method: 'fallback',
        response: mathResponse,
      };
    }
  }

  /**
   * Get tool status
   */
  getStatus() {
    return {
      cryptoAuthEnabled: true,
      moltbookAdapter: this.moltbookAdapter.getStatus(),
      supportedPlatforms: ['moltbook'],
      features: ['cryptographic_challenges', 'key_management', 'reputation'],
    };
  }
}

// Example usage
async function exampleUsage() {
  const tool = new CryptoEnhancedMessageTool();

  // Example 1: Send message with cryptographic authentication
  const result1 = await tool.sendWithCryptoAuth({
    action: 'send',
    channel: 'moltbook',
    target: 'ai',
    message: 'Testing cryptographic authentication',
    useCryptoAuth: true,
    keyPairId: 'agent_key_123',
  });

  console.log('Result 1:', result1);

  // Example 2: Handle verification challenge
  const lobsterChallenge = {
    verification_code: 'moltbook_verify_123',
    challenge_text: 'A] Lo.bS tErS ClAw F_oRcE Is TwEnTy ThReE NeW|ToNs + TwElVe NeW^ToNs',
    expires_at: '2026-03-11 13:58:07.152391+00',
    instructions: 'Solve the math problem...',
  };

  const result2 = await tool.handleVerificationChallenge(
    lobsterChallenge,
    'agent_key_123'
  );

  console.log('Result 2:', result2);

  // Example 3: Get tool status
  const status = tool.getStatus();
  console.log('Tool Status:', status);
}

// Uncomment to run example
// exampleUsage().catch(console.error);
