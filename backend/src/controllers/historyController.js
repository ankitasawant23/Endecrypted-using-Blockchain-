import db from '../config/database.js';

export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user?.id;

        // Validate authenticated user
        if (!Number.isSafeInteger(userId) || userId <= 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid user authentication.'
            });
        }

        // Pagination
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        if (
            !Number.isSafeInteger(page) ||
            !Number.isSafeInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pagination parameters.'
            });
        }

        const offset = (page - 1) * limit;

        // Retrieve each user's files and their latest blockchain transaction
        const [history] = await db.execute(
            `SELECT
                ef.id AS fileId,
                ef.file_name AS fileName,
                ef.data_hash AS dataHash,
                ef.created_at AS encryptedAt,
                bt.transaction_hash AS transactionHash,
                bt.blockchain_data_hash AS blockchainDataHash,
                bt.block_number AS blockNumber,
                bt.created_at AS transactionAt
            FROM encrypted_files ef
            LEFT JOIN blockchain_transactions bt
                ON bt.id = (
                    SELECT MAX(bt2.id)
                    FROM blockchain_transactions bt2
                    WHERE bt2.file_id = ef.id
                )
            WHERE ef.user_id = ?
            ORDER BY ef.created_at DESC, ef.id DESC
            LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        // Count total encrypted files belonging to the user
        const [countResult] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM encrypted_files
             WHERE user_id = ?`,
            [userId]
        );

        const total = Number(countResult[0].total);

        return res.status(200).json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            count: history.length,
            history
        });

    } catch (error) {
        console.error('Transaction history error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history.'
        });
    }
};