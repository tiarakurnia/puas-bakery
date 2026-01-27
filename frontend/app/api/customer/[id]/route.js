import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const [rows] = await pool.query('SELECT * FROM customer WHERE id = ?', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Customer tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { nama, no_hp, alamat, email } = body;

        const [existing] = await pool.query('SELECT id FROM customer WHERE id = ?', [id]);
        if (existing.length === 0) {
            return NextResponse.json({ success: false, message: 'Customer tidak ditemukan' }, { status: 404 });
        }

        if (!nama || nama.trim() === '') {
            return NextResponse.json({ success: false, message: 'Nama customer wajib diisi' }, { status: 400 });
        }

        await pool.query(
            'UPDATE customer SET nama = ?, no_hp = ?, alamat = ?, email = ?, updated_at = NOW() WHERE id = ?',
            [nama.trim(), no_hp, alamat, email, id]
        );

        return NextResponse.json({ success: true, message: 'Data customer berhasil diubah' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        const [existing] = await pool.query('SELECT id FROM customer WHERE id = ?', [id]);
        if (existing.length === 0) {
            return NextResponse.json({ success: false, message: 'Customer tidak ditemukan' }, { status: 404 });
        }

        // Cek pesanan aktif
        const [activeOrder] = await pool.query(`
        SELECT id FROM pesanan 
        WHERE customer_id = ? AND status NOT IN ('SELESAI', 'DIBATALKAN')
    `, [id]);

        if (activeOrder.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Customer tidak dapat dihapus karena masih memiliki pesanan aktif'
            }, { status: 400 });
        }

        await pool.query('DELETE FROM customer WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Customer berhasil dihapus' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
