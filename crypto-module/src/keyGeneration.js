import { generateKeyPairSync } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export function generateRSAKeys() {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    return { publicKey, privateKey };
}

export function saveRSAKeys(publicKey, privateKey) {
    const keysDirectory = join(process.cwd(), 'keys');

    mkdirSync(keysDirectory, { recursive: true });

    writeFileSync(join(keysDirectory, 'public.pem'), publicKey);

    writeFileSync(join(keysDirectory, 'private.pem'), privateKey, {
        mode: 0o600
    });

    console.log('RSA keys generated successfully!');
}