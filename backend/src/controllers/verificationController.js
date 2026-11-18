import db from '../config/database.js';

import {
    generateEncryptedDataHash,
    verifyHash
} from '../../../crypto-module/src/hashing.js';


export const verifyEncryptedData = async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(400).json({
                success: false,
                message: 'File ID is required.'
            });
        }

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

        const calculatedHash =
            generateEncryptedDataHash(encryptedObject);

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