import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const [pesanan] = await pool.query(`
        SELECT p.*, c.nama as nama_customer, c.no_hp
        FROM pesanan p
        JOIN customer c ON p.customer_id = c.id
        WHERE p.id = ?
    `, [id]);

        if (pesanan.length === 0) {
            return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        const [items] = await pool.query('SELECT * FROM pesanan_detail WHERE pesanan_id = ?', [id]);

        return NextResponse.json({ success: true, data: { ...pesanan[0], items } });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { customer_id, tanggal_ambil, jam_ambil, jenis_bayar, dp, items } = body;

        // Calculate totals
        const total = items.reduce((sum, item) => sum + (item.harga * item.qty), 0);
        const nilai_dp = jenis_bayar === 'LUNAS' ? total : (parseFloat(dp) || 0);
        const sisa_bayar = Math.max(0, total - nilai_dp);

        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Update Header
            await connection.query(`
                UPDATE pesanan 
                SET customer_id = ?, tanggal_ambil = ?, jam_ambil = ?, jenis_bayar = ?, 
                    total = ?, dp = ?, sisa_bayar = ?, updated_at = NOW()
                WHERE id = ?
            `, [customer_id, tanggal_ambil, jam_ambil, jenis_bayar, total, nilai_dp, sisa_bayar, id]);

            // 2. Delete existing items
            await connection.query('DELETE FROM pesanan_detail WHERE pesanan_id = ?', [id]);

            // 3. Insert new items
            for (const item of items) {
                const subtotal = item.harga * item.qty;
                await connection.query(`
                    INSERT INTO pesanan_detail (pesanan_id, produk_id, nama_produk, harga, qty, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [id, item.produk_id, item.nama_produk, item.harga, item.qty, subtotal]);
            }

            await connection.commit();
            return NextResponse.json({ success: true, message: 'Pesanan berhasil diupdate' });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Membatalkan pesanan (Soft Delete / Update Status)
        await pool.query("UPDATE pesanan SET status = 'DIBATALKAN' WHERE id = ?", [id]);

        return NextResponse.json({ success: true, message: 'Pesanan berhasil dibatalkan' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
