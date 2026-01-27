'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../transaksi.module.css';

export default function TransaksiPage() {
    const [transaksi, setTransaksi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', search: '' });

    useEffect(() => {
        fetchTransaksi();
    }, [filter]);

    const fetchTransaksi = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.search) params.append('search', filter.search);

            const res = await fetch(`http://localhost:3001/api/transaksi?${params.toString()}`);
            const result = await res.json();
            if (result.success) {
                setTransaksi(result.data);
            }
        } catch (error) {
            console.error('Gagal mengambil data transaksi:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'BARU': return styles.statusBaru;
            case 'DIPROSES': return styles.statusProses;
            case 'SIAP DIAMBIL': return styles.statusSiap;
            case 'SELESAI': return styles.statusSelesai;
            case 'DIBATALKAN': return styles.statusBatal;
            default: return '';
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <header className={styles.topBar}>
                <h1 style={{ fontSize: '1.8rem', color: '#111827' }}>🛒 Daftar Transaksi</h1>
                <Link href="/transaksi/baru"
                    style={{
                        background: '#d97706',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: '600'
                    }}>
                    + Buat Pesanan Baru
                </Link>
            </header>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Cari No Pesanan / Customer..."
                    style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', flex: 1 }}
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
                <select
                    style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                >
                    <option value="">Semua Status</option>
                    <option value="BARU">Baru</option>
                    <option value="DIPROSES">Diproses</option>
                    <option value="SIAP DIAMBIL">Siap Diambil</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                </select>
            </div>

            {loading ? (
                <p>Memuat data...</p>
            ) : (
                <div className={styles.orderGrid}>
                    {transaksi.length > 0 ? (
                        transaksi.map((item) => (
                            <div key={item.id} className={styles.orderCard}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.orderDate}>{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <h3 className={styles.customerName}>{item.nama_customer}</h3>
                                <div style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.5rem' }}>
                                    No: {item.nomor_pesanan}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                                    Ambil: {item.jam_ambil} • {new Date(item.tanggal_ambil).toLocaleDateString('id-ID')}
                                </div>
                                <div className={styles.orderTotal}>
                                    Rp {parseFloat(item.total).toLocaleString('id-ID')}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            Belum ada transaksi. Silakan buat pesanan baru.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
