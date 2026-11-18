import express from 'express';

import {
    registerUser,
    loginUser
} from '../controllers/authController.js';

const router = express.Router();

// Registration API
router.post('/register', registerUser);

// Login API
router.post('/login', loginUser);

export default router;