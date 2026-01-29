/**
 * Route untuk Dashboard & Analytics
 * Endpoint: /api/dashboard
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/dashboard/summary
 * Widget ringkasan hari ini
 */
router.get('/summary', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Total pesanan hari ini per status
        const [pesananStats] = await db.query(`
            SELECT 
                status,
                COUNT(*) as total
            FROM pesanan
            WHERE DATE(tanggal_pesan) = ?
            GROUP BY status
        `, [today]);

        // Total pendapatan hari ini
        const [pendapatan] = await db.query(`
            SELECT 
                SUM(dp) as total_dp,
                SUM(CASE WHEN jenis_bayar = 'LUNAS' THEN total ELSE 0 END) as total_lunas,
                SUM(total) as total_transaksi
            FROM pesanan
            WHERE DATE(tanggal_pesan) = ?
            AND status != 'DIBATALKAN'
        `, [today]);

        res.json({
            success: true,
            data: {
                pesanan: pesananStats,
                pendapatan: pendapatan[0] || { total_dp: 0, total_lunas: 0, total_transaksi: 0 }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/dashboard/alerts
 * Alert pesanan mendekati jam ambil & piutang
 */
router.get('/alerts', async (req, res) => {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];

        // Pesanan hari ini yang akan diambil dalam 30 menit
        const [upcomingOrders] = await db.query(`
            SELECT 
                p.id,
                p.nomor_pesanan,
                p.jam_ambil,
                c.nama as nama_customer,
                p.status
            FROM pesanan p
            JOIN customer c ON p.customer_id = c.id
            WHERE p.tanggal_ambil = ?
            AND p.status IN ('BARU', 'DIPROSES', 'SIAP DIAMBIL')
            AND TIMESTAMPDIFF(MINUTE, ?, p.jam_ambil) BETWEEN 0 AND 30
            ORDER BY p.jam_ambil
        `, [today, currentTime]);

        // Piutang belum lunas (tanggal ambil besok)
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const [piutangAlerts] = await db.query(`
            SELECT 
                p.id,
                p.nomor_pesanan,
                p.tanggal_ambil,
                p.sisa_bayar,
                c.nama as nama_customer,
                c.no_hp
            FROM pesanan p
            JOIN customer c ON p.customer_id = c.id
            WHERE p.tanggal_ambil = ?
            AND p.sisa_bayar > 0
            AND p.status NOT IN ('DIBATALKAN', 'SELESAI')
            ORDER BY p.jam_ambil
        `, [tomorrowStr]);

        res.json({
            success: true,
            data: {
                upcomingOrders,
                piutangAlerts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/dashboard/top-products
 * Top 5 produk terlaris (7 hari terakhir)
 */
router.get('/top-products', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT 
                pd.nama_produk,
                SUM(pd.qty) as total_qty,
                COUNT(DISTINCT pd.pesanan_id) as total_orders,
                SUM(pd.subtotal) as total_revenue
            FROM pesanan_detail pd
            JOIN pesanan p ON pd.pesanan_id = p.id
            WHERE p.tanggal_pesan >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            AND p.status != 'DIBATALKAN'
            GROUP BY pd.nama_produk
            ORDER BY total_qty DESC
            LIMIT 5
        `);

        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/dashboard/new-customers
 * Jumlah customer baru bulan ini
 */
router.get('/new-customers', async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT COUNT(*) as total
            FROM customer
            WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
            AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `);

        res.json({
            success: true,
            data: { total: result[0].total }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
