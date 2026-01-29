import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const tanggal = searchParams.get('tanggal');
        const search = searchParams.get('search');

        if (!tanggal) {
            return NextResponse.json({ success: false, message: 'Parameter tanggal wajib diisi' }, { status: 400 });
        }

        // Query raw data: produk, jam, qty
        let query = `
            SELECT 
                pd.nama_produk,
                p.jam_ambil,
                SUM(pd.qty) as qty
            FROM pesanan_detail pd
            JOIN pesanan p ON pd.pesanan_id = p.id
            WHERE 
                DATE(p.tanggal_ambil) = ? 
                AND p.status != 'DIBATALKAN'
        `;
        const params = [tanggal];

        if (search) {
            query += ' AND LOWER(pd.nama_produk) LIKE LOWER(?)';
            params.push(`%${search}%`);
        }

        query += ' GROUP BY pd.nama_produk, p.jam_ambil ORDER BY pd.nama_produk ASC, p.jam_ambil ASC';

        const [rows] = await pool.query(query, params);

        // Process data formatting in Backend
        // Group by product name -> list of schedules
        const groupedData = {};

        rows.forEach(row => {
            if (!groupedData[row.nama_produk]) {
                groupedData[row.nama_produk] = {
                    nama_produk: row.nama_produk,
                    total_qty: 0,
                    jadwal: []
                };
            }

            // Add schedule
            groupedData[row.nama_produk].jadwal.push({
                jam: row.jam_ambil,
                qty: parseFloat(row.qty) // Ensure number
            });

            // Add to total
            groupedData[row.nama_produk].total_qty += parseFloat(row.qty);
        });

        // Convert object back to array
        const finalData = Object.values(groupedData);

        return NextResponse.json({ success: true, data: finalData });

    } catch (error) {
        console.error('Error fetching rekap produksi:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
