import { generateRSAKeys, saveRSAKeys } from '../../../crypto-module/src/keyGeneration.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysDirectory = path.join(__dirname, '../keys');

const publicKeyPath = path.join(keysDirectory, 'public.pem');
const privateKeyPath = path.join(keysDirectory, 'private.pem');

let publicKey;
let privateKey;

if (
    fs.existsSync(publicKeyPath) &&
    fs.existsSync(privateKeyPath)
) {
    publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    console.log('Existing RSA keys loaded successfully!');
} else {
    fs.mkdirSync(keysDirectory, { recursive: true });

    const keys = generateRSAKeys();

    saveRSAKeys(keys.publicKey, keys.privateKey);

    publicKey = keys.publicKey;
    privateKey = keys.privateKey;

    // Ensure keys are stored in backend/src/keys
    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });

    console.log('New RSA keys generated and saved successfully!');
}

export { publicKey, privateKey };