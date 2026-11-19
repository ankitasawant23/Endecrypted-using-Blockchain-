import provider from './blockchainConfig.js';

async function testBlockchainConnection() {
    try {
        const network = await provider.getNetwork();

        console.log('Blockchain connected successfully!');
        console.log('Network name:', network.name);
        console.log('Chain ID:', network.chainId.toString());

    } catch (error) {
        console.error('Blockchain connection failed:', error.message);
    }
}

testBlockchainConnection();