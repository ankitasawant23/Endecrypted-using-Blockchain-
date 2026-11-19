import express from 'express';
import { verifyBlockchainHash } from '../controllers/blockchainVerificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/verify', verifyToken, verifyBlockchainHash);

export default router;