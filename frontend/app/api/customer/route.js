import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = 'SELECT * FROM customer';
        const params = [];

        if (search) {
            query += ' WHERE LOWER(nama) LIKE LOWER(?) OR LOWER(no_hp) LIKE LOWER(?) OR LOWER(alamat) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
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
        const { nama, no_hp, alamat, email, catatan, tag } = body;

        if (!nama || nama.trim() === '') {
            return NextResponse.json({ success: false, message: 'Nama customer wajib diisi' }, { status: 400 });
        }

        // Check if catatan column exists
        const [columns] = await pool.query("SHOW COLUMNS FROM customer LIKE 'catatan'");
        const hasCatatanColumn = columns.length > 0;

        let result;
        if (hasCatatanColumn) {
            // New version with catatan & tag
            [result] = await pool.query(
                'INSERT INTO customer (nama, no_hp, alamat, email, catatan, tag) VALUES (?, ?, ?, ?, ?, ?)',
                [nama.trim(), no_hp, alamat, email, catatan, tag]
            );
        } else {
            // Old version without catatan & tag
            [result] = await pool.query(
                'INSERT INTO customer (nama, no_hp, alamat, email) VALUES (?, ?, ?, ?)',
                [nama.trim(), no_hp, alamat, email]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Customer berhasil ditambahkan',
            data: { id: result.insertId }
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
