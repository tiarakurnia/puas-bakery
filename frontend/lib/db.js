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
    connectionLimit: 5,  // Reduced untuk cloud database
    queueLimit: 0,
    // Timeout settings - hanya connectTimeout yang supported
    connectTimeout: 60000, // 60 seconds untuk initial connection
    // Penting untuk TiDB/Database Cloud -> butuh SSL
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? {
        rejectUnauthorized: true
    } : undefined,
    // Keep alive untuk menjaga connection tetap hidup
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection saat startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully (TiDB Cloud)');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

export default pool;
