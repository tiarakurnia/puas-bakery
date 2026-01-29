'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../transaksi.module.css';

export default function PesananBaruPage() {
    const router = useRouter();

    const [customer, setCustomer] = useState([]);
    const [produk, setProduk] = useState([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        tanggal_ambil: new Date().toISOString().split('T')[0],
        jam_ambil: '10:00',
        jenis_bayar: 'LUNAS',
        dp: '',
        items: []
    });

    const [selectedProduct, setSelectedProduct] = useState({ id: '', qty: 1 });

    // Quick Add Customer State
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        nama: '',
        no_hp: '',
        alamat: '',
        email: '',
        catatan: '',
        tag: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resCust, resProd] = await Promise.all([
                fetch('/api/customer'),
                fetch('/api/produk')
            ]);
            const dataCust = await resCust.json();
            const dataProd = await resProd.json();

            if (dataCust.success) setCustomer(dataCust.data);
            if (dataProd.success) setProduk(dataProd.data);
        } catch (error) {
            console.error('Gagal mengambil data master', error);
        }
    };

    const handleSaveCustomer = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/customer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer)
            });
            const result = await res.json();

            if (result.success) {
                // Refresh list
                const resCust = await fetch('/api/customer');
                const dataCust = await resCust.json();
                if (dataCust.success) {
                    setCustomer(dataCust.data);
                    // Auto select new customer
                    const maxId = Math.max(...dataCust.data.map(c => c.id));
                    setFormData({ ...formData, customer_id: maxId });
                }

                setShowModal(false);
                setNewCustomer({ nama: '', no_hp: '', alamat: '', email: '', catatan: '', tag: '' });
                alert('Customer berhasil ditambahkan!');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Gagal menyimpan customer');
        }
    };

    const addItem = () => {
        if (!selectedProduct.id) return;

        const productDetail = produk.find(p => p.id === parseInt(selectedProduct.id));
        if (!productDetail) return;

        // Cek apakah item sudah ada
        const existing = formData.items.find(i => i.produk_id === productDetail.id);
        if (existing) {
            setFormData({
                ...formData,
                items: formData.items.map(i =>
                    i.produk_id === productDetail.id ? { ...i, qty: i.qty + parseInt(selectedProduct.qty) } : i
                )
            });
        } else {
            setFormData({
                ...formData,
                items: [...formData.items, {
                    produk_id: productDetail.id,
                    nama_produk: productDetail.nama_produk,
                    harga: productDetail.harga,
                    qty: parseInt(selectedProduct.qty)
                }]
            });
        }

        setSelectedProduct({ id: '', qty: 1 });
    };

    const removeItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    };

    const calculateSisa = () => {
        const total = calculateTotal();
        const dp = formData.jenis_bayar === 'LUNAS' ? total : (parseFloat(formData.dp) || 0);
        return Math.max(0, total - dp);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.items.length === 0) {
                alert('Item pesanan tidak boleh kosong!');
                return;
            }

            const res = await fetch('/api/transaksi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.success) {
                alert('Pesanan berhasil dibuat!');
                router.push('/transaksi');
            } else {
                alert(`Gagal: ${result.message}`);
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan sistem');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>📝 Buat Pesanan Baru</h1>

            <form onSubmit={handleSubmit}>
                {/* Section 1: Customer & Waktu */}
                <section className={styles.formSection}>
                    <div className={styles.formGroup}>
                        <label>Pilih Customer</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                className={styles.input}
                                value={formData.customer_id}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                                required
                            >
                                <option value="">-- Pilih Customer --</option>
                                {customer.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.nama} - {c.alamat || 'Tanpa Alamat'}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowModal(true)}
                                className={styles.btn}
                                style={{ background: '#10b981', padding: '0 1rem', fontSize: '1.2rem', color: 'white' }}
                                title="Tambah Customer Baru"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.formGroup}>
                            <label>Tanggal Ambil</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={formData.tanggal_ambil}
                                onChange={(e) => setFormData({ ...formData, tanggal_ambil: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Jam Ambil</label>
                            <input
                                type="time"
                                className={styles.input}
                                value={formData.jam_ambil}
                                onChange={(e) => setFormData({ ...formData, jam_ambil: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Input Produk */}
                <section className={styles.formSection}>
                    <h3>Detail Pesanan</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label>Produk</label>
                            <select
                                className={styles.input}
                                value={selectedProduct.id}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, id: e.target.value })}
                            >
                                <option value="">-- Pilih Produk --</option>
                                {produk.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nama_produk} - Rp {parseFloat(p.harga).toLocaleString('id-ID')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div style={{ width: '80px' }}>
                            <label>Qty</label>
                            <input
                                type="number"
                                min="1"
                                className={styles.input}
                                value={selectedProduct.qty}
                                onChange={(e) => setSelectedProduct({ ...selectedProduct, qty: e.target.value })}
                            />
                        </div>
                        <button type="button" onClick={addItem} className={`${styles.btn} ${styles.btnPrimary}`}>
                            + Tambah
                        </button>
                    </div>

                    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '4px' }}>
                        {formData.items.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>Belum ada item</p>}
                        {formData.items.map((item, idx) => (
                            <div key={idx} className={styles.itemRow}>
                                <span>{item.nama_produk}</span>
                                <span>{item.qty} x {parseInt(item.harga).toLocaleString('id-ID')}</span>
                                <span style={{ fontWeight: 'bold' }}>Rp {(item.qty * item.harga).toLocaleString('id-ID')}</span>
                                <button type="button" onClick={() => removeItem(idx)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 3: Pembayaran */}
                <section className={styles.summaryBox}>
                    <div className={styles.formGroup}>
                        <label>Jenis Pembayaran</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label>
                                <input
                                    type="radio"
                                    name="jenis_bayar"
                                    value="LUNAS"
                                    checked={formData.jenis_bayar === 'LUNAS'}
                                    onChange={(e) => setFormData({ ...formData, jenis_bayar: e.target.value })}
                                /> Lunas
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="jenis_bayar"
                                    value="DP"
                                    checked={formData.jenis_bayar === 'DP'}
                                    onChange={(e) => setFormData({ ...formData, jenis_bayar: e.target.value })}
                                /> DP (Uang Muka)
                            </label>
                        </div>
                    </div>

                    {formData.jenis_bayar === 'DP' && (
                        <div className={styles.formGroup}>
                            <label>Nominal DP</label>
                            <input
                                type="number"
                                className={styles.input}
                                value={formData.dp}
                                onChange={(e) => setFormData({ ...formData, dp: e.target.value })}
                                placeholder="Masukkan jumlah DP"
                            />
                        </div>
                    )}

                    <div className={styles.rowBetween}>
                        <span>Total Pesanan</span>
                        <span style={{ fontWeight: 'bold' }}>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                    </div>
                    <div className={styles.rowBetween}>
                        <span>Pembayaran Awal</span>
                        <span>Rp {(formData.jenis_bayar === 'LUNAS' ? calculateTotal() : (parseFloat(formData.dp) || 0)).toLocaleString('id-ID')}</span>
                    </div>
                    <div className={styles.totalRow}>
                        <div className={styles.rowBetween}>
                            <span>Sisa Tagihan</span>
                            <span>Rp {calculateSisa().toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.2rem' }}
                    >
                        Simpan Pesanan
                    </button>
                </section>
            </form>

            {/* Modal Tambah Customer */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Tambah Customer Baru</h2>
                            <button onClick={() => setShowModal(false)} className={styles.modalClose}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveCustomer}>
                            <div className={styles.formGroup}>
                                <label>Nama Customer *</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={newCustomer.nama}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, nama: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>No HP (Opsional)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={newCustomer.no_hp}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, no_hp: e.target.value })}
                                    placeholder="Contoh: 0812..."
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email (Opsional)</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Alamat (Opsional)</label>
                                <textarea
                                    className={styles.input}
                                    value={newCustomer.alamat}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, alamat: e.target.value })}
                                    rows="3"
                                    style={{ resize: 'none' }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tag/Label (Opsional)</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={newCustomer.tag}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, tag: e.target.value })}
                                    placeholder="VIP, Reseller, dll"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Catatan Khusus (Opsional)</label>
                                <textarea
                                    className={styles.input}
                                    value={newCustomer.catatan}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, catatan: e.target.value })}
                                    rows="2"
                                    style={{ resize: 'none' }}
                                    placeholder="Alergi, preferensi, dll"
                                />
                            </div>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ width: '100%' }}>
                                Simpan Customer
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
