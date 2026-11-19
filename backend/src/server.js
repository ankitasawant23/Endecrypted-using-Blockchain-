import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import { verifyToken } from './middleware/authMiddleware.js';
import encryptionRoutes from './routes/encryptionRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import blockchainRoutes from './routes/blockchainRoutes.js';
import blockchainVerificationRoutes from './routes/blockchainVerificationRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import { testDatabaseConnection } from './config/database.js';

dotenv.config();

const app = express();

// 1. Security and middleware
app.use(helmet());

app.use(cors({
    origin: '*'
}));

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));

// 2. API routes
app.use('/api/auth', authRoutes);
app.use('/api/encryption', encryptionRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api', historyRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/blockchain', blockchainVerificationRoutes);
app.use('/api/files', fileRoutes);

// 3. Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Blockchain Encryption Backend API is running!'
    });
});

// 4. Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Backend server is healthy!'
    });
});

// 5. Protected route
app.get('/api/protected', verifyToken, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'You have accessed a protected route!',
        user: req.user
    });
});

// 6. API information
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        project: 'Blockchain-Based Secure Encryption and Decryption System',
        version: '1.0.0',
        availableModules: [
            'Authentication',
            'Encryption',
            'Decryption',
            'Hash Verification',
            'Transaction History',
            'Blockchain Integration',
            'User Files'
        ]
    });
});

// 7. Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API route not found.'
    });
});

// 8. Global error handler
app.use((err, req, res, next) => {
    console.error('Global Error:', err.message);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        success: false,
        message: 'Internal server error.'
    });
});

// 9. Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    const isDatabaseConnected = await testDatabaseConnection();

    if (!isDatabaseConnected) {
        console.error('Server startup aborted: Database unavailable.');
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();