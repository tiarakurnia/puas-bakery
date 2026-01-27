'use client';

import { useState, useEffect } from 'react';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        nama_toko: '',
        alamat_toko: '',
        telepon_toko: '',
        footer_struk: 'Terima Kasih Atas Pesanannya!'
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchKonfigurasi();
    }, []);

    const fetchKonfigurasi = async () => {
        try {
            const res = await fetch('/api/konfigurasi');
            const result = await res.json();
            if (result.success) {
                setFormData(result.data);
            }
        } catch (error) {
            console.error('Gagal mengambil konfigurasi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/konfigurasi', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.success) {
                setMessage('✅ Konfigurasi berhasil disimpan!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage(`❌ ${result.message}`);
            }
        } catch (error) {
            setMessage('❌ Terjadi kesalahan sistem');
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h1>⚙️ Pengaturan Toko</h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Konfigurasi informasi toko yang akan muncul di nota pesanan
            </p>

            {message && (
                <div className={message.includes('✅') ? styles.alertSuccess : styles.alertError}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Nama Toko *</label>
                    <input
                        type="text"
                        value={formData.nama_toko}
                        onChange={(e) => setFormData({ ...formData, nama_toko: e.target.value })}
                        required
                        placeholder="Puas Bakery"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Alamat Toko</label>
                    <textarea
                        value={formData.alamat_toko}
                        onChange={(e) => setFormData({ ...formData, alamat_toko: e.target.value })}
                        rows="3"
                        placeholder="Jl. Contoh No. 123, Kota"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Telepon Toko</label>
                    <input
                        type="text"
                        value={formData.telepon_toko}
                        onChange={(e) => setFormData({ ...formData, telepon_toko: e.target.value })}
                        placeholder="08123456789"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Footer Struk</label>
                    <input
                        type="text"
                        value={formData.footer_struk}
                        onChange={(e) => setFormData({ ...formData, footer_struk: e.target.value })}
                        placeholder="Terima Kasih Atas Pesanannya!"
                    />
                </div>

                <button type="submit" className={styles.btnSave}>
                    💾 Simpan Konfigurasi
                </button>
            </form>
        </div>
    );
}
