import mysql from 'mysql2/promise';

/**
 * Konfigurasi Database MySQL untuk Next.js
 * Menggunakan connection pool agar efisien
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,  // Max connection pool
    queueLimit: 0,
    // Penting untuk TiDB/Database Cloud -> butuh SSL
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? {
        rejectUnauthorized: true
    } : undefined
});

export default pool;
