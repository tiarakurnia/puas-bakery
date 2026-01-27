'use client';

import { useState, useEffect } from 'react';
import styles from '../produk.module.css'; // Reuse product styles for consistency

export default function CustomerPage() {
    const [customer, setCustomer] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        id: null,
        nama: '',
        no_hp: '',
        alamat: '',
        email: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const API_URL = 'http://localhost:3001/api/customer';

    useEffect(() => {
        fetchCustomer();
    }, [search]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}?search=${search}`);
            const result = await res.json();
            if (result.success) {
                setCustomer(result.data);
            }
        } catch (error) {
            console.error('Gagal mengambil data customer:', error);
            showMsg('error', 'Gagal menghubungkan ke server backend');
        } finally {
            setLoading(false);
        }
    };

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `${API_URL}/${formData.id}` : API_URL;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.success) {
                showMsg('success', result.message);
                resetForm();
                fetchCustomer();
            } else {
                showMsg('error', result.message);
            }
        } catch (error) {
            showMsg('error', 'Terjadi kesalahan sistem');
        }
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            nama: item.nama,
            no_hp: item.no_hp || '',
            alamat: item.alamat || '',
            email: item.email || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus customer ini?')) return;

        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                showMsg('success', result.message);
                fetchCustomer();
            } else {
                showMsg('error', result.message);
            }
        } catch (error) {
            showMsg('error', 'Gagal menghapus data');
        }
    };

    const resetForm = () => {
        setFormData({ id: null, nama: '', no_hp: '', alamat: '', email: '' });
        setIsEditing(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>👥 Kasir Puas Bakery - Master Customer</h1>
            </header>

            {message.text && (
                <div className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
                    {message.text}
                </div>
            )}

            <div className={styles.mainContent}>
                {/* List Customer */}
                <section className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2>Daftar Customer</h2>
                        <input
                            type="text"
                            placeholder="Cari nama atau no HP..."
                            className={styles.input}
                            style={{ maxWidth: '250px' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <p>Memuat data...</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>No. HP</th>
                                    <th>Alamat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customer.length > 0 ? (
                                    customer.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.nama}</td>
                                            <td>{item.no_hp || '-'}</td>
                                            <td>{item.alamat || '-'}</td>
                                            <td>
                                                <button className={`${styles.btn} ${styles.btnEdit}`} onClick={() => handleEdit(item)}>Edit</button>
                                                <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => handleDelete(item.id)}>Hapus</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>Data customer kosong</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </section>

                {/* Form Tambah/Edit */}
                <aside>
                    <div className={styles.card}>
                        <h2>{isEditing ? 'Edit Customer' : 'Tambah Customer Baru'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="nama"
                                    className={styles.input}
                                    value={formData.nama}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nomor HP</label>
                                <input
                                    type="text"
                                    name="no_hp"
                                    className={styles.input}
                                    value={formData.no_hp}
                                    onChange={handleChange}
                                    placeholder="Contoh: 0812..."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Alamat</label>
                                <textarea
                                    name="alamat"
                                    className={styles.input}
                                    value={formData.alamat}
                                    onChange={handleChange}
                                    rows="3"
                                    style={{ resize: 'none' }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email (Opsional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={styles.input}
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                    {isEditing ? 'Simpan Perubahan' : 'Tambah Customer'}
                                </button>
                                {isEditing && (
                                    <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={resetForm}>
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </aside>
            </div>
        </div>
    );
}
