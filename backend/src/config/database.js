import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredVariables = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
];

for (const variable of requiredVariables) {
    if (process.env[variable] === undefined) {
        throw new Error(
            `Missing required environment variable: ${variable}`
        );
    }
}

// Create MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    charset: 'utf8mb4'
});

// Test database connection
export const testDatabaseConnection = async () => {
    try {
        const connection = await db.getConnection();

        console.log('MySQL database connected successfully!');

        connection.release();

        return true;

    } catch (error) {
        console.error('MySQL connection failed:', error.message);

        return false;
    }
};

export default db;