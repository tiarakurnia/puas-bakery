/**
 * Route untuk Backup & Restore Database
 * Endpoint: /api/backup
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/backup/export
 * Export seluruh database ke JSON
 */
router.get('/export', async (req, res) => {
    try {
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            database: 'kasir_puas'
        };

        // Export semua tabel
        const tables = [
            'produk',
            'customer',
            'pesanan',
            'pesanan_detail',
            'konfigurasi',
            'jam_operasional',
            'slot_waktu',
            'tanggal_libur',
            'history_pembayaran'
        ];

        for (const table of tables) {
            const [rows] = await db.query(`SELECT * FROM ${table}`);
            backup[table] = rows;
        }

        // Set header untuk download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=backup-kasir-${Date.now()}.json`);
        res.json(backup);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/backup/import
 * Import data dari JSON backup
 */
router.post('/import', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const backupData = req.body;

        // Validasi struktur
        if (!backupData.version || !backupData.timestamp) {
            throw new Error('Format backup tidak valid');
        }

        await connection.beginTransaction();

        // Disable foreign key checks sementara
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Truncate all tables
        const tables = [
            'history_pembayaran',
            'pesanan_detail',
            'pesanan',
            'customer',
            'produk',
            'tanggal_libur',
            'slot_waktu',
            'jam_operasional',
            'konfigurasi'
        ];

        for (const table of tables) {
            await connection.query(`TRUNCATE TABLE ${table}`);
        }

        // Import data
        const importTables = [
            'produk',
            'customer',
            'konfigurasi',
            'jam_operasional',
            'slot_waktu',
            'tanggal_libur',
            'pesanan',
            'pesanan_detail',
            'history_pembayaran'
        ];

        for (const table of importTables) {
            if (backupData[table] && backupData[table].length > 0) {
                const data = backupData[table];
                const columns = Object.keys(data[0]);
                const placeholders = columns.map(() => '?').join(',');

                const values = data.map(row => columns.map(col => row[col]));

                for (const row of values) {
                    await connection.query(
                        `INSERT INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`,
                        row
                    );
                }
            }
        }

        // Enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        await connection.commit();

        res.json({
            success: true,
            message: 'Database berhasil di-restore',
            stats: {
                timestamp: backupData.timestamp,
                tables_imported: importTables.length
            }
        });
    } catch (error) {
        await connection.rollback();
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

/**
 * POST /api/backup/validate
 * Validasi file backup sebelum import
 */
router.post('/validate', async (req, res) => {
    try {
        const backupData = req.body;

        const errors = [];
        const warnings = [];

        // Cek struktur dasar
        if (!backupData.version) errors.push('Version tidak ditemukan');
        if (!backupData.timestamp) errors.push('Timestamp tidak ditemukan');
        if (!backupData.database) warnings.push('Nama database tidak tercantum');

        // Cek tabel required
        const requiredTables = ['produk', 'customer', 'pesanan', 'konfigurasi'];
        for (const table of requiredTables) {
            if (!backupData[table]) {
                errors.push(`Tabel ${table} tidak ditemukan`);
            }
        }

        // Hitung statistik
        const stats = {
            produk: backupData.produk?.length || 0,
            customer: backupData.customer?.length || 0,
            pesanan: backupData.pesanan?.length || 0,
            pesanan_detail: backupData.pesanan_detail?.length || 0
        };

        res.json({
            success: errors.length === 0,
            valid: errors.length === 0,
            errors,
            warnings,
            stats
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            valid: false,
            errors: ['Format JSON tidak valid']
        });
    }
});

module.exports = router;
