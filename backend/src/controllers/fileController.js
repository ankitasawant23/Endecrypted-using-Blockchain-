import db from '../config/database.js';

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