'use client';

import { useState, useEffect } from 'react';
import styles from '../rekap.module.css';

export default function RekapTransaksiPage() {
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [tanggal]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/rekap/transaksi?tanggal=${tanggal}`);
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

    const formatRupiah = (angka) => {
        return parseInt(angka).toLocaleString('id-ID');
    };

    return (
        <div>
            <div className={styles.card}>
                <div className={styles.filterBar} style={{ marginBottom: 0, border: 'none', background: 'transparent', padding: 0 }}>
                    <label>Filter Tanggal Pesan:</label>
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        className={styles.input}
                    />
                </div>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</p>
            ) : !data ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Gagal memuat visualisasi data.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Ringkasan Status */}
                    <div className={styles.card}>
                        <h3 className={styles.title} style={{ fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            📊 Ringkasan Pesanan
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                            <RowStatus label="Pesanan Baru" value={data.status_summary.BARU} color="#3b82f6" />
                            <RowStatus label="Sedang Diproses" value={data.status_summary.DIPROSES} color="#eab308" />
                            <RowStatus label="Siap Diambil" value={data.status_summary.SIAP_DIAMBIL} color="#10b981" />
                            <RowStatus label="Selesai" value={data.status_summary.SELESAI} color="#6b7280" />
                            <div style={{ borderTop: '1px dashed #ddd', margin: '0.5rem 0' }}></div>
                            <RowStatus label="Dibatalkan" value={data.status_summary.DIBATALKAN} color="#ef4444" />
                        </div>
                    </div>

                    {/* Ringkasan Keuangan */}
                    <div className={styles.card}>
                        <h3 className={styles.title} style={{ fontSize: '1.2rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                            💰 Ringkasan Keuangan
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                            <RowDuit label="Total Transaksi" value={data.financial_summary.grand_total} bold isTotal />
                            <RowDuit label="Uang Masuk (DP)" value={data.financial_summary.total_dp} />
                            <RowDuit label="Total Pelunasan" value={parseInt(data.financial_summary.grand_total) - parseInt(data.financial_summary.total_sisa)} />
                            <div style={{ borderTop: '1px dashed #ddd', margin: '0.25rem 0' }}></div>
                            <RowDuit label="Sisa Tagihan (Piutang)" value={data.financial_summary.total_sisa} color="#ef4444" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RowStatus({ label, value, color }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }}></span>
                {label}
            </span>
            <span style={{ fontWeight: 'bold' }}>{value}</span>
        </div>
    );
}

function RowDuit({ label, value, color = '#111827', bold = false, isTotal = false }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: isTotal ? '#000' : '#4b5563' }}>{label}</span>
            <span style={{
                fontWeight: bold ? 'bold' : 'normal',
                color: color,
                fontSize: isTotal ? '1.1rem' : '1rem'
            }}>
                Rp {parseInt(value).toLocaleString('id-ID')}
            </span>
        </div>
    );
}
