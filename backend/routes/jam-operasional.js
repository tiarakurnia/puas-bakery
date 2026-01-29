/**
 * Route untuk Manajemen Jam Operasional
 * Endpoint: /api/jam-operasional
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/jam-operasional
 * Get setting jam operasional
 */
router.get('/', async (req, res) => {
    try {
        const [jamOperasional] = await db.query('SELECT * FROM jam_operasional ORDER BY FIELD(hari, "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu")');
        const [slotWaktu] = await db.query('SELECT * FROM slot_waktu WHERE is_aktif = 1 ORDER BY waktu');
        const [tanggalLibur] = await db.query('SELECT * FROM tanggal_libur ORDER BY tanggal');

        res.json({
            success: true,
            data: {
                jam_operasional: jamOperasional,
                slot_waktu: slotWaktu,
                tanggal_libur: tanggalLibur
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /api/jam-operasional/hari/:hari
 * Update jam operasional untuk hari tertentu
 */
router.put('/hari/:hari', async (req, res) => {
    try {
        const { hari } = req.params;
        const { jam_buka, jam_tutup, is_buka } = req.body;

        const [result] = await db.query(
            'UPDATE jam_operasional SET jam_buka = ?, jam_tutup = ?, is_buka = ? WHERE hari = ?',
            [jam_buka, jam_tutup, is_buka ? 1 : 0, hari]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Hari tidak ditemukan' });
        }

        res.json({ success: true, message: 'Jam operasional berhasil diupdate' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/jam-operasional/slot
 * Tambah slot waktu baru
 */
router.post('/slot', async (req, res) => {
    try {
        const { waktu } = req.body;

        const [result] = await db.query(
            'INSERT INTO slot_waktu (waktu) VALUES (?)',
            [waktu]
        );

        res.status(201).json({
            success: true,
            message: 'Slot waktu berhasil ditambahkan',
            data: { id: result.insertId, waktu }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Slot waktu sudah ada' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/jam-operasional/slot/:id
 * Hapus slot waktu
 */
router.delete('/slot/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM slot_waktu WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Slot waktu tidak ditemukan' });
        }

        res.json({ success: true, message: 'Slot waktu berhasil dihapus' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * POST /api/jam-operasional/libur
 * Tambah tanggal libur
 */
router.post('/libur', async (req, res) => {
    try {
        const { tanggal, keterangan } = req.body;

        const [result] = await db.query(
            'INSERT INTO tanggal_libur (tanggal, keterangan) VALUES (?, ?)',
            [tanggal, keterangan]
        );

        res.status(201).json({
            success: true,
            message: 'Tanggal libur berhasil ditambahkan',
            data: { id: result.insertId, tanggal, keterangan }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Tanggal libur sudah ada' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * DELETE /api/jam-operasional/libur/:id
 * Hapus tanggal libur
 */
router.delete('/libur/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query('DELETE FROM tanggal_libur WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Tanggal libur tidak ditemukan' });
        }

        res.json({ success: true, message: 'Tanggal libur berhasil dihapus' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

/**
 * GET /api/jam-operasional/validate
 * Validasi apakah tanggal/waktu tertentu available
 */
router.get('/validate', async (req, res) => {
    try {
        const { tanggal } = req.query;

        if (!tanggal) {
            return res.status(400).json({ success: false, message: 'Parameter tanggal wajib diisi' });
        }

        const date = new Date(tanggal);
        const hariNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const hari = hariNames[date.getDay()];

        // Cek jam operasional
        const [jamOps] = await db.query('SELECT * FROM jam_operasional WHERE hari = ?', [hari]);

        if (jamOps.length === 0 || !jamOps[0].is_buka) {
            return res.json({
                success: true,
                available: false,
                reason: `Toko tutup pada hari ${hari}`,
                jam_operasional: null
            });
        }

        // Cek tanggal libur
        const [libur] = await db.query('SELECT * FROM tanggal_libur WHERE tanggal = ?', [tanggal]);

        if (libur.length > 0) {
            return res.json({
                success: true,
                available: false,
                reason: `Tanggal libur: ${libur[0].keterangan || 'Hari libur'}`,
                jam_operasional: null
            });
        }

        res.json({
            success: true,
            available: true,
            reason: null,
            jam_operasional: jamOps[0]
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
