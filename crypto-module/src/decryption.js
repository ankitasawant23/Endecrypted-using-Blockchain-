import {
    privateDecrypt,
    createDecipheriv,
    constants
} from 'node:crypto';

export function decryptMessage(encryptedObject, privateKey) {

    // Decrypt AES key using RSA private key
    const aesKey = privateDecrypt(
        {
            key: privateKey,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(encryptedObject.encryptedAESKey, 'base64')
    );

    // Decode IV and authentication tag
    const iv = Buffer.from(encryptedObject.iv, 'base64');
    const authTag = Buffer.from(encryptedObject.authTag, 'base64');

    // Create AES decipher
    const decipher = createDecipheriv(
        'aes-256-gcm',
        aesKey,
        iv
    );

    decipher.setAuthTag(authTag);

    // Decrypt message
    let decrypted = decipher.update(
        encryptedObject.encryptedData,
        'base64',
        'utf8'
    );

    decrypted += decipher.final('utf8');

    return decrypted;
}