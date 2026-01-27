import pool from '../../../../../lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { status } = body;
        const allowedStatus = ['BARU', 'DIPROSES', 'SIAP DIAMBIL', 'SELESAI', 'DIBATALKAN'];

        if (!allowedStatus.includes(status)) {
            return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 });
        }

        const [result] = await pool.query('UPDATE pesanan SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Status pesanan diperbarui' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
