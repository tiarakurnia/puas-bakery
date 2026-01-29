/**
 * Route untuk Pelunasan Piutang
 * Endpoint: /api/pelunasan
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/pelunasan
 * Daftar pesanan dengan piutang (sisa_bayar > 0)
 * Termasuk pesanan backdate yang belum lunas
 */
router.get('/', async (req, res) => {
    try {
        const { customer, tanggal } = req.query;
        let query = `
            SELECT 
                p.*,
                c.nama as nama_customer,
                c.no_hp
            FROM pesanan p
            JOIN customer c ON p.customer_id = c.id
            WHERE p.sisa_bayar > 0
            AND p.status != 'DIBATALKAN'
        `;
        const params = [];

        if (customer) {
            query += ' AND (LOWER(c.nama) LIKE LOWER(?) OR c.no_hp LIKE ?)';
            params.push(`%${customer}%`, `%${customer}%`);
        }

        if (tanggal) {
            query += ' AND DATE(p.tanggal_ambil) = ?';
            params.push(tanggal);
        }

        query += ' ORDER BY p.tanggal_ambil, p.jam_ambil';

        const [rows] = await db.query(query, params);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * PUT /api/pelunasan/:id
 * Melunasi pesanan (update pembayaran)
 */
router.put('/:id', async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const { nominal, keterangan } = req.body;

        await connection.beginTransaction();

        // Get pesanan data
        const [pesanan] = await connection.query('SELECT * FROM pesanan WHERE id = ?', [id]);
        if (pesanan.length === 0) {
            throw new Error('Pesanan tidak ditemukan');
        }

        const order = pesanan[0];
        const nominalBayar = parseFloat(nominal);

        if (nominalBayar <= 0) {
            throw new Error('Nominal pembayaran harus lebih dari 0');
        }

        if (nominalBayar > order.sisa_bayar) {
            throw new Error(`Nominal tidak boleh melebihi sisa bayar (Rp ${order.sisa_bayar.toLocaleString('id-ID')})`);
        }

        // Update pesanan
        const newDp = parseFloat(order.dp) + nominalBayar;
        const newSisaBayar = parseFloat(order.sisa_bayar) - nominalBayar;
        const newJenisBayar = newSisaBayar === 0 ? 'LUNAS' : order.jenis_bayar;

        await connection.query(
            'UPDATE pesanan SET dp = ?, sisa_bayar = ?, jenis_bayar = ? WHERE id = ?',
            [newDp, newSisaBayar, newJenisBayar, id]
        );

        // Insert ke history pembayaran
        await connection.query(
            'INSERT INTO history_pembayaran (pesanan_id, nominal, keterangan) VALUES (?, ?, ?)',
            [id, nominalBayar, keterangan || 'Pelunasan piutang']
        );

        await connection.commit();

        res.json({
            success: true,
            message: newSisaBayar === 0 ? 'Pesanan berhasil dilunasi' : 'Pembayaran berhasil dicatat',
            data: {
                dp_baru: newDp,
                sisa_bayar_baru: newSisaBayar,
                status_bayar: newJenisBayar
            }
        });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
});

/**
 * GET /api/pelunasan/history/:pesanan_id
 * Riwayat pembayaran pesanan
 */
router.get('/history/:pesanan_id', async (req, res) => {
    try {
        const { pesanan_id } = req.params;

        const [history] = await db.query(`
            SELECT * FROM history_pembayaran
            WHERE pesanan_id = ?
            ORDER BY created_at DESC
        `, [pesanan_id]);

        res.json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
