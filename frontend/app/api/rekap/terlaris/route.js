import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!startDate || !endDate) {
            return NextResponse.json({ success: false, message: 'Parameter startDate dan endDate wajib diisi' }, { status: 400 });
        }

        const [rows] = await pool.query(`
            SELECT 
                pd.nama_produk,
                COALESCE(SUM(pd.qty), 0) as total_qty,
                COALESCE(SUM(pd.subtotal), 0) as total_pendapatan,
                COUNT(pd.id) as frekuensi_transaksi
            FROM pesanan_detail pd
            JOIN pesanan p ON pd.pesanan_id = p.id
            WHERE 
                DATE(p.tanggal_pesan) BETWEEN ? AND ?
                AND p.status != 'DIBATALKAN'
            GROUP BY pd.nama_produk
            ORDER BY total_qty DESC
            LIMIT ?
        `, [startDate, endDate, limit]);

        return NextResponse.json({
            success: true,
            period: { from: startDate, to: endDate },
            data: rows
        });

    } catch (error) {
        console.error('Error fetching produk terlaris:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
