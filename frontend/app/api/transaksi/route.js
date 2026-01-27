import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

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

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const tanggal = searchParams.get('tanggal');
        const search = searchParams.get('search');

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
            conditions.push('(p.nomor_pesanan LIKE ? OR c.nama LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows] = await pool.query(query, params);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    let connection;
    try {
        const body = await request.json();
        const { customer_id, tanggal_ambil, jam_ambil, jenis_bayar, dp, items } = body;

        // Validasi
        if (!customer_id) return NextResponse.json({ success: false, message: 'Customer wajib dipilih' }, { status: 400 });
        if (!items || items.length === 0) return NextResponse.json({ success: false, message: 'Item pesanan kosong' }, { status: 400 });
        if (!jenis_bayar) return NextResponse.json({ success: false, message: 'Jenis pembayaran wajib dipilih' }, { status: 400 });

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const nomor_pesanan = await generateNomorPesanan(connection);
        const today = new Date().toISOString().split('T')[0];
        let total_pesanan = 0;
        const detailItems = [];

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
        // Logika DP bisa disesuaikan lagi sesuai kebutuhan
        if (jenis_bayar === 'LUNAS') {
            finalDp = total_pesanan;
        } else if (jenis_bayar === 'DP') {
            if (finalDp >= total_pesanan) throw new Error('Nominal DP tidak boleh melebihi total pesanan');
        }

        const sisa_bayar = total_pesanan - finalDp;

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

        for (const det of detailItems) {
            await connection.query(`
            INSERT INTO pesanan_detail (pesanan_id, produk_id, nama_produk, harga, qty, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [pesananId, det.produk_id, det.nama_produk, det.harga, det.qty, det.subtotal]);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: 'Pesanan berhasil dibuat',
            data: { id: pesananId, nomor_pesanan }
        }, { status: 201 });

    } catch (error) {
        if (connection) await connection.rollback();
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    } finally {
        if (connection) connection.release();
    }
}
