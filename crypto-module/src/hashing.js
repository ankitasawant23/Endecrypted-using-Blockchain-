import { createHash, timingSafeEqual } from 'node:crypto';

export function generateHash(data) {
    return createHash('sha256')
        .update(data)
        .digest('hex');
}

export function generateEncryptedDataHash(encryptedObject) {
    const data = JSON.stringify({
        encryptedData: encryptedObject.encryptedData,
        encryptedAESKey: encryptedObject.encryptedAESKey,
        iv: encryptedObject.iv,
        authTag: encryptedObject.authTag
    });

    return generateHash(data);
}

export function verifyHash(originalHash, newHash) {
    if (
        typeof originalHash !== 'string' ||
        typeof newHash !== 'string' ||
        !/^[a-f0-9]{64}$/i.test(originalHash) ||
        !/^[a-f0-9]{64}$/i.test(newHash)
    ) {
        return false;
    }

    const originalBuffer = Buffer.from(originalHash, 'hex');
    const newBuffer = Buffer.from(newHash, 'hex');

    return timingSafeEqual(originalBuffer, newBuffer);
}