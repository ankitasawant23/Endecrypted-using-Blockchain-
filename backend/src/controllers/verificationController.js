import db from '../config/database.js';

import {
    generateEncryptedDataHash,
    verifyHash
} from '../../../crypto-module/src/hashing.js';

export const verifyEncryptedData = async (req, res) => {
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
            `SELECT id, encrypted_data, encrypted_key,
                    iv, auth_tag, data_hash
             FROM encrypted_files
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

        // Validate stored hash
        if (
            typeof file.data_hash !== 'string' ||
            !/^[a-fA-F0-9]{64}$/.test(file.data_hash)
        ) {
            return res.status(200).json({
                success: true,
                message: 'Stored hash is invalid or corrupted.',
                isValid: false
            });
        }

        // Reconstruct encrypted object
        const encryptedObject = {
            encryptedData: file.encrypted_data,
            encryptedAESKey: file.encrypted_key,
            iv: file.iv,
            authTag: file.auth_tag
        };

        // Generate current SHA-256 hash
        const calculatedHash =
            generateEncryptedDataHash(encryptedObject);

        // Compare hashes
        const isValid = verifyHash(
            file.data_hash,
            calculatedHash
        );

        return res.status(200).json({
            success: true,
            message: isValid
                ? 'Data integrity verified successfully!'
                : 'Data integrity verification failed!',
            isValid,
            storedHash: file.data_hash,
            calculatedHash
        });

    } catch (error) {
        console.error('Verification Error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Verification failed.'
        });
    }
};
