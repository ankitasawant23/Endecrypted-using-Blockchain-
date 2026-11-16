import {
    randomBytes,
    createCipheriv,
    publicEncrypt,
    constants
} from 'node:crypto';

export function encryptMessage(message, publicKey) {

    // Generate a random 256-bit AES key
    const aesKey = randomBytes(32);

    // Generate a random 96-bit IV
    const iv = randomBytes(12);

    // Create AES-256-GCM cipher
    const cipher = createCipheriv('aes-256-gcm', aesKey, iv);

    // Encrypt the original message
    let encrypted = cipher.update(message, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    // Encrypt AES key using RSA public key
    const encryptedAESKey = publicEncrypt(
        {
            key: publicKey,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        aesKey
    );

    return {
        encryptedData: encrypted,
        encryptedAESKey: encryptedAESKey.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64')
    };
}