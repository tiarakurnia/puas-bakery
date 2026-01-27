/**
 * Route untuk Modul Produk
 * Endpoint: /api/produk
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/produk
 * Mengambil semua produk yang aktif
 * Query params: search (opsional) untuk pencarian berdasarkan nama
 */
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM produk WHERE is_active = 1';
        const params = [];

        if (search) {
            query += ' AND nama_produk LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY nama_produk ASC';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/produk/:id
 * Mengambil satu produk berdasarkan ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM produk WHERE id = ? AND is_active = 1', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/produk
 * Menambah produk baru
 * Body: { nama_produk, harga, satuan }
 */
router.post('/', async (req, res) => {
    try {
        const { nama_produk, harga, satuan = 'pcs' } = req.body;

        // Validasi: nama produk wajib diisi
        if (!nama_produk || nama_produk.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
        }

        // Validasi: harga harus lebih dari 0
        if (!harga || harga <= 0) {
            return res.status(400).json({ success: false, message: 'Harga harus lebih dari 0' });
        }

        // Cek apakah nama produk sudah ada
        const [existing] = await db.execute('SELECT id FROM produk WHERE nama_produk = ? AND is_active = 1', [nama_produk.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Nama produk sudah ada' });
        }

        const [result] = await db.execute(
            'INSERT INTO produk (nama_produk, harga, satuan) VALUES (?, ?, ?)',
            [nama_produk.trim(), harga, satuan]
        );

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan',
            data: { id: result.insertId }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /api/produk/:id
 * Mengubah data produk
 * Body: { nama_produk, harga, satuan }
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_produk, harga, satuan } = req.body;

        // Cek apakah produk ada
        const [existing] = await db.execute('SELECT * FROM produk WHERE id = ? AND is_active = 1', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        // Validasi: nama produk wajib diisi
        if (!nama_produk || nama_produk.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
        }

        // Validasi: harga harus lebih dari 0
        if (!harga || harga <= 0) {
            return res.status(400).json({ success: false, message: 'Harga harus lebih dari 0' });
        }

        // Cek apakah nama produk sudah dipakai produk lain
        const [duplicate] = await db.execute(
            'SELECT id FROM produk WHERE nama_produk = ? AND id != ? AND is_active = 1',
            [nama_produk.trim(), id]
        );
        if (duplicate.length > 0) {
            return res.status(400).json({ success: false, message: 'Nama produk sudah digunakan' });
        }

        await db.execute(
            'UPDATE produk SET nama_produk = ?, harga = ?, satuan = ?, updated_at = NOW() WHERE id = ?',
            [nama_produk.trim(), harga, satuan, id]
        );

        res.json({ success: true, message: 'Produk berhasil diubah' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/produk/:id
 * Menghapus produk (soft delete)
 * Rule: Produk tidak boleh dihapus jika sudah pernah dipakai di pesanan
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah produk ada
        const [existing] = await db.execute('SELECT * FROM produk WHERE id = ? AND is_active = 1', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        // Cek apakah produk pernah dipakai di pesanan
        const [usedInOrder] = await db.execute('SELECT id FROM pesanan_detail WHERE produk_id = ?', [id]);
        if (usedInOrder.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Produk tidak dapat dihapus karena sudah pernah digunakan dalam pesanan'
            });
        }

        // Soft delete
        await db.execute('UPDATE produk SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);

        res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
