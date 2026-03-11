/**
 * Cryptographic authentication types for OpenClaw
 */

export interface KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  publicKeyHex: string;
  keyId: string;
  createdAt: Date;
}

export interface Signature {
  signature: Uint8Array;
  signatureHex: string;
  publicKey: Uint8Array;
  timestamp: Date;
  messageHash: string;
}

export interface CryptographicChallenge {
  challengeId: string;
  nonce: string;
  timestamp: Date;
  expiresAt: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ChallengeResponse {
  challengeId: string;
  signature: Signature;
  solvedAt: Date;
}

export interface AgentIdentity {
  agentId: string;
  publicKey: string;
  keyId: string;
  createdAt: Date;
  lastActive: Date;
  reputationScore?: number;
}

export interface AuthConfig {
  algorithm: 'ed25519' | 'secp256k1';
  keyStorage: 'memory' | 'secure' | 'external';
  challengeExpiry: number; // milliseconds
  requireTimestamp: boolean;
  enableRecovery: boolean;
}

export interface MoltbookCryptoConfig {
  replaceLobsterMath: boolean;
  challengeDifficulty: 'easy' | 'medium' | 'hard';
  fallbackToMath: boolean;
  enableReputation: boolean;
}

// Platform-specific configurations
export interface PlatformCryptoConfig {
  moltbook: MoltbookCryptoConfig;
  // Add other platforms as needed
  telegram?: unknown;
  discord?: unknown;
}
