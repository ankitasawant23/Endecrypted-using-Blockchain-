import { generateRSAKeys } from '../../../crypto-module/src/keyGeneration.js';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysDirectory = path.join(__dirname, '../keys');

const publicKeyPath = path.join(keysDirectory, 'public.pem');
const privateKeyPath = path.join(keysDirectory, 'private.pem');

fs.mkdirSync(keysDirectory, { recursive: true });

const publicKeyExists = fs.existsSync(publicKeyPath);
const privateKeyExists = fs.existsSync(privateKeyPath);

let publicKey;
let privateKey;

if (publicKeyExists && privateKeyExists) {

    publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    privateKey = fs.readFileSync(privateKeyPath, 'utf8');

    console.log('Existing RSA keys loaded successfully!');

} else if (publicKeyExists || privateKeyExists) {

    throw new Error(
        'Only one RSA key file exists. Restore the missing key from backup before starting the server.'
    );

} else {

    const keys = generateRSAKeys();

    publicKey = keys.publicKey;
    privateKey = keys.privateKey;

    fs.writeFileSync(publicKeyPath, publicKey);
    fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });

    console.log('New RSA keys generated and saved successfully!');
}

export { publicKey, privateKey };
