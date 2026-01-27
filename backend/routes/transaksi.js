/**
 * Route untuk Modul Transaksi Pesanan
 * Endpoint: /api/transaksi
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Helper: Generate Nomor Pesanan
 * Format: ORD-YYYYMMDD-XXX
 */
async function generateNomorPesanan(connection) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`; // YYYYMMDD
    const prefix = `ORD-${dateStr}-`;

    // Cari nomor urut terakhir hari ini
    const [rows] = await connection.execute(`
        SELECT nomor_pesanan FROM pesanan 
        WHERE nomor_pesanan LIKE ? 
        ORDER BY nomor_pesanan DESC LIMIT 1
    `, [`${prefix}%`]);

    let sequence = 1;
    if (rows.length > 0) {
        const lastOrder = rows[0];
        const lastSeq = parseInt(lastOrder.nomor_pesanan.split('-').pop());
        sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
}

/**
 * GET /api/transaksi
 * Mengambil daftar pesanan (dengan filter)
 */
router.get('/', async (req, res) => {
    try {
        const { status, tanggal, search } = req.query;
        let query = `
            SELECT p.*, c.nama as nama_customer 
            FROM pesanan p
            JOIN customer c ON p.customer_id = c.id
        `;
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('p.status = ?');
            params.push(status);
        }

        if (tanggal) {
            conditions.push('p.tanggal_pesan = ?');
            params.push(tanggal);
        }

        if (search) {
            conditions.push('(p.nomor_pesanan LIKE ? OR c.nama LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/transaksi/:id
 * Mengambil detail pesanan beserta item-itemnya
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil Header
        const [pesananRows] = await db.execute(`
            SELECT p.*, c.nama as nama_customer, c.no_hp
            FROM pesanan p
            JOIN customer c ON p.customer_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (pesananRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }

        // Ambil Detail Item
        const [items] = await db.execute('SELECT * FROM pesanan_detail WHERE pesanan_id = ?', [id]);

        res.json({ success: true, data: { ...pesananRows[0], items } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/transaksi
 * Membuat pesanan baru
 * Body: { customer_id, tanggal_ambil, jam_ambil, jenis_bayar, dp, items: [{ produk_id, qty }] }
 */
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { customer_id, tanggal_ambil, jam_ambil, jenis_bayar, dp, items } = req.body;

        // Validasi Input
        if (!customer_id) return res.status(400).json({ success: false, message: 'Customer wajib dipilih' });
        if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Item pesanan kosong' });
        if (!jenis_bayar) return res.status(400).json({ success: false, message: 'Jenis pembayaran wajib dipilih' });

        // Mulai Transaksi Database
        await connection.beginTransaction();

        const nomor_pesanan = await generateNomorPesanan(connection);
        const today = new Date().toISOString().split('T')[0];
        let total_pesanan = 0;

        // Hitung total dulu & validasi stok/produk
        const detailItems = [];
        for (const item of items) {
            const [produkRows] = await connection.execute('SELECT * FROM produk WHERE id = ?', [item.produk_id]);
            if (produkRows.length === 0) throw new Error(`Produk ID ${item.produk_id} tidak ditemukan`);
            const produk = produkRows[0];

            const subtotal = produk.harga * item.qty;
            total_pesanan += subtotal;

            detailItems.push({
                produk_id: produk.id,
                nama_produk: produk.nama_produk,
                harga: produk.harga,
                qty: item.qty,
                subtotal
            });
        }

        // Validasi DP
        let finalDp = parseFloat(dp || 0);
        if (jenis_bayar === 'LUNAS') {
            finalDp = total_pesanan;
        } else if (jenis_bayar === 'DP') {
            if (finalDp >= total_pesanan) throw new Error('Nominal DP tidak boleh melebihi total pesanan');
            if (finalDp < (total_pesanan * 0.1)) throw new Error('DP minimal 10% dari total');
        }

        const sisa_bayar = total_pesanan - finalDp;

        // Insert Header
        const [insertHeader] = await connection.execute(`
            INSERT INTO pesanan (
                nomor_pesanan, customer_id, tanggal_pesan, tanggal_ambil, jam_ambil, 
                status, jenis_bayar, total, dp, sisa_bayar
            ) VALUES (?, ?, ?, ?, ?, 'BARU', ?, ?, ?, ?)
        `, [
            nomor_pesanan, customer_id, today, tanggal_ambil, jam_ambil,
            jenis_bayar, total_pesanan, finalDp, sisa_bayar
        ]);

        const pesananId = insertHeader.insertId;

        // Insert Detail
        for (const det of detailItems) {
            await connection.execute(`
                INSERT INTO pesanan_detail (pesanan_id, produk_id, nama_produk, harga, qty, subtotal)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [pesananId, det.produk_id, det.nama_produk, det.harga, det.qty, det.subtotal]);
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dibuat',
            data: { id: pesananId, nomor_pesanan }
        });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

/**
 * PUT /api/transaksi/:id/status
 * Update status pesanan
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatus = ['BARU', 'DIPROSES', 'SIAP DIAMBIL', 'SELESAI', 'DIBATALKAN'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid' });
        }

        const [result] = await db.execute('UPDATE pesanan SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }

        res.json({ success: true, message: 'Status pesanan diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
