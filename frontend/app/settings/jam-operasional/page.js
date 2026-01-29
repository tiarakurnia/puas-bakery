'use client';

import { useState, useEffect } from 'react';
import styles from './jam-operasional.module.css';

export default function JamOperasionalPage() {
    const [jamOperasional, setJamOperasional] = useState([]);
    const [slotWaktu, setSlotWaktu] = useState([]);
    const [tanggalLibur, setTanggalLibur] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form untuk tambah tanggal libur
    const [newTanggalLibur, setNewTanggalLibur] = useState('');
    const [keteranganLibur, setKeteranganLibur] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/jam-operasional');
            const data = await res.json();
            if (data.success) {
                setJamOperasional(data.data.jam_operasional || []);
                setSlotWaktu(data.data.slot_waktu || []);
                setTanggalLibur(data.data.tanggal_libur || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleToggleHari = async (hari, currentState) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const jamOps = jamOperasional.find(j => j.hari === hari);

            const res = await fetch(`${API_URL}/api/jam-operasional/hari/${hari}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jam_buka: jamOps.jam_buka,
                    jam_tutup: jamOps.jam_tutup,
                    is_buka: !currentState
                })
            });

            const data = await res.json();
            if (data.success) {
                showMsg('success', `Hari ${hari} berhasil diupdate`);
                fetchData();
            } else {
                showMsg('error', data.message);
            }
        } catch (error) {
            showMsg('error', 'Terjadi kesalahan sistem');
        }
    };

    const handleAddTanggalLibur = async (e) => {
        e.preventDefault();
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/jam-operasional/libur`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tanggal: newTanggalLibur,
                    keterangan: keteranganLibur
                })
            });

            const data = await res.json();
            if (data.success) {
                showMsg('success', 'Tanggal libur berhasil ditambahkan');
                setNewTanggalLibur('');
                setKeteranganLibur('');
                fetchData();
            } else {
                showMsg('error', data.message);
            }
        } catch (error) {
            showMsg('error', 'Terjadi kesalahan sistem');
        }
    };

    const handleDeleteLibur = async (id) => {
        if (!confirm('Hapus tanggal libur ini?')) return;

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API_URL}/api/jam-operasional/libur/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();
            if (data.success) {
                showMsg('success', 'Tanggal libur berhasil dihapus');
                fetchData();
            } else {
                showMsg('error', data.message);
            }
        } catch (error) {
            showMsg('error', 'Terjadi kesalahan sistem');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>⏰ Pengaturan Jam Operasional</h1>
            </header>

            {message.text && (
                <div className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <p>Memuat data...</p>
            ) : (
                <>
                    {/* Jam Operasional per Hari */}
                    <section className={styles.card}>
                        <h2>📅 Jadwal Operasional Toko</h2>
                        <div className={styles.scheduleGrid}>
                            {jamOperasional.map((item) => (
                                <div key={item.hari} className={`${styles.scheduleItem} ${!item.is_buka ? styles.closed : ''}`}>
                                    <div className={styles.scheduleHeader}>
                                        <strong>{item.hari}</strong>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={item.is_buka}
                                                onChange={() => handleToggleHari(item.hari, item.is_buka)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                    <div className={styles.scheduleTime}>
                                        {item.is_buka ? (
                                            <span>{item.jam_buka} - {item.jam_tutup}</span>
                                        ) : (
                                            <span className={styles.closedText}>TUTUP</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Tanggal Libur */}
                    <section className={styles.card}>
                        <h2>🎉 Tanggal Libur</h2>

                        <form onSubmit={handleAddTanggalLibur} className={styles.formInline}>
                            <input
                                type="date"
                                className={styles.input}
                                value={newTanggalLibur}
                                onChange={(e) => setNewTanggalLibur(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Keterangan (contoh: Tahun Baru)"
                                value={keteranganLibur}
                                onChange={(e) => setKeteranganLibur(e.target.value)}
                            />
                            <button type="submit" className={styles.btnAdd}>Tambah</button>
                        </form>

                        <div className={styles.liburList}>
                            {tanggalLibur.length > 0 ? (
                                tanggalLibur.map((item) => (
                                    <div key={item.id} className={styles.liburItem}>
                                        <span className={styles.liburDate}>
                                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <span className={styles.liburKet}>{item.keterangan || '-'}</span>
                                        <button
                                            className={styles.btnDelete}
                                            onClick={() => handleDeleteLibur(item.id)}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.emptyText}>Belum ada tanggal libur yang ditambahkan</p>
                            )}
                        </div>
                    </section>

                    {/* Info Slot Waktu */}
                    <section className={styles.card}>
                        <h2>🕐 Slot Waktu Pickup</h2>
                        <p>Slot waktu yang tersedia untuk jam pengambilan pesanan:</p>
                        <div className={styles.slotGrid}>
                            {slotWaktu.map((slot) => (
                                <span key={slot.id} className={styles.slotBadge}>
                                    {slot.waktu.substring(0, 5)}
                                </span>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
