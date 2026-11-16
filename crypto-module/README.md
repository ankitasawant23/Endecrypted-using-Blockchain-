# Cryptography Module

## Project
Blockchain-Based Secure Encryption and Decryption System

## Overview
This module provides secure message encryption, decryption and integrity verification using modern cryptographic algorithms.

## Technologies
- Node.js
- RSA-2048
- RSA-OAEP with SHA-256
- AES-256-GCM
- SHA-256

## Features
1. RSA public and private key generation.
2. AES-256-GCM message encryption.
3. RSA-OAEP encryption of AES keys.
4. Secure message decryption.
5. SHA-256 hash generation.
6. Encrypted data integrity verification.
7. Blockchain hash verification logic.

## Installation

```bash
npm install
```

## Execution

```bash
node src/index.js
```

## Testing

```bash
npm test
```

## Security
- Private keys must never be uploaded to GitHub.
- AES keys are generated randomly.
- AES-GCM authentication protects encrypted messages against tampering.
- Blockchain stores encrypted data hashes, not original messages or private keys.

## Current Status
Cryptography implementation and automated tests completed. Actual blockchain integration is pending.