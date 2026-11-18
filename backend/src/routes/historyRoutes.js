import express from 'express';
import { getTransactionHistory } from '../controllers/historyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history', verifyToken, getTransactionHistory);

export default router;