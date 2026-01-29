/**
 * Entry Point Backend - Kasir Puas Bakery
 * Server ExpressJS untuk menangani API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Inisialisasi app
// Inisialisasi app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: '*', // Di production, ganti dengan URL frontend Vercel nanti
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Import routes
const produkRoutes = require('./routes/produk');
const customerRoutes = require('./routes/customer');
const transaksiRoutes = require('./routes/transaksi');
const dashboardRoutes = require('./routes/dashboard');
const pelunasanRoutes = require('./routes/pelunasan');
const backupRoutes = require('./routes/backup');
const jamOperasionalRoutes = require('./routes/jam-operasional');

// Gunakan routes
app.use('/api/produk', produkRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/transaksi', transaksiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pelunasan', pelunasanRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/jam-operasional', jamOperasionalRoutes);

// Route default untuk cek server
app.get('/', (req, res) => {
    res.json({
        message: 'API Kasir Puas Bakery',
        version: '1.0.0',
        endpoints: [
            'GET /api/produk - Daftar semua produk',
            'GET /api/produk/:id - Detail produk',
            'POST /api/produk - Tambah produk baru',
            'PUT /api/produk/:id - Edit produk',
            'DELETE /api/produk/:id - Hapus produk'
        ]
    });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
