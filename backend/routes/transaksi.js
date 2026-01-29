/**
 * Route untuk Modul Transaksi Pesanan (Versi MySQL)
 * Endpoint: /api/transaksi
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Helper: Generate Nomor Pesanan
 */
async function generateNomorPesanan(connection) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;
    const prefix = `ORD-${dateStr}-`;

    const [rows] = await connection.query(
        'SELECT nomor_pesanan FROM pesanan WHERE nomor_pesanan LIKE ? ORDER BY id DESC LIMIT 1',
        [`${prefix}%`]
    );

    let sequence = 1;
    if (rows.length > 0) {
        const lastSeq = parseInt(rows[0].nomor_pesanan.split('-').pop());
        sequence = lastSeq + 1;
    }

    return `${prefix}${String(sequence).padStart(3, '0')}`;
}

/**
 * GET /api/transaksi
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
            conditions.push('DATE(p.tanggal_pesan) = ?');
            params.push(tanggal);
        }
        if (search) {
            conditions.push('(LOWER(p.nomor_pesanan) LIKE LOWER(?) OR LOWER(c.nama) LIKE LOWER(?) OR LOWER(c.no_hp) LIKE LOWER(?))');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil Header
        const [pesanan] = await db.query(`
            SELECT p.*, c.nama as nama_customer, c.no_hp
            FROM pesanan p
            JOIN customer c ON p.customer_id = c.id
            WHERE p.id = ?
        `, [id]);

        if (pesanan.length === 0) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }

        // Ambil Detail
        const [items] = await db.query('SELECT * FROM pesanan_detail WHERE pesanan_id = ?', [id]);

        res.json({ success: true, data: { ...pesanan[0], items } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/transaksi
 * Create Order with Transaction
 */
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { customer_id, tanggal_ambil, jam_ambil, jenis_bayar, dp, items } = req.body;

        if (!customer_id) throw new Error('Customer wajib dipilih');
        if (!items || items.length === 0) throw new Error('Item pesanan kosong');
        if (!jenis_bayar) throw new Error('Jenis pembayaran wajib dipilih');

        await connection.beginTransaction();

        const nomor_pesanan = await generateNomorPesanan(connection);
        const today = new Date().toISOString().split('T')[0];
        let total_pesanan = 0;
        const detailItems = [];

        // Validasi dan hitung total
        for (const item of items) {
            const [prodRows] = await connection.query('SELECT * FROM produk WHERE id = ?', [item.produk_id]);
            if (prodRows.length === 0) throw new Error(`Produk ID ${item.produk_id} tidak ditemukan`);

            const produk = prodRows[0];
            const subtotal = Number(produk.harga) * Number(item.qty);
            total_pesanan += subtotal;

            detailItems.push({
                produk_id: produk.id,
                nama_produk: produk.nama_produk,
                harga: produk.harga,
                qty: item.qty,
                subtotal
            });
        }

        let finalDp = Number(dp || 0);
        if (jenis_bayar === 'LUNAS') {
            finalDp = total_pesanan;
        } else if (jenis_bayar === 'DP') {
            if (finalDp >= total_pesanan) throw new Error('Nominal DP tidak boleh melebihi total pesanan');
            // if (finalDp < (total_pesanan * 0.1)) throw new Error('DP minimal 10% dari total');
        }

        const sisa_bayar = total_pesanan - finalDp;

        // Insert Header
        const [resultHeader] = await connection.query(`
            INSERT INTO pesanan (
                nomor_pesanan, customer_id, tanggal_pesan, tanggal_ambil, jam_ambil, 
                status, jenis_bayar, total, dp, sisa_bayar
            ) VALUES (?, ?, ?, ?, ?, 'BARU', ?, ?, ?, ?)
        `, [
            nomor_pesanan, customer_id, today, tanggal_ambil, jam_ambil,
            jenis_bayar, total_pesanan, finalDp, sisa_bayar
        ]);

        const pesananId = resultHeader.insertId;

        // Insert Details
        if (detailItems.length > 0) {
            const values = detailItems.map(item => [
                pesananId, item.produk_id, item.nama_produk, item.harga, item.qty, item.subtotal
            ]);
            await connection.query(
                'INSERT INTO pesanan_detail (pesanan_id, produk_id, nama_produk, harga, qty, subtotal) VALUES ?',
                [values]
            );
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
 */
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatus = ['BARU', 'DIPROSES', 'SIAP DIAMBIL', 'SELESAI', 'DIBATALKAN'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: 'Status tidak valid' });
        }

        const [result] = await db.query('UPDATE pesanan SET status = ? WHERE id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }

        res.json({ success: true, message: 'Status pesanan diperbarui' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
