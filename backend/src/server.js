import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { verifyToken } from './middleware/authMiddleware.js';
import encryptionRoutes from './routes/encryptionRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/encryption', encryptionRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api', historyRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Blockchain Encryption Backend API is running!'
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend server is healthy!'
    });
});
app.get('/api/protected', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'You have accessed a protected route!',
        user: req.user
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});