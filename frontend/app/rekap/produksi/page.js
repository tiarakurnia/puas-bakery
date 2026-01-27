'use client';

import { useState, useEffect } from 'react';
import styles from '../rekap.module.css';

export default function RekapProduksiPage() {
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalQty, setTotalQty] = useState(0);

    useEffect(() => {
        fetchData();
    }, [tanggal]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/rekap/produksi?tanggal=${tanggal}`);
            const result = await res.json();

            if (result.success) {
                setData(result.data);
                // Hitung total
                const total = result.data.reduce((sum, item) => sum + item.total_qty, 0);
                setTotalQty(total);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className={styles.card}>
            <div className={styles.filterBar}>
                <label>Pilih Tanggal Pengambilan:</label>
                <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handlePrint} className={styles.btn} style={{ marginLeft: 'auto' }}>
                    🖨️ Cetak Rekap
                </button>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Memuat data...</p>
            ) : data.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Tidak ada jadwal produksi untuk tanggal ini.
                </p>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>No</th>
                                <th style={{ width: '30%' }}>Nama Produk</th>
                                <th style={{ width: '15%', textAlign: 'center' }}>Total Qty</th>
                                <th>Jadwal Pengambilan (Qty @ Jam)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td style={{ fontWeight: '500' }}>{item.nama_produk}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {item.total_qty}
                                    </td>
                                    <td>
                                        <div className={styles.schedule}>
                                            {item.jadwal.map((jadwal, idx) => (
                                                <span key={idx} className={styles.scheduleItem}>
                                                    {jadwal.qty} pcs @ {jadwal.jam.substring(0, 5)}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: '#f9fafb', fontWeight: 'bold' }}>
                                <td colSpan={2} style={{ textAlign: 'right' }}>Total Produksi Hari Ini:</td>
                                <td style={{ textAlign: 'center', fontSize: '1.2rem', color: '#047857' }}>
                                    {totalQty}
                                </td>
                                <td>pcs</td>
                            </tr>
                        </tfoot>
                    </table>
                </>
            )}
        </div>
    );
}
