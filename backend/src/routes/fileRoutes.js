import express from 'express';
import { getUserFiles, deleteUserFile } from '../controllers/fileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-files', verifyToken, getUserFiles);
router.delete('/:fileId', verifyToken, deleteUserFile);

export default router;