'use client';

import { useState, useEffect } from 'react';
import styles from '../rekap.module.css';

export default function ProdukTerlarisPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1); // Awal bulan ini

    const [startDate, setStartDate] = useState(firstDay.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/rekap/terlaris?startDate=${startDate}&endDate=${endDate}&limit=10`);
            const result = await res.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Gagal mengambil data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return index + 1;
    };

    return (
        <div className={styles.card}>
            <div className={styles.filterBar}>
                <div>
                    <label style={{ marginRight: '0.5rem' }}>Dari:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className={styles.input}
                    />
                </div>
                <div>
                    <label style={{ marginRight: '0.5rem' }}>Sampai:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className={styles.input}
                    />
                </div>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</p>
            ) : data.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Tidak ada transaksi pada periode ini.
                </p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                            <th>Nama Produk</th>
                            <th style={{ textAlign: 'right' }}>Total Qty (pcs)</th>
                            <th style={{ textAlign: 'center' }}>Frekuensi Order</th>
                            <th style={{ textAlign: 'right' }}>Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index} style={{
                                background: index < 3 ? '#fffbeb' : 'transparent',
                                borderBottom: '1px solid #f3f4f6'
                            }}>
                                <td style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                    {getRankIcon(index)}
                                </td>
                                <td style={{ fontWeight: '500' }}>{item.nama_produk}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#059669' }}>
                                    {parseInt(item.total_qty).toLocaleString('id-ID')}
                                </td>
                                <td style={{ textAlign: 'center', color: '#6b7280' }}>
                                    {item.frekuensi_transaksi}x
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    Rp {parseInt(item.total_pendapatan).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
