import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

/**
 * PUT /api/pelunasan/:id
 * Melunasi pesanan (update pembayaran)
 */
export async function PUT(request, context) {
    const connection = await pool.getConnection();
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { nominal, keterangan } = body;

        await connection.beginTransaction();

        // Get pesanan data
        const [pesanan] = await connection.query('SELECT * FROM pesanan WHERE id = ?', [id]);
        if (pesanan.length === 0) {
            throw new Error('Pesanan tidak ditemukan');
        }

        const order = pesanan[0];
        const nominalBayar = parseFloat(nominal);

        if (nominalBayar <= 0) {
            throw new Error('Nominal pembayaran harus lebih dari 0');
        }

        if (nominalBayar > order.sisa_bayar) {
            throw new Error(`Nominal tidak boleh melebihi sisa bayar (Rp ${order.sisa_bayar.toLocaleString('id-ID')})`);
        }

        // Update pesanan
        const newDp = parseFloat(order.dp) + nominalBayar;
        const newSisaBayar = parseFloat(order.sisa_bayar) - nominalBayar;
        const newJenisBayar = newSisaBayar === 0 ? 'LUNAS' : order.jenis_bayar;

        await connection.query(
            'UPDATE pesanan SET dp = ?, sisa_bayar = ?, jenis_bayar = ? WHERE id = ?',
            [newDp, newSisaBayar, newJenisBayar, id]
        );

        // Insert ke history pembayaran (if table exists)
        try {
            await connection.query(
                'INSERT INTO history_pembayaran (pesanan_id, nominal, keterangan) VALUES (?, ?, ?)',
                [id, nominalBayar, keterangan || 'Pelunasan piutang']
            );
        } catch (err) {
            // Ignore if table doesn't exist yet
            console.log('History table might not exist:', err.message);
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: newSisaBayar === 0 ? 'Pesanan berhasil dilunasi' : 'Pembayaran berhasil dicatat',
            data: {
                dp_baru: newDp,
                sisa_bayar_baru: newSisaBayar,
                status_bayar: newJenisBayar
            }
        });
    } catch (error) {
        await connection.rollback();
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    } finally {
        connection.release();
    }
}

/**
 * GET /api/pelunasan/:id/history
 * Riwayat pembayaran pesanan
 */
export async function GET(request, context) {
    try {
        const { id } = await context.params;

        try {
            const [history] = await pool.query(`
                SELECT * FROM history_pembayaran
                WHERE pesanan_id = ?
                ORDER BY created_at DESC
            `, [id]);

            return NextResponse.json({ success: true, data: history });
        } catch (err) {
            // Table might not exist
            return NextResponse.json({ success: true, data: [] });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
