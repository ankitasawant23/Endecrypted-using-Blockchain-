import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        // Check JWT secret configuration
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is missing.');

            return res.status(500).json({
                success: false,
                message: 'Authentication service is not configured.'
            });
        }

        // Get authorization header
        const authHeader = req.headers.authorization;

        if (
            typeof authHeader !== 'string' ||
            !/^Bearer\s+\S+$/i.test(authHeader)
        ) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No valid token provided.'
            });
        }

        // Extract token
        const token = authHeader.slice(7).trim();

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ['HS256']
            }
        );

        // Validate token payload
        if (
            !Number.isSafeInteger(decoded.id) ||
            decoded.id <= 0 ||
            typeof decoded.email !== 'string'
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token.'
            });
        }

        // Attach authenticated user
        req.user = {
            id: decoded.id,
            email: decoded.email
        };

        next();

    } catch (error) {
        console.error('JWT verification failed:', error.message);

        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};