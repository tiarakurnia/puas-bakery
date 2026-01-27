import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = 'SELECT * FROM customer';
        const params = [];

        if (search) {
            query += ' WHERE nama LIKE ? OR no_hp LIKE ?';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY nama ASC';

        const [rows] = await pool.query(query, params);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { nama, no_hp, alamat, email } = body;

        // Validasi: nama wajib diisi
        if (!nama || nama.trim() === '') {
            return NextResponse.json({ success: false, message: 'Nama customer wajib diisi' }, { status: 400 });
        }

        const [result] = await pool.query(
            'INSERT INTO customer (nama, no_hp, alamat, email) VALUES (?, ?, ?, ?)',
            [nama.trim(), no_hp, alamat, email]
        );

        return NextResponse.json({
            success: true,
            message: 'Customer berhasil ditambahkan',
            data: { id: result.insertId }
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
