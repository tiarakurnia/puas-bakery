'use client';

import { useState } from 'react';
import styles from './backup.module.css';

export default function BackupPage() {
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleBackup = async () => {
        try {
            setLoading(true);
            showMsg('info', 'Membuat backup database...');

            const res = await fetch('/api/backup/export');
            const blob = await res.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-kasir-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showMsg('success', 'Backup berhasil diunduh!');
        } catch (error) {
            showMsg('error', 'Gagal membuat backup: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            showMsg('info', 'Memvalidasi file backup...');

            const text = await file.text();
            const data = JSON.parse(text);

            // Validate first
            const validateRes = await fetch('/api/backup?action=validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const validateData = await validateRes.json();
            setValidationResult(validateData);

            if (validateData.valid) {
                showMsg('success', 'File backup valid! Klik "Restore Sekarang" untuk melanjutkan.');
            } else {
                showMsg('error', 'File backup tidak valid: ' + validateData.errors.join(', '));
            }
        } catch (error) {
            showMsg('error', 'Gagal membaca file: ' + error.message);
            setValidationResult(null);
        } finally {
            setLoading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleRestore = async () => {
        if (!validationResult || !validationResult.valid) {
            showMsg('error', 'Tidak ada backup yang valid untuk di-restore');
            return;
        }

        const confirmed = confirm(
            '⚠️ PERINGATAN! Proses restore akan menghapus SEMUA data yang ada dan menggantinya dengan data dari backup.\n\n' +
            'Data yang akan di-restore:\n' +
            `- Produk: ${validationResult.stats.produk} item\n` +
            `- Customer: ${validationResult.stats.customer} item\n` +
            `- Pesanan: ${validationResult.stats.pesanan} item\n\n` +
            'Apakah Anda yakin ingin melanjutkan?'
        );

        if (!confirmed) return;

        try {
            setLoading(true);
            showMsg('info', 'Memulai proses restore... Mohon tunggu.');

            // Get the backup data from validation result
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            const text = await file.text();
            const data = JSON.parse(text);

            const res = await fetch('/api/backup?action=import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (result.success) {
                showMsg('success', '✅ Restore berhasil! Database telah dikembalikan ke state backup.');
                setValidationResult(null);
            } else {
                showMsg('error', 'Restore gagal: ' + result.message);
            }
        } catch (error) {
            showMsg('error', 'Terjadi kesalahan saat restore: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>💾 Backup & Restore Database</h1>
            </header>

            {message.text && (
                <div className={
                    message.type === 'success' ? styles.successMsg :
                        message.type === 'error' ? styles.errorMsg :
                            styles.infoMsg
                }>
                    {message.text}
                </div>
            )}

            <div className={styles.grid}>
                {/* Backup Section */}
                <section className={styles.card}>
                    <h2>📥 Backup Database</h2>
                    <p>Buat file backup dari seluruh database untuk keamanan data.</p>

                    <div className={styles.info}>
                        <strong>Yang akan di-backup:</strong>
                        <ul>
                            <li>Semua data produk</li>
                            <li>Semua data customer</li>
                            <li>Semua data pesanan & transaksi</li>
                            <li>Konfigurasi toko</li>
                            <li>Pengaturan jam operasional</li>
                        </ul>
                    </div>

                    <button
                        className={styles.btnPrimary}
                        onClick={handleBackup}
                        disabled={loading}
                    >
                        {loading ? '⏳ Memproses...' : '💾 Backup Database'}
                    </button>
                </section>

                {/* Restore Section */}
                <section className={styles.card}>
                    <h2>📤 Restore Database</h2>
                    <p>Kembalikan database dari file backup yang sudah ada.</p>

                    <div className={styles.warning}>
                        <strong>⚠️ PERHATIAN!</strong>
                        <p>Proses restore akan menghapus SEMUA data yang ada dan menggantinya dengan data dari file backup. Pastikan Anda sudah membuat backup terbaru sebelum melakukan restore.</p>
                    </div>

                    <div className={styles.uploadSection}>
                        <label htmlFor="fileInput" className={styles.uploadLabel}>
                            📁 Pilih File Backup (.json)
                        </label>
                        <input
                            id="fileInput"
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className={styles.fileInput}
                            disabled={loading}
                        />
                    </div>

                    {validationResult && (
                        <div className={validationResult.valid ? styles.validBox : styles.invalidBox}>
                            <h3>{validationResult.valid ? '✅ File Valid' : '❌ File Tidak Valid'}</h3>

                            {validationResult.errors && validationResult.errors.length > 0 && (
                                <div className={styles.errorList}>
                                    <strong>Error:</strong>
                                    <ul>
                                        {validationResult.errors.map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validationResult.warnings && validationResult.warnings.length > 0 && (
                                <div className={styles.warningList}>
                                    <strong>Warning:</strong>
                                    <ul>
                                        {validationResult.warnings.map((warn, idx) => (
                                            <li key={idx}>{warn}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validationResult.stats && (
                                <div className={styles.stats}>
                                    <strong>Statistik Data:</strong>
                                    <ul>
                                        <li>Produk: {validationResult.stats.produk} item</li>
                                        <li>Customer: {validationResult.stats.customer} item</li>
                                        <li>Pesanan: {validationResult.stats.pesanan} item</li>
                                        <li>Detail Pesanan: {validationResult.stats.pesanan_detail} item</li>
                                    </ul>
                                </div>
                            )}

                            {validationResult.valid && (
                                <button
                                    className={styles.btnDanger}
                                    onClick={handleRestore}
                                    disabled={loading}
                                >
                                    {loading ? '⏳ Memproses...' : '🔄 Restore Sekarang'}
                                </button>
                            )}
                        </div>
                    )}
                </section>
            </div>

            {/* Best Practices */}
            <section className={styles.tipsCard}>
                <h2>💡 Tips Backup & Restore</h2>
                <div className={styles.tipsGrid}>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>📅</span>
                        <div>
                            <strong>Backup Berkala</strong>
                            <p>Lakukan backup minimal 1x seminggu atau setiap ada perubahan data penting</p>
                        </div>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>💾</span>
                        <div>
                            <strong>Simpan di Tempat Aman</strong>
                            <p>Upload file backup ke cloud storage (Google Drive, Dropbox, dll)</p>
                        </div>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>🔖</span>
                        <div>
                            <strong>Beri Nama yang Jelas</strong>
                            <p>Rename file backup dengan tanggal dan keterangan (misal: backup-2026-01-28-sebelum-update.json)</p>
                        </div>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>✅</span>
                        <div>
                            <strong>Test Restore</strong>
                            <p>Sesekali coba restore di lingkungan test untuk memastikan backup berfungsi</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
