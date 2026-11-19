import db from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ==========================================
// 1. USER REGISTRATION API
// ==========================================

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            });
        }

        // Validate input types
        if (
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input format.'
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Name must contain 1 to 100 characters.'
            });
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        // Validate password
        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain between 8 and 72 characters.'
            });
        }

        // Check whether email already exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [cleanEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert user into database
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [cleanName, cleanEmail, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};


// ==========================================
// 2. USER LOGIN API
// ==========================================

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        // Validate input types and required fields
        if (
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Valid email and password are required.'
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.'
            });
        }

        if (password.length > 72) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Find user by email
        const [users] = await db.execute(
            'SELECT id, name, email, password FROM users WHERE email = ?',
            [cleanEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check JWT secret configuration
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured.');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};
