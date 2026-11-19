import db from '../config/database.js';

export const storeFileHash = async (req, res) => {
    try {
        const { fileId } = req.body || {};
        const userId = req.user?.id;

        // Validate authentication
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user authentication.'
            });
        }

        // Validate file ID
        if (!Number.isSafeInteger(fileId) || fileId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'A valid positive file ID is required.'
            });
        }

        // Fetch file belonging to logged-in user
        const [files] = await db.execute(
            `SELECT id, data_hash, created_at
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

        const file = files[0];

        // Validate SHA-256 hash
        if (
            typeof file.data_hash !== 'string' ||
            !/^[a-fA-F0-9]{64}$/.test(file.data_hash)
        ) {
            return res.status(500).json({
                success: false,
                message: 'Stored file hash is invalid.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'File hash retrieved successfully. Ready for blockchain integration.',
            fileId: file.id,
            dataHash: file.data_hash.toLowerCase(),
            blockchainStatus: 'PENDING'
        });

    } catch (error) {
        console.error('Blockchain controller error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to prepare blockchain transaction.'
        });
    }
};