import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = params;

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
