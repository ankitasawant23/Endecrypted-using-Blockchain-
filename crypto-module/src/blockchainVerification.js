import { generateEncryptedDataHash, verifyHash } from './hashing.js';

export function verifyBlockchainRecord(encryptedObject, blockchainHash) {

    // Generate hash from received encrypted data
    const calculatedHash = generateEncryptedDataHash(encryptedObject);

    // Compare with independently retrieved blockchain hash
    const isValid = verifyHash(blockchainHash, calculatedHash);

    return {
        isValid,
        calculatedHash,
        blockchainHash,
        message: isValid
            ? 'Data integrity verified successfully.'
            : 'Data integrity verification failed. Data may have been modified.'
    };
}