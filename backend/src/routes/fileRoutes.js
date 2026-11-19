import express from 'express';
import { getUserFiles } from '../controllers/fileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-files', verifyToken, getUserFiles);

export default router;