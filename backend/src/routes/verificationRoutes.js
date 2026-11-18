import express from 'express';

import {
    verifyEncryptedData
} from '../controllers/verificationController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/verify', verifyToken, verifyEncryptedData);

export default router;