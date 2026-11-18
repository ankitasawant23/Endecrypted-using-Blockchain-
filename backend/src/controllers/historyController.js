import db from '../config/database.js';

export const getTransactionHistory = async (req, res) => {
    try {
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
            ON ef.id = bt.file_id
            WHERE ef.user_id = ?
            ORDER BY ef.created_at DESC`,
            [req.user.id]
        );

        return res.status(200).json({
            success: true,
            count: history.length,
            history
        });

    } catch (error) {
        console.error('Transaction history error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history.'
        });
    }
};
