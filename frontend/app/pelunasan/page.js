'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './pelunasan.module.css';

export default function PelunasanPage() {
    const [piutang, setPiutang] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCustomer, setFilterCustomer] = useState('');
    const [filterTanggal, setFilterTanggal] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedPesanan, setSelectedPesanan] = useState(null);
    const [nominalBayar, setNominalBayar] = useState('');
    const [keterangan, setKeterangan] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPiutang();
    }, [filterCustomer, filterTanggal]);

    const fetchPiutang = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterCustomer) params.append('customer', filterCustomer);
            if (filterTanggal) params.append('tanggal', filterTanggal);

            const res = await fetch(`/api/pelunasan?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setPiutang(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLunasi = (pesanan) => {
        setSelectedPesanan(pesanan);
        setNominalBayar(pesanan.sisa_bayar);
        setKeterangan('Pelunasan piutang');
        setShowModal(true);
    };

    const submitPelunasan = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/pelunasan/${selectedPesanan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nominal: parseFloat(nominalBayar),
                    keterangan
                })
            });

            const data = await res.json();
            if (data.success) {
                showMsg('success', data.message);
                setShowModal(false);
                fetchPiutang();
                setSelectedPesanan(null);
                setNominalBayar('');
                setKeterangan('');
            } else {
                showMsg('error', data.message);
            }
        } catch (error) {
            showMsg('error', 'Terjadi kesalahan sistem');
        }
    };

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>💰 Pelunasan Piutang</h1>
            </header>

            {message.text && (
                <div className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
                    {message.text}
                </div>
            )}

            {/* Filter */}
            <section className={styles.filterSection}>
                <input
                    type="text"
                    placeholder="Cari customer (nama/no HP)..."
                    className={styles.input}
                    value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)}
                />
                <input
                    type="date"
                    className={styles.input}
                    value={filterTanggal}
                    onChange={(e) => setFilterTanggal(e.target.value)}
                />
                <button className={styles.btnClear} onClick={() => { setFilterCustomer(''); setFilterTanggal(''); }}>
                    Clear Filter
                </button>
            </section>

            {loading ? (
                <p>Memuat data...</p>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>No. Pesanan</th>
                                <th>Customer</th>
                                <th>No HP</th>
                                <th>Tanggal Ambil</th>
                                <th>Total</th>
                                <th>DP</th>
                                <th>Sisa Bayar</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {piutang.length > 0 ? (
                                piutang.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nomor_pesanan}</td>
                                        <td>{item.nama_customer}</td>
                                        <td>{item.no_hp}</td>
                                        <td>{new Date(item.tanggal_ambil).toLocaleDateString('id-ID')}</td>
                                        <td>{formatRupiah(item.total)}</td>
                                        <td>{formatRupiah(item.dp)}</td>
                                        <td className={styles.sisaBayar}>{formatRupiah(item.sisa_bayar)}</td>
                                        <td>
                                            <button
                                                className={styles.btnLunasi}
                                                onClick={() => handleLunasi(item)}
                                            >
                                                Lunasi
                                            </button>
                                            <Link href={`/transaksi/${item.id}/nota`} className={styles.btnDetail}>
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center' }}>
                                        {filterCustomer || filterTanggal ? 'Tidak ada data sesuai filter' : 'Tidak ada piutang yang belum lunas'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Pelunasan */}
            {showModal && selectedPesanan && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>Pelunasan Pesanan</h2>
                        <div className={styles.modalInfo}>
                            <p><strong>No. Pesanan:</strong> {selectedPesanan.nomor_pesanan}</p>
                            <p><strong>Customer:</strong> {selectedPesanan.nama_customer}</p>
                            <p><strong>Total:</strong> {formatRupiah(selectedPesanan.total)}</p>
                            <p><strong>DP Terbayar:</strong> {formatRupiah(selectedPesanan.dp)}</p>
                            <p><strong>Sisa Bayar:</strong> <span className={styles.highlight}>{formatRupiah(selectedPesanan.sisa_bayar)}</span></p>
                        </div>

                        <form onSubmit={submitPelunasan}>
                            <div className={styles.formGroup}>
                                <label>Nominal Pembayaran (Rp)</label>
                                <input
                                    type="number"
                                    className={styles.input}
                                    value={nominalBayar}
                                    onChange={(e) => setNominalBayar(e.target.value)}
                                    max={selectedPesanan.sisa_bayar}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Keterangan</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="submit" className={styles.btnSubmit}>Simpan Pembayaran</button>
                                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
