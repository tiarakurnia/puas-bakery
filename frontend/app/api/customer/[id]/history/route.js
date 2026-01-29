import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/customer/:id/history
 * Get customer order history
 */
export async function GET(request, context) {
    try {
        const { id } = await context.params;

        const [orders] = await pool.query(`
            SELECT 
                p.*,
                COUNT(pd.id) as total_items
            FROM pesanan p
            LEFT JOIN pesanan_detail pd ON p.id = pd.pesanan_id
            WHERE p.customer_id = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `, [id]);

        return NextResponse.json({ success: true, data: orders });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
