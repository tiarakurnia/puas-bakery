'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './customer-detail.module.css';

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState(null);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchCustomerDetail();
            fetchOrderHistory();
        }
    }, [params.id]);

    const fetchCustomerDetail = async () => {
        try {
            const res = await fetch(`/api/customer/${params.id}`);
            const data = await res.json();
            if (data.success) {
                setCustomer(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchOrderHistory = async () => {
        try {
            const res = await fetch(`/api/customer/${params.id}/history`);
            const data = await res.json();
            if (data.success) {
                setOrderHistory(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    const getStatusColor = (status) => {
        const colors = {
            'BARU': '#3b82f6',
            'DIPROSES': '#f59e0b',
            'SIAP DIAMBIL': '#10b981',
            'SELESAI': '#6b7280',
            'DIBATALKAN': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getPaymentBadge = (jenis) => {
        return jenis === 'LUNAS' ? styles.lunas : styles.dp;
    };

    if (loading) {
        return <div className={styles.loading}>Memuat data...</div>;
    }

    if (!customer) {
        return <div className={styles.error}>Customer tidak ditemukan</div>;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.btnBack} onClick={() => router.back()}>
                    ← Kembali
                </button>
                <h1 className={styles.title}>Detail Customer</h1>
            </header>

            {/* Customer Info Card */}
            <section className={styles.customerCard}>
                <div className={styles.cardHeader}>
                    <h2>Informasi Customer</h2>
                    <Link href="/customer" className={styles.btnEdit}>
                        ✏️ Edit
                    </Link>
                </div>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <label>Nama Lengkap</label>
                        <p>{customer.nama}</p>
                    </div>
                    <div className={styles.infoItem}>
                        <label>No. HP</label>
                        <p>{customer.no_hp || '-'}</p>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Email</label>
                        <p>{customer.email || '-'}</p>
                    </div>
                    <div className={styles.infoItem}>
                        <label>Tag/Label</label>
                        <p>{customer.tag ? <span className={styles.tag}>{customer.tag}</span> : '-'}</p>
                    </div>
                    <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                        <label>Alamat</label>
                        <p>{customer.alamat || '-'}</p>
                    </div>
                    {customer.catatan && (
                        <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                            <label>Catatan Khusus</label>
                            <p className={styles.catatan}>{customer.catatan}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Order History */}
            <section className={styles.historySection}>
                <h2>Riwayat Pesanan</h2>

                {orderHistory.length > 0 ? (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>No. Pesanan</th>
                                    <th>Tanggal Pesan</th>
                                    <th>Tanggal Ambil</th>
                                    <th>Jam Ambil</th>
                                    <th>Total</th>
                                    <th>Pembayaran</th>
                                    <th>Sisa Bayar</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderHistory.map((order) => (
                                    <tr key={order.id}>
                                        <td className={styles.orderNumber}>{order.nomor_pesanan}</td>
                                        <td>{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                        <td>{new Date(order.tanggal_ambil).toLocaleDateString('id-ID')}</td>
                                        <td>{order.jam_ambil}</td>
                                        <td>{formatRupiah(order.total)}</td>
                                        <td>
                                            <span className={`${styles.paymentBadge} ${getPaymentBadge(order.jenis_bayar)}`}>
                                                {order.jenis_bayar}
                                            </span>
                                        </td>
                                        <td className={order.sisa_bayar > 0 ? styles.unpaid : ''}>
                                            {formatRupiah(order.sisa_bayar)}
                                        </td>
                                        <td>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/transaksi/${order.id}/nota`} className={styles.btnView}>
                                                Lihat
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📦</span>
                        <p>Belum ada riwayat pesanan</p>
                    </div>
                )}

                {/* Summary Stats */}
                {orderHistory.length > 0 && (
                    <div className={styles.summaryStats}>
                        <div className={styles.statCard}>
                            <label>Total Pesanan</label>
                            <p className={styles.statValue}>{orderHistory.length}</p>
                        </div>
                        <div className={styles.statCard}>
                            <label>Total Belanja</label>
                            <p className={styles.statValue}>
                                {formatRupiah(orderHistory.reduce((sum, o) => sum + parseFloat(o.total), 0))}
                            </p>
                        </div>
                        <div className={styles.statCard}>
                            <label>Pesanan Selesai</label>
                            <p className={styles.statValue}>
                                {orderHistory.filter(o => o.status === 'SELESAI').length}
                            </p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
