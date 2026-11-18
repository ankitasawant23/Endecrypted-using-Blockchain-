import express from 'express';

import {
    encryptData,
    decryptData
} from '../controllers/encryptionController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/encrypt', verifyToken, encryptData);

router.post('/decrypt', verifyToken, decryptData);

export default router;