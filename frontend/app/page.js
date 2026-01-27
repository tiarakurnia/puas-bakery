'use client';

import { useState, useEffect } from 'react';
import styles from './produk.module.css';

export default function ProdukPage() {
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    nama_produk: '',
    harga: '',
    satuan: 'pcs'
  });
  const [isEditing, setIsEditing] = useState(false);

  const API_URL = 'http://localhost:3001/api/produk';

  useEffect(() => {
    fetchProduk();
  }, [search]);

  const fetchProduk = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?search=${search}`);
      const result = await res.json();
      if (result.success) {
        setProduk(result.data);
      }
    } catch (error) {
      console.error('Gagal mengambil data produk:', error);
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
        body: JSON.stringify({
          nama_produk: formData.nama_produk,
          harga: parseFloat(formData.harga),
          satuan: formData.satuan
        })
      });

      const result = await res.json();
      if (result.success) {
        showMsg('success', result.message);
        resetForm();
        fetchProduk();
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
      nama_produk: item.nama_produk,
      harga: item.harga,
      satuan: item.satuan
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showMsg('success', result.message);
        fetchProduk();
      } else {
        showMsg('error', result.message);
      }
    } catch (error) {
      showMsg('error', 'Gagal menghapus produk');
    }
  };

  const resetForm = () => {
    setFormData({ id: null, nama_produk: '', harga: '', satuan: 'pcs' });
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🍰 Kasir Puas Bakery - Master Produk</h1>
      </header>

      {message.text && (
        <div className={message.type === 'success' ? styles.successMsg : styles.errorMsg}>
          {message.text}
        </div>
      )}

      <div className={styles.mainContent}>
        {/* List Produk */}
        <section className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2>Daftar Produk</h2>
            <input
              type="text"
              placeholder="Cari produk..."
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
                  <th>Nama Produk</th>
                  <th>Harga</th>
                  <th>Satuan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produk.length > 0 ? (
                  produk.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nama_produk}</td>
                      <td>Rp {parseFloat(item.harga).toLocaleString('id-ID')}</td>
                      <td>{item.satuan}</td>
                      <td>
                        <button className={`${styles.btn} ${styles.btnEdit}`} onClick={() => handleEdit(item)}>Edit</button>
                        <button className={`${styles.btn} ${styles.btnDelete}`} onClick={() => handleDelete(item.id)}>Hapus</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>Data produk kosong</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Form Tambah/Edit */}
        <aside>
          <div className={styles.card}>
            <h2>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nama Produk</label>
                <input
                  type="text"
                  name="nama_produk"
                  className={styles.input}
                  value={formData.nama_produk}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Harga (Rp)</label>
                <input
                  type="number"
                  name="harga"
                  className={styles.input}
                  value={formData.harga}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Satuan</label>
                <input
                  type="text"
                  name="satuan"
                  className={styles.input}
                  value={formData.satuan}
                  onChange={handleChange}
                  placeholder="pcs, box, dll"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
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
