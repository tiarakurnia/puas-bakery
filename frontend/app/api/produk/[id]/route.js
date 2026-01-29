import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, context) {
    try {
        const { id } = await context.params;
        const [rows] = await pool.query('SELECT * FROM produk WHERE id = ? AND is_active = 1', [id]);

        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(request, context) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { nama_produk, harga, satuan } = body;

        const [existing] = await pool.query('SELECT id FROM produk WHERE id = ? AND is_active = 1', [id]);
        if (existing.length === 0) {
            return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 404 });
        }

        if (!nama_produk || nama_produk.trim() === '') {
            return NextResponse.json({ success: false, message: 'Nama produk wajib diisi' }, { status: 400 });
        }
        const hargaNum = parseFloat(harga);
        if (!hargaNum || hargaNum <= 0) {
            return NextResponse.json({ success: false, message: 'Harga harus lebih dari 0' }, { status: 400 });
        }

        const [duplicate] = await pool.query(
            'SELECT id FROM produk WHERE nama_produk = ? AND id != ? AND is_active = 1',
            [nama_produk.trim(), id]
        );
        if (duplicate.length > 0) {
            return NextResponse.json({ success: false, message: 'Nama produk sudah digunakan' }, { status: 400 });
        }

        await pool.query(
            'UPDATE produk SET nama_produk = ?, harga = ?, satuan = ?, updated_at = NOW() WHERE id = ?',
            [nama_produk.trim(), hargaNum, satuan, id]
        );

        return NextResponse.json({ success: true, message: 'Produk berhasil diubah' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const { id } = await context.params;

        const [existing] = await pool.query('SELECT id FROM produk WHERE id = ? AND is_active = 1', [id]);
        if (existing.length === 0) {
            return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 404 });
        }

        const [usedInOrder] = await pool.query('SELECT id FROM pesanan_detail WHERE produk_id = ?', [id]);
        if (usedInOrder.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Produk tidak dapat dihapus karena sudah pernah digunakan dalam pesanan'
            }, { status: 400 });
        }

        await pool.query('UPDATE produk SET is_active = 0, updated_at = NOW() WHERE id = ?', [id]);

        return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

