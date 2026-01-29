/**
 * Route untuk Modul Produk (Versi MySQL)
 * Endpoint: /api/produk
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/produk
 */
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM produk WHERE is_active = 1';
        const params = [];

        if (search) {
            query += ' AND (LOWER(nama_produk) LIKE LOWER(?) OR LOWER(satuan) LIKE LOWER(?))';
            params.push(`%${search}%`, `%${search}%`);
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
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM produk WHERE id = ? AND is_active = 1', [id]);

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
 */
router.post('/', async (req, res) => {
    try {
        const { nama_produk, harga, satuan = 'pcs' } = req.body;

        if (!nama_produk || nama_produk.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
        }
        if (!harga || harga <= 0) {
            return res.status(400).json({ success: false, message: 'Harga harus lebih dari 0' });
        }

        // Cek duplikasi
        const [existing] = await db.query('SELECT id FROM produk WHERE nama_produk = ? AND is_active = 1', [nama_produk.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Nama produk sudah ada' });
        }

        const [result] = await db.query(
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
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_produk, harga, satuan } = req.body;

        const [existing] = await db.query('SELECT id FROM produk WHERE id = ? AND is_active = 1', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        if (!nama_produk || nama_produk.trim() === '') {
            return res.status(400).json({ success: false, message: 'Nama produk wajib diisi' });
        }
        if (!harga || harga <= 0) {
            return res.status(400).json({ success: false, message: 'Harga harus lebih dari 0' });
        }

        const [duplicate] = await db.query(
            'SELECT id FROM produk WHERE nama_produk = ? AND id != ? AND is_active = 1',
            [nama_produk.trim(), id]
        );
        if (duplicate.length > 0) {
            return res.status(400).json({ success: false, message: 'Nama produk sudah digunakan' });
        }

        await db.query(
            'UPDATE produk SET nama_produk = ?, harga = ?, satuan = ? WHERE id = ?',
            [nama_produk.trim(), harga, satuan, id]
        );

        res.json({ success: true, message: 'Produk berhasil diubah' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/produk/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT id FROM produk WHERE id = ? AND is_active = 1', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        const [usedInOrder] = await db.query('SELECT id FROM pesanan_detail WHERE produk_id = ?', [id]);
        if (usedInOrder.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Produk tidak dapat dihapus karena sudah pernah digunakan dalam pesanan'
            });
        }

        await db.query('UPDATE produk SET is_active = 0 WHERE id = ?', [id]);

        res.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
