import { generateRSAKeys, saveRSAKeys } from './keyGeneration.js';

import { encryptMessage } from './encryption.js';

import { decryptMessage } from './decryption.js';
import { verifyBlockchainRecord } from './blockchainVerification.js';

import {
    generateEncryptedDataHash,
    verifyHash
} from './hashing.js';

// Original message
const message = "Hello! This is my Blockchain Security Project.";

// Generate RSA keys
const { publicKey, privateKey } = generateRSAKeys();

// Save keys locally
saveRSAKeys(publicKey, privateKey);

// Encrypt message
const encryptedObject = encryptMessage(message, publicKey);

// Generate SHA-256 hash
const originalHash = generateEncryptedDataHash(encryptedObject);

// Decrypt message
const decryptedMessage = decryptMessage(encryptedObject, privateKey);

// Generate hash again
const newHash = generateEncryptedDataHash(encryptedObject);

// Verify integrity
const integrity = verifyHash(originalHash, newHash);

console.log("\n========== CRYPTOGRAPHY RESULTS ==========");

console.log("\nOriginal Message:");
console.log(message);

console.log("\nEncrypted Message:");
console.log(encryptedObject.encryptedData);

console.log("\nSHA-256 Hash:");
console.log(originalHash);

console.log("\nDecrypted Message:");
console.log(decryptedMessage);

console.log("\nIntegrity Verification:");
console.log(integrity ? "SUCCESS - Data is authentic" : "FAILED - Data modified");

console.log("\n==========================================");

const verificationResult = verifyBlockchainRecord(
    encryptedObject,
    originalHash
);

console.log('\nBlockchain Hash Verification:');
console.log(verificationResult.message);