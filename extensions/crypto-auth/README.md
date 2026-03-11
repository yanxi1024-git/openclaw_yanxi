# OpenClaw Cryptographic Authentication Extension

## Overview

This extension provides cryptographic authentication capabilities for OpenClaw, specifically designed to replace traditional CAPTCHA systems like Moltbook's "lobster math" with cryptographic proofs.

## Features

- **Cryptographic Challenges**: Replace simple math problems with cryptographic proofs
- **Key Management**: Secure generation and storage of cryptographic keys
- **Moltbook Integration**: Seamless integration with Moltbook's verification system
- **Fallback Support**: Graceful fallback to traditional verification when needed
- **Reputation System**: Build verifiable reputation for AI Agents

## Installation

```bash
cd extensions/crypto-auth
npm install
```

## Usage

### Basic Setup

```typescript
import { MoltbookCryptoAdapter } from './src/moltbook-adapter.js';

const adapter = new MoltbookCryptoAdapter({
  replaceLobsterMath: true,
  fallbackToMath: true,
  enableReputation: true,
});

// Handle Moltbook verification
const response = await adapter.handleMoltbookVerification(lobsterChallenge);
```

### Integration with OpenClaw Message Tool

This extension is designed to integrate with OpenClaw's message tool system, providing cryptographic authentication for platforms like Moltbook.

## Architecture

```
extensions/crypto-auth/
├── src/
│   ├── index.ts              # Main service
│   ├── key-management.ts     # Key generation and storage
│   ├── moltbook-adapter.ts   # Moltbook-specific integration
│   └── types.ts              # Type definitions
├── tests/                    # Test files
├── package.json
└── README.md
```

## Configuration

### AuthConfig
```typescript
{
  algorithm: 'ed25519' | 'secp256k1',
  keyStorage: 'memory' | 'secure' | 'external',
  challengeExpiry: 300000, // 5 minutes
  requireTimestamp: true,
  enableRecovery: false
}
```

### MoltbookCryptoConfig
```typescript
{
  replaceLobsterMath: boolean,
  challengeDifficulty: 'easy' | 'medium' | 'hard',
  fallbackToMath: boolean,
  enableReputation: boolean
}
```

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Roadmap

### Phase 1: Foundation (Current)
- Basic cryptographic challenge system
- Moltbook adapter with fallback support
- Memory-based key storage

### Phase 2: Enhanced Security
- Secure key storage (HSM/TPM integration)
- Actual cryptographic implementations
- Zero-knowledge proof support

### Phase 3: Ecosystem Integration
- Cross-platform identity management
- Reputation system integration
- Standard compliance (W3C DID, etc.)

## Contributing

Contributions are welcome! Please see the OpenClaw contributing guidelines.

## License

MIT
