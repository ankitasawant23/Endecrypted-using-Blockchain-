import db from '../config/database.js';

export const verifyBlockchainHash = async (req, res) => {
    try {
        const { fileId } = req.body || {};
        const userId = req.user?.id;

        // Validate authenticated user
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

        // Fetch the logged-in user's file
        const [files] = await db.execute(
            `SELECT id, data_hash
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

        const storedHash = files[0].data_hash;

        // Validate database hash
        if (
            typeof storedHash !== 'string' ||
            !/^[a-fA-F0-9]{64}$/.test(storedHash)
        ) {
            return res.status(500).json({
                success: false,
                message: 'Stored database hash is invalid.'
            });
        }

        // Fetch latest transaction belonging to this user's file
        const [transactions] = await db.execute(
            `SELECT
                bt.transaction_hash,
                bt.blockchain_data_hash,
                bt.block_number
             FROM blockchain_transactions bt
             INNER JOIN encrypted_files ef
                ON bt.file_id = ef.id
             WHERE bt.file_id = ?
               AND ef.user_id = ?
             ORDER BY bt.id DESC
             LIMIT 1`,
            [fileId, userId]
        );

        if (transactions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No blockchain transaction record found. Verification is pending.',
                blockchainVerified: false,
                blockchainStatus: 'PENDING'
            });
        }

        const transaction = transactions[0];
        const blockchainHash = transaction.blockchain_data_hash;

        // Validate recorded hash
        if (
            typeof blockchainHash !== 'string' ||
            !/^[a-fA-F0-9]{64}$/.test(blockchainHash)
        ) {
            return res.status(200).json({
                success: true,
                message: 'Recorded blockchain data hash is invalid.',
                blockchainVerified: false,
                blockchainStatus: 'INVALID'
            });
        }

        // Compare database hash with recorded transaction hash
        const isValid =
            storedHash.toLowerCase() === blockchainHash.toLowerCase();

        return res.status(200).json({
            success: true,
            message: isValid
                ? 'Database hash matches the recorded transaction hash.'
                : 'Database hash does not match the recorded transaction hash.',
            blockchainVerified: isValid,
            blockchainStatus: isValid ? 'MATCHED' : 'MISMATCHED',
            verificationType: 'DATABASE_RECORD_COMPARISON',
            transaction
        });

    } catch (error) {
        console.error('Blockchain verification error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Blockchain verification preparation failed.'
        });
    }
};