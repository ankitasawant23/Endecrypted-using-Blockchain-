import db from '../config/database.js';
import bcrypt from 'bcrypt';

export const getUserFiles = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user authentication.'
            });
        }

        const [files] = await db.execute(
            `SELECT
                id,
                file_name,
                data_hash,
                created_at
            FROM encrypted_files
            WHERE user_id = ?
            ORDER BY created_at DESC`,
            [userId]
        );

        return res.status(200).json({
            success: true,
            count: files.length,
            files
        });

    } catch (error) {
        console.error('Get user files error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve encrypted files.'
        });
    }
};

export const deleteUserFile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const fileId = Number(req.params.fileId);
        const { decryptionKey } = req.body || {};

        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user authentication.'
            });
        }

        if (!Number.isSafeInteger(fileId) || fileId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid file ID is required.'
            });
        }

        if (typeof decryptionKey !== 'string' || decryptionKey.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'The record decryption key is required to delete this file.'
            });
        }

        const [files] = await db.execute(
            `SELECT decryption_key_hash
             FROM encrypted_files
             WHERE id = ? AND user_id = ?`,
            [fileId, userId]
        );

        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Encrypted file not found.'
            });
        }

        const keyHash = files[0].decryption_key_hash;

        if (typeof keyHash !== 'string') {
            return res.status(409).json({
                success: false,
                message: 'This file has no saved decryption key and cannot be deleted with key verification.'
            });
        }

        if (!(await bcrypt.compare(decryptionKey, keyHash))) {
            return res.status(403).json({
                success: false,
                message: 'The decryption key is incorrect.'
            });
        }

        const [result] = await db.execute(
            'DELETE FROM encrypted_files WHERE id = ? AND user_id = ?',
            [fileId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Encrypted file not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Encrypted file deleted successfully.',
            fileId
        });
    } catch (error) {
        console.error('Delete user file error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Unable to delete encrypted file.'
        });
    }
};