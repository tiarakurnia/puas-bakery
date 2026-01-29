/**
 * Route untuk Modul Customer
 * Endpoint: /api/customer
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/customer
 * Mengambil semua data customer
 * Query params: search (opsional) untuk pencarian berdasarkan nama atau no HP
 */
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM customer';
        const params = [];

        if (search) {
            query += ' WHERE LOWER(nama) LIKE LOWER(?) OR LOWER(no_hp) LIKE LOWER(?) OR LOWER(alamat) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY nama ASC';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/customer/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM customer WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/customer
 * Menambah customer baru
 */
router.post('/', async (req, res) => {
    try {
        const { nama, no_hp, alamat, email, catatan, tag } = req.body;

        // Validasi: nama wajib diisi
        if (!nama) {
            return res.status(400).json({ success: false, message: 'Nama customer wajib diisi' });
        }

        const [result] = await db.query(
            'INSERT INTO customer (nama, no_hp, alamat, email, catatan, tag) VALUES (?, ?, ?, ?, ?, ?)',
            [nama, no_hp || null, alamat || null, email || null, catatan || null, tag || null]
        );

        res.status(201).json({
            success: true,
            message: 'Customer berhasil ditambahkan',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /api/customer/:id
 * Mengubah data customer
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, no_hp, alamat, email, catatan, tag } = req.body;

        const [existing] = await db.execute('SELECT id FROM customer WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });
        }

        if (!nama) {
            return res.status(400).json({ success: false, message: 'Nama customer wajib diisi' });
        }

        await db.execute(
            'UPDATE customer SET nama = ?, no_hp = ?, alamat = ?, email = ?, catatan = ?, tag = ? WHERE id = ?',
            [nama, no_hp || null, alamat || null, email || null, catatan || null, tag || null, id]
        );

        res.json({ success: true, message: 'Data customer berhasil diubah' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/customer/:id
 * Menghapus data customer
 * Rule: Customer tidak boleh dihapus jika masih memiliki pesanan aktif
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.execute('SELECT id FROM customer WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Customer tidak ditemukan' });
        }

        // Cek pesanan aktif (status bukan SELESAI atau DIBATALKAN)
        const [activeOrder] = await db.execute(`
            SELECT id FROM pesanan 
            WHERE customer_id = ? AND status NOT IN ('SELESAI', 'DIBATALKAN')
        `, [id]);

        if (activeOrder.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Customer tidak dapat dihapus karena masih memiliki pesanan aktif'
            });
        }

        await db.execute('DELETE FROM customer WHERE id = ?', [id]);

        res.json({ success: true, message: 'Customer berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/customer/:id/history
 * Riwayat pesanan customer
 */
router.get('/:id/history', async (req, res) => {
    try {
        const { id } = req.params;

        const [pesanan] = await db.query(`
            SELECT 
                p.*,
                COUNT(pd.id) as total_items
            FROM pesanan p
            LEFT JOIN pesanan_detail pd ON p.id = pd.pesanan_id
            WHERE p.customer_id = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `, [id]);

        res.json({ success: true, data: pesanan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
