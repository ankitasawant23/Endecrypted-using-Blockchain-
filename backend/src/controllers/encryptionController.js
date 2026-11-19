import db from '../config/database.js';

import { publicKey, privateKey } from '../config/cryptoConfig.js';

import { encryptMessage } from '../../../crypto-module/src/encryption.js';

import { decryptMessage } from '../../../crypto-module/src/decryption.js';

import {
    generateEncryptedDataHash,
    verifyHash
} from '../../../crypto-module/src/hashing.js';


// ENCRYPT DATA
export const encryptData = async (req, res) => {
    try {
        const { message, fileName } = req.body || {};

        // Validate message
        if (
            typeof message !== 'string' ||
            message.trim().length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'A valid message is required.'
            });
        }

        if (message.length > 10000) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot exceed 10000 characters.'
            });
        }

        // Validate file name
        if (
            fileName !== undefined &&
            (
                typeof fileName !== 'string' ||
                fileName.trim().length === 0 ||
                fileName.length > 255
            )
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid file name.'
            });
        }

        // Encrypt using RSA + AES
        const encryptedObject = encryptMessage(message, publicKey);

        // Generate SHA-256 hash
        const dataHash = generateEncryptedDataHash(encryptedObject);

        // Store encrypted data in MySQL
        const [result] = await db.execute(
            `INSERT INTO encrypted_files
            (user_id, file_name, encrypted_data, encrypted_key, iv, auth_tag, data_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                fileName ? fileName.trim() : 'text-data',
                encryptedObject.encryptedData,
                encryptedObject.encryptedAESKey,
                encryptedObject.iv,
                encryptedObject.authTag,
                dataHash
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Data encrypted and stored successfully!',
            fileId: result.insertId,
            encryptedData: encryptedObject,
            dataHash
        });

    } catch (error) {
        console.error('Encryption Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Encryption failed.'
        });
    }
};


// DECRYPT DATA
export const decryptData = async (req, res) => {
    try {
        const { fileId } = req.body || {};

        // Validate file ID
        if (
            !Number.isSafeInteger(fileId) ||
            fileId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'A valid positive file ID is required.'
            });
        }

        // Fetch only the logged-in user's file
        const [files] = await db.execute(
            `SELECT * FROM encrypted_files
             WHERE id = ? AND user_id = ?`,
            [fileId, req.user.id]
        );

        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Encrypted file not found.'
            });
        }

        const file = files[0];

        const encryptedObject = {
            encryptedData: file.encrypted_data,
            encryptedAESKey: file.encrypted_key,
            iv: file.iv,
            authTag: file.auth_tag
        };

        // Verify encrypted data integrity
        const calculatedHash =
            generateEncryptedDataHash(encryptedObject);

        const isValid = verifyHash(
            file.data_hash,
            calculatedHash
        );

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Encrypted data integrity verification failed. Decryption stopped.'
            });
        }

        // Decrypt data
        const decryptedMessage = decryptMessage(
            encryptedObject,
            privateKey
        );

        return res.status(200).json({
            success: true,
            message: 'Data integrity verified and decryption successful!',
            decryptedData: decryptedMessage
        });

    } catch (error) {
        console.error('Decryption Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Decryption failed.'
        });
    }
};
