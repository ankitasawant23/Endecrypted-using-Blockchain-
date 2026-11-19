import { Contract, isAddress } from 'ethers';
import provider from './blockchainConfig.js';

let blockchainContract = null;

export const connectContract = (contractAddress, contractABI) => {
    if (!contractAddress || !contractABI) {
        throw new Error('Contract address and ABI are required.');
    }

    if (!isAddress(contractAddress)) {
        throw new Error('Invalid smart contract address.');
    }

    if (!Array.isArray(contractABI)) {
        throw new Error('Contract ABI must be an array.');
    }

    blockchainContract = new Contract(
        contractAddress,
        contractABI,
        provider
    );

    console.log('Smart contract connection prepared.');

    return blockchainContract;
};

export const storeHashOnBlockchain = async (dataHash) => {
    if (!blockchainContract) {
        throw new Error('Smart contract is not configured yet.');
    }

    if (typeof dataHash !== 'string' ||
        !/^[a-fA-F0-9]{64}$/.test(dataHash)) {
        throw new Error('Invalid SHA-256 hash.');
    }

    throw new Error(
        'Transaction signer and smart contract storage method are not configured yet.'
    );
};

export const verifyHashOnBlockchain = async (dataHash) => {
    if (!blockchainContract) {
        throw new Error('Smart contract is not configured yet.');
    }

    if (typeof dataHash !== 'string' ||
        !/^[a-fA-F0-9]{64}$/.test(dataHash)) {
        throw new Error('Invalid SHA-256 hash.');
    }

    throw new Error(
        'Smart contract verification method is not configured yet.'
    );
};