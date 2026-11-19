import express from 'express';
import { storeFileHash } from '../controllers/blockchainController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/store-hash', verifyToken, storeFileHash);

export default router;