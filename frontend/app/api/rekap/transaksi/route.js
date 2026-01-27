import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tanggal = searchParams.get('tanggal');

        if (!tanggal) {
            return NextResponse.json({ success: false, message: 'Parameter tanggal wajib diisi' }, { status: 400 });
        }

        // 1. Get Summary per Status
        const [statusRows] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM pesanan 
            WHERE DATE(tanggal_pesan) = ? 
            GROUP BY status
        `, [tanggal]);

        // 2. Get Financial Summary (exclude DIBATALKAN)
        const [financialRows] = await pool.query(`
            SELECT 
                COUNT(*) as total_transaksi,
                COALESCE(SUM(total), 0) as grand_total,
                COALESCE(SUM(dp), 0) as total_dp,
                COALESCE(SUM(sisa_bayar), 0) as total_sisa
            FROM pesanan 
            WHERE DATE(tanggal_pesan) = ? 
            AND status != 'DIBATALKAN'
        `, [tanggal]);

        const financial = financialRows[0];

        // Format status data into object
        const statusSummary = {
            BARU: 0,
            DIPROSES: 0,
            SIAP_DIAMBIL: 0,
            SELESAI: 0,
            DIBATALKAN: 0
        };

        statusRows.forEach(row => {
            // Normalize status key (replace spaces with _)
            const key = row.status.replace(' ', '_');
            if (statusSummary[key] !== undefined) {
                statusSummary[key] = row.count;
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                status_summary: statusSummary,
                financial_summary: financial
            }
        });

    } catch (error) {
        console.error('Error fetching rekap transaksi:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
