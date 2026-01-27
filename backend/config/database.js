/**
 * Konfigurasi Database MySQL
 * Menggunakan Connection Pool untuk performa dan stabilitas
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Buat connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasir_puas',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Opsi khusus
    dateStrings: true // Agar tanggal dikembalikan sebagai string
});

// Test koneksi
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully (MySQL)');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
    });

module.exports = pool;
