'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './nota.module.css';

export default function NotaPage() {
    const params = useParams();
    const router = useRouter();
    const [pesanan, setPesanan] = useState(null);
    const [konfigurasi, setKonfigurasi] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resPesanan, resConfig] = await Promise.all([
                fetch(`/api/transaksi/${params.id}`),
                fetch('/api/konfigurasi')
            ]);

            const dataPesanan = await resPesanan.json();
            const dataConfig = await resConfig.json();

            if (dataPesanan.success) setPesanan(dataPesanan.data);
            if (dataConfig.success) setKonfigurasi(dataConfig.data);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
            alert('Gagal memuat data pesanan');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatRupiah = (angka) => {
        return parseInt(angka).toLocaleString('id-ID');
    };

    const formatTanggal = (tanggal) => {
        const d = new Date(tanggal);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (!pesanan) return <div className={styles.error}>Pesanan tidak ditemukan</div>;

    return (
        <div className={styles.wrapper}>
            <div className={styles.actions}>
                <button onClick={() => router.back()} className={styles.btnBack}>
                    ← Kembali
                </button>
                <button onClick={handlePrint} className={styles.btnPrint}>
                    🖨️ Cetak Nota
                </button>
            </div>

            <div className={styles.receipt} id="receipt">
                <div className={styles.receiptContent}>
                    {/* Header Toko */}
                    <div className={styles.header}>
                        <div className={styles.separatorDouble} />
                        <div className={styles.storeName}>{konfigurasi?.nama_toko || 'PUAS BAKERY'}</div>
                        <div className={styles.storeInfo}>{konfigurasi?.alamat_toko || '-'}</div>
                        <div className={styles.storeInfo}>Telp: {konfigurasi?.telepon_toko || '-'}</div>
                        <div className={styles.separatorDouble} />
                    </div>

                    {/* Info Pesanan */}
                    <div className={styles.orderInfo}>
                        <div className={styles.row}>
                            <span>No: {pesanan.nomor_pesanan}</span>
                        </div>
                        <div className={styles.row}>
                            <span>Tgl: {formatTanggal(pesanan.tanggal_pesan)}</span>
                            <span>Jam Ambil: {pesanan.jam_ambil}</span>
                        </div>
                        <div className={styles.separatorDashed} />
                        <div className={styles.row}>
                            <span>Customer</span>
                            <span>: {pesanan.nama_customer}</span>
                        </div>
                        <div className={styles.row}>
                            <span>HP</span>
                            <span>: {pesanan.no_hp || '-'}</span>
                        </div>
                        <div className={styles.separatorDashed} />
                    </div>

                    {/* Header Tabel */}
                    <div className={styles.tableHeader}>
                        <span className={styles.colItem}>Item</span>
                        <span className={styles.colQty}>Qty</span>
                        <span className={styles.colPrice}>Harga</span>
                        <span className={styles.colSubtotal}>Subtotal</span>
                    </div>
                    <div className={styles.separatorDashed} />

                    {/* Items */}
                    {pesanan.items?.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                            <span className={styles.colItem}>{item.nama_produk}</span>
                            <span className={styles.colQty}>{item.qty}</span>
                            <span className={styles.colPrice}>{formatRupiah(item.harga)}</span>
                            <span className={styles.colSubtotal}>{formatRupiah(item.subtotal)}</span>
                        </div>
                    ))}

                    <div className={styles.separatorDashed} />

                    {/* Total */}
                    <div className={styles.totalSection}>
                        <div className={styles.totalRow}>
                            <span>TOTAL</span>
                            <span>Rp {formatRupiah(pesanan.total)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>DP</span>
                            <span>Rp {formatRupiah(pesanan.dp)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>SISA BAYAR</span>
                            <span>Rp {formatRupiah(pesanan.sisa_bayar)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer}>
                        <div className={styles.separatorDouble} />
                        <div className={styles.footerText}>{konfigurasi?.footer_struk || 'Terima Kasih Atas Pesanannya!'}</div>
                        <div className={styles.storeName}>~ {konfigurasi?.nama_toko || 'Puas Bakery'} ~</div>
                        <div className={styles.separatorDouble} />
                    </div>
                </div>
            </div>
        </div>
    );
}
