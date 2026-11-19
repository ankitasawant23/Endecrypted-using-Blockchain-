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