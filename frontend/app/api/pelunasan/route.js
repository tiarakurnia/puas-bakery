import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/pelunasan
 * Daftar pesanan dengan piutang (sisa_bayar > 0)
 * Termasuk pesanan backdate yang belum lunas
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const customer = searchParams.get('customer') || '';
        const tanggal = searchParams.get('tanggal') || '';

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

        query += ' ORDER BY p.tanggal_ambil DESC, p.jam_ambil';

        const [rows] = await pool.query(query, params);
        return NextResponse.json({ success: true, data: rows });
    } catch (error) {
        console.error('Pelunasan query error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
