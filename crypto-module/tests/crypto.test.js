import test from 'node:test';
import assert from 'node:assert/strict';

import { generateRSAKeys } from '../src/keyGeneration.js';
import { encryptMessage } from '../src/encryption.js';
import { decryptMessage } from '../src/decryption.js';

import {
    generateEncryptedDataHash,
    verifyHash
} from '../src/hashing.js';

// TEST 1: RSA Key Generation
test('Generate RSA keys successfully', () => {
    const { publicKey, privateKey } = generateRSAKeys();

    assert.ok(publicKey.includes('BEGIN PUBLIC KEY'));
    assert.ok(privateKey.includes('BEGIN PRIVATE KEY'));
});

// TEST 2: Encryption and Decryption
test('Encrypt and decrypt message successfully', () => {
    const { publicKey, privateKey } = generateRSAKeys();

    const message = 'Blockchain Security Project';

    const encrypted = encryptMessage(message, publicKey);
    const decrypted = decryptMessage(encrypted, privateKey);

    assert.equal(decrypted, message);
});

// TEST 3: Encrypted Message Protection
test('Encrypted data should not contain original message', () => {
    const { publicKey } = generateRSAKeys();

    const message = 'Secret Message';

    const encrypted = encryptMessage(message, publicKey);

    assert.notEqual(encrypted.encryptedData, message);
});

// TEST 4: Tampering Detection
test('Modified encrypted data should fail authentication', () => {
    const { publicKey, privateKey } = generateRSAKeys();

    const encrypted = encryptMessage('Secure Message', publicKey);

    const tamperedCiphertext = Buffer.from(
        encrypted.encryptedData,
        'base64'
    );

    // Change an actual ciphertext byte
    tamperedCiphertext[0] ^= 0x01;

    const modified = {
        ...encrypted,
        encryptedData: tamperedCiphertext.toString('base64')
    };

    assert.throws(() => {
        decryptMessage(modified, privateKey);
    });
});

// TEST 5: SHA-256 Hash Generation
test('Generate SHA-256 hash successfully', () => {
    const { publicKey } = generateRSAKeys();

    const encrypted = encryptMessage('Test Message', publicKey);

    const hash = generateEncryptedDataHash(encrypted);

    assert.match(hash, /^[a-f0-9]{64}$/);
});

test('Verify matching hashes', () => {
    const hash1 = 'a'.repeat(64);
    const hash2 = 'a'.repeat(64);

    assert.equal(verifyHash(hash1, hash2), true);
});

// TEST 7: Different Hash Verification
test('Reject different hashes', () => {
    assert.equal(verifyHash('abc123', 'xyz789'), false);
});

import { verifyBlockchainRecord } from '../src/blockchainVerification.js';

test('Verify encrypted data against blockchain hash', () => {

    const { publicKey } = generateRSAKeys();

    const encrypted = encryptMessage('Blockchain Test', publicKey);

    const blockchainHash = generateEncryptedDataHash(encrypted);

    const result = verifyBlockchainRecord(encrypted, blockchainHash);

    assert.equal(result.isValid, true);
});

test('Reject modified data against blockchain hash', () => {

    const { publicKey } = generateRSAKeys();

    const encrypted = encryptMessage('Blockchain Test', publicKey);

    const blockchainHash = generateEncryptedDataHash(encrypted);

    const modified = {
        ...encrypted,
        encryptedData: 'ModifiedEncryptedData'
    };

    const result = verifyBlockchainRecord(modified, blockchainHash);

    assert.equal(result.isValid, false);
});

test('Reject invalid hash formats', () => {

    assert.equal(verifyHash('invalid', 'invalid'), false);
});