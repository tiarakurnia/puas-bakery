'use client';

import { useState, useEffect } from 'react';
import styles from './settings.module.css';

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        nama_toko: '',
        alamat_toko: '',
        telepon_toko: '',
        footer_struk: 'Terima Kasih Atas Pesanannya!',
        logo_toko: null
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

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage('❌ File harus berupa gambar (PNG, JPG, JPEG)');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Validate file size (max 200KB)
        if (file.size > 200 * 1024) {
            setMessage('❌ Ukuran logo maksimal 200KB. Silakan kompres gambar terlebih dahulu.');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
            setFormData({ ...formData, logo_toko: reader.result });
            setMessage('✅ Logo berhasil dipilih! Jangan lupa klik Simpan.');
            setTimeout(() => setMessage(''), 3000);
        };
        reader.onerror = () => {
            setMessage('❌ Gagal membaca file');
            setTimeout(() => setMessage(''), 3000);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setFormData({ ...formData, logo_toko: null });
        setMessage('✅ Logo dihapus. Jangan lupa klik Simpan.');
        setTimeout(() => setMessage(''), 3000);
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
                    <textarea
                        value={formData.footer_struk}
                        onChange={(e) => setFormData({ ...formData, footer_struk: e.target.value })}
                        rows="4"
                        placeholder="Terima Kasih Atas Kunjungannya,&#10;*** Affordable Cakes Not Cheap ***&#10;Kue Murah Tapi Bukan Murahan"
                        style={{ resize: 'vertical', whiteSpace: 'pre-wrap' }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.3rem', display: 'block' }}>
                        💡 Tekan Enter untuk buat baris baru pada struk
                    </small>
                </div>

                <div className={styles.formGroup}>
                    <label>Logo Toko (Opsional)</label>

                    {formData.logo_toko && (
                        <div className={styles.logoPreview}>
                            <img src={formData.logo_toko} alt="Logo Preview" />
                            <button
                                type="button"
                                onClick={handleRemoveLogo}
                                className={styles.btnRemoveLogo}
                            >
                                ✖ Hapus Logo
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleLogoUpload}
                        className={styles.fileInput}
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.3rem', display: 'block' }}>
                        📸 Format: PNG, JPG, JPEG | Ukuran maks: 200KB | Rekomendasi: 200x200px
                    </small>
                </div>

                <button type="submit" className={styles.btnSave}>
                    💾 Simpan Konfigurasi
                </button>
            </form>
        </div>
    );
}
