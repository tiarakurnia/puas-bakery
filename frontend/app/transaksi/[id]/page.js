'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../transaksi.module.css';

export default function DetailTransaksiPage() {
    const params = useParams();
    const router = useRouter();
    const [pesanan, setPesanan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/transaksi/${params.id}`);
            const result = await res.json();
            if (result.success) {
                setPesanan(result.data);
            } else {
                alert('Pesanan tidak ditemukan');
            }
        } catch (error) {
            console.error('Gagal detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBatalkan = async () => {
        if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Status akan berubah menjadi DIBATALKAN.')) return;

        try {
            const res = await fetch(`/api/transaksi/${params.id}`, {
                method: 'DELETE'
            });
            const result = await res.json();
            if (result.success) {
                alert('Pesanan berhasil dibatalkan');
                fetchData(); // Refresh data
            } else {
                alert('Gagal membatalkan: ' + result.message);
            }
        } catch (error) {
            alert('Terjadi kesalahan sistem');
        }
    };

    const formatRupiah = (val) => parseInt(val).toLocaleString('id-ID');
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
    if (!pesanan) return <div style={{ padding: '2rem', textAlign: 'center' }}>Data tidak ditemukan</div>;

    const isCancelled = pesanan.status === 'DIBATALKAN';
    const isCompleted = pesanan.status === 'SELESAI';

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    href="/transaksi"
                    className={styles.btnBack}
                    style={{
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        color: '#6b7280',
                        fontWeight: 500,
                        fontSize: '0.9rem'
                    }}>
                    ← Kembali ke List
                </Link>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', color: '#111827', margin: 0, lineHeight: 1.2 }}>
                            Pesanan #{pesanan.nomor_pesanan}
                        </h1>
                        <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                            Dibuat pada {new Date(pesanan.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                        </p>
                    </div>
                    <span className={`${styles.statusBadge} ${isCancelled ? styles.statusBatal : styles.statusBaru}`}
                        style={{ fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600 }}>
                        {pesanan.status}
                    </span>
                </div>
            </div>

            {/* Info Cards */}
            <div className={styles.summaryBox} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem', fontWeight: 600 }}>
                            Informasi Customer
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.5rem', fontSize: '1rem' }}>
                            <span style={{ color: '#6b7280' }}>Nama</span>
                            <span style={{ fontWeight: 600, color: '#111827' }}>: {pesanan.nama_customer}</span>

                            <span style={{ color: '#6b7280' }}>No HP</span>
                            <span style={{ fontWeight: 500, color: '#111827' }}>: {pesanan.no_hp || '-'}</span>
                        </div>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px dashed #e5e7eb', paddingBottom: '0.5rem', fontWeight: 600 }}>
                            Jadwal Pengambilan
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.5rem', fontSize: '1rem' }}>
                            <span style={{ color: '#6b7280' }}>Tanggal</span>
                            <span style={{ fontWeight: 600, color: '#111827' }}>: {formatDate(pesanan.tanggal_ambil)}</span>

                            <span style={{ color: '#6b7280' }}>Jam</span>
                            <span style={{ fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '0.1rem 0.5rem', borderRadius: '4px', width: 'fit-content' }}>
                                {pesanan.jam_ambil} WIB
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Table */}
            <div className={styles.summaryBox} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', padding: 0, marginBottom: '2rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h3 style={{ padding: '1.5rem 1.5rem 1rem', fontSize: '1.1rem', color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6' }}>
                    📦 Detail Item
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', textAlign: 'left', fontSize: '0.9rem', color: '#6b7280' }}>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>PRODUK</th>
                            <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>QTY</th>
                            <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>HARGA</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600 }}>SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.95rem' }}>
                        {pesanan.items.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '1rem 1.5rem', color: '#111827', fontWeight: 500 }}>{item.nama_produk}</td>
                                <td style={{ padding: '1rem', textAlign: 'center', color: '#4b5563' }}>{item.qty}</td>
                                <td style={{ padding: '1rem', textAlign: 'right', color: '#4b5563' }}>{formatRupiah(item.harga)}</td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{formatRupiah(item.subtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot style={{ background: '#fcfcfc' }}>
                        <tr>
                            <td colSpan={3} style={{ padding: '1.5rem 1rem 0.5rem', textAlign: 'right', color: '#6b7280' }}>Total Transaksi</td>
                            <td style={{ padding: '1.5rem 1.5rem 0.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: '#111827' }}>Rp {formatRupiah(pesanan.total)}</td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={{ padding: '0.5rem 1rem', textAlign: 'right', color: '#6b7280' }}>
                                Pembayaran ({pesanan.jenis_bayar})
                            </td>
                            <td style={{ padding: '0.5rem 1.5rem', textAlign: 'right', color: '#16a34a', fontWeight: 500 }}>
                                - Rp {formatRupiah(pesanan.dp)}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={{ padding: '0.5rem 1rem 1.5rem', textAlign: 'right', fontWeight: 600, color: '#111827' }}>Sisa Tagihan</td>
                            <td style={{ padding: '0.5rem 1.5rem 1.5rem', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: pesanan.sisa_bayar > 0 ? '#dc2626' : '#9ca3af' }}>
                                Rp {formatRupiah(pesanan.sisa_bayar)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px dashed #e5e7eb' }}>
                <Link
                    href={`/transaksi/${pesanan.id}/nota`}
                    className={styles.btn}
                    style={{
                        background: '#d97706',
                        color: 'white',
                        textDecoration: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                    🖨️ Cetak Nota
                </Link>

                {!isCancelled && !isCompleted && (
                    <>
                        <Link
                            href={`/transaksi/${pesanan.id}/edit`}
                            className={styles.btn}
                            style={{
                                background: 'white',
                                color: '#2563eb',
                                border: '1px solid #2563eb',
                                textDecoration: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                            ✏️ Edit Pesanan
                        </Link>
                        <button
                            onClick={handleBatalkan}
                            style={{
                                background: 'white',
                                color: '#dc2626',
                                border: '1px solid #dc2626',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginLeft: 'auto' // Push delete button to right
                            }}>
                            🚫 Batalkan
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
