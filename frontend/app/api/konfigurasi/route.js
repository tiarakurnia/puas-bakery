import pool from '../../../lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/konfigurasi
 * Mengambil konfigurasi toko
 */
export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM konfigurasi LIMIT 1');

        if (rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Konfigurasi belum diatur'
            }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: rows[0] });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}

/**
 * PUT /api/konfigurasi
 * Update konfigurasi toko
 */
export async function PUT(request) {
    try {
        const body = await request.json();
        const { nama_toko, alamat_toko, telepon_toko, footer_struk } = body;

        // Validasi
        if (!nama_toko || nama_toko.trim() === '') {
            return NextResponse.json({
                success: false,
                message: 'Nama toko wajib diisi'
            }, { status: 400 });
        }

        // Cek apakah sudah ada konfigurasi
        const [existing] = await pool.query('SELECT id FROM konfigurasi LIMIT 1');

        if (existing.length === 0) {
            // Insert baru
            await pool.query(
                'INSERT INTO konfigurasi (nama_toko, alamat_toko, telepon_toko, footer_struk) VALUES (?, ?, ?, ?)',
                [nama_toko, alamat_toko, telepon_toko, footer_struk || 'Terima Kasih Atas Pesanannya!']
            );
        } else {
            // Update existing
            await pool.query(
                'UPDATE konfigurasi SET nama_toko = ?, alamat_toko = ?, telepon_toko = ?, footer_struk = ? WHERE id = ?',
                [nama_toko, alamat_toko, telepon_toko, footer_struk || 'Terima Kasih Atas Pesanannya!', existing[0].id]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Konfigurasi berhasil disimpan'
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}
