'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './notifications.module.css';

export default function NotificationsPage() {
    const [alerts, setAlerts] = useState({ upcomingOrders: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dashboard/alerts');
            const data = await res.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'BARU': '#3b82f6',
            'DIPROSES': '#f59e0b',
            'SIAP DIAMBIL': '#10b981',
            'SELESAI': '#6b7280'
        };
        return statusMap[status] || '#6b7280';
    };

    const formatTime = (time) => {
        return time ? time.substring(0, 5) : '-';
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>🔔 Notifikasi</h1>
                <button className={styles.btnRefresh} onClick={fetchAlerts}>
                    🔄 Refresh
                </button>
            </header>

            {loading && alerts.upcomingOrders.length === 0 ? (
                <div className={styles.loading}>Memuat notifikasi...</div>
            ) : (
                <>
                    {alerts.upcomingOrders && alerts.upcomingOrders.length > 0 ? (
                        <section className={styles.notificationsSection}>
                            <h2 className={styles.sectionTitle}>
                                ⏰ Pesanan Mendekati Jam Ambil
                            </h2>
                            <p className={styles.sectionDesc}>
                                Pesanan dengan jam pengambilan dalam 30 menit ke depan
                            </p>

                            <div className={styles.notificationsList}>
                                {alerts.upcomingOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/transaksi/${order.id}/nota`}
                                        className={styles.notificationCard}
                                    >
                                        <div className={styles.cardHeader}>
                                            <span className={styles.timeBadge}>
                                                {formatTime(order.jam_ambil)}
                                            </span>
                                            <span
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: getStatusColor(order.status) }}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className={styles.cardBody}>
                                            <h3 className={styles.orderNumber}>{order.nomor_pesanan}</h3>
                                            <div className={styles.customerInfo}>
                                                <span className={styles.customerName}>
                                                    👤 {order.nama_customer}
                                                </span>
                                                {order.no_hp && (
                                                    <span className={styles.customerPhone}>
                                                        📱 {order.no_hp}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.orderDate}>
                                                📅 {new Date(order.tanggal_ambil).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        <div className={styles.cardFooter}>
                                            <span className={styles.viewLink}>Lihat Detail →</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>✅</span>
                            <h2>Tidak Ada Notifikasi</h2>
                            <p>Tidak ada pesanan yang mendekati jam pengambilan saat ini</p>
                            <Link href="/dashboard" className={styles.btnDashboard}>
                                Kembali ke Dashboard
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
