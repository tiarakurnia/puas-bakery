import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = 'SELECT * FROM produk WHERE is_active = 1';
        const params = [];

        if (search) {
            query += ' AND (LOWER(nama_produk) LIKE LOWER(?) OR LOWER(satuan) LIKE LOWER(?))';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY nama_produk ASC';

        const [rows] = await pool.query(query, params);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { nama_produk, harga, satuan = 'pcs' } = body;

        if (!nama_produk || nama_produk.trim() === '') {
            return NextResponse.json({ success: false, message: 'Nama produk wajib diisi' }, { status: 400 });
        }
        const hargaNum = parseFloat(harga);
        if (!hargaNum || hargaNum <= 0) {
            return NextResponse.json({ success: false, message: 'Harga harus lebih dari 0' }, { status: 400 });
        }

        // Cek duplikasi
        const [existing] = await pool.query('SELECT id FROM produk WHERE nama_produk = ? AND is_active = 1', [nama_produk.trim()]);
        if (existing.length > 0) {
            return NextResponse.json({ success: false, message: 'Nama produk sudah ada' }, { status: 400 });
        }

        const [result] = await pool.query(
            'INSERT INTO produk (nama_produk, harga, satuan) VALUES (?, ?, ?)',
            [nama_produk.trim(), hargaNum, satuan]
        );

        return NextResponse.json({
            success: true,
            message: 'Produk berhasil ditambahkan',
            data: { id: result.insertId }
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
