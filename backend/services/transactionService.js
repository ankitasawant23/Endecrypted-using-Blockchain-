import db from '../config/database.js';

export const saveBlockchainTransaction = async ({
    fileId,
    transactionHash,
    blockchainDataHash,
    blockNumber
} = {}) => {
    try {
        // Validate file ID
        if (!Number.isSafeInteger(fileId) || fileId <= 0) {
            throw new Error('Invalid file ID.');
        }

        // Validate transaction hash (Ethereum transaction hash)
        if (
            typeof transactionHash !== 'string' ||
            !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)
        ) {
            throw new Error('Invalid blockchain transaction hash.');
        }

        // Validate SHA-256 data hash
        if (
            typeof blockchainDataHash !== 'string' ||
            !/^[a-fA-F0-9]{64}$/.test(blockchainDataHash)
        ) {
            throw new Error('Invalid blockchain data hash.');
        }

        // Validate block number
        if (!Number.isSafeInteger(blockNumber) || blockNumber < 0) {
            throw new Error('Invalid block number.');
        }

        const [result] = await db.execute(
            `INSERT INTO blockchain_transactions
            (file_id, transaction_hash, blockchain_data_hash, block_number)
            VALUES (?, ?, ?, ?)`,
            [
                fileId,
                transactionHash,
                blockchainDataHash.toLowerCase(),
                blockNumber
            ]
        );

        return {
            success: true,
            transactionId: result.insertId
        };

    } catch (error) {
        console.error('Transaction saving error:', error.message);
        throw error;
    }
};