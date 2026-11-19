import dotenv from 'dotenv';
import { JsonRpcProvider } from 'ethers';

dotenv.config();

const RPC_URL =
    process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';

let parsedUrl;

try {
    parsedUrl = new URL(RPC_URL);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Unsupported RPC URL protocol.');
    }
} catch {
    throw new Error('Invalid BLOCKCHAIN_RPC_URL in backend .env file.');
}

const provider = new JsonRpcProvider(RPC_URL);

provider.on('error', (error) => {
    console.error('Blockchain provider error:', error.message);
});

export default provider;