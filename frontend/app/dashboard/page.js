'use client';

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [newCustomers, setNewCustomers] = useState(0);

    useEffect(() => {
        fetchDashboardData();
        // Auto refresh setiap 60 detik
        const interval = setInterval(fetchDashboardData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all dashboard data
            const [summaryRes, alertsRes, topProductsRes, newCustomersRes] = await Promise.all([
                fetch('/api/dashboard/summary'),
                fetch('/api/dashboard/alerts'),
                fetch('/api/dashboard/top-products'),
                fetch('/api/dashboard/new-customers')
            ]);

            const [summaryData, alertsData, topProductsData, newCustomersData] = await Promise.all([
                summaryRes.json(),
                alertsRes.json(),
                topProductsRes.json(),
                newCustomersRes.json()
            ]);

            if (summaryData.success) setSummary(summaryData.data);
            if (alertsData.success) setAlerts(alertsData.data);
            if (topProductsData.success) setTopProducts(topProductsData.data);
            if (newCustomersData.success) setNewCustomers(newCustomersData.data.total);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPesananByStatus = (status) => {
        if (!summary?.pesanan) return 0;
        const found = summary.pesanan.find(p => p.status === status);
        return found ? found.total : 0;
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>🏠 Dashboard - Puas Bakery</h1>
                <button onClick={fetchDashboardData} className={styles.refreshBtn}>🔄 Refresh</button>
            </header>

            {loading && !summary ? (
                <p>Memuat data...</p>
            ) : (
                <>
                    {/* Widget Ringkasan */}
                    <section className={styles.widgetsGrid}>
                        <div className={`${styles.widget} ${styles.widgetPrimary}`}>
                            <div className={styles.widgetIcon}>🛒</div>
                            <div className={styles.widgetContent}>
                                <h3>Pesanan Baru</h3>
                                <p className={styles.widgetValue}>{getPesananByStatus('BARU')}</p>
                            </div>
                        </div>

                        <div className={`${styles.widget} ${styles.widgetInfo}`}>
                            <div className={styles.widgetIcon}>⚙️</div>
                            <div className={styles.widgetContent}>
                                <h3>Diproses</h3>
                                <p className={styles.widgetValue}>{getPesananByStatus('DIPROSES')}</p>
                            </div>
                        </div>

                        <div className={`${styles.widget} ${styles.widgetSuccess}`}>
                            <div className={styles.widgetIcon}>✅</div>
                            <div className={styles.widgetContent}>
                                <h3>Siap Diambil</h3>
                                <p className={styles.widgetValue}>{getPesananByStatus('SIAP DIAMBIL')}</p>
                            </div>
                        </div>

                        <div className={`${styles.widget} ${styles.widgetMoney}`}>
                            <div className={styles.widgetIcon}>💰</div>
                            <div className={styles.widgetContent}>
                                <h3>Pendapatan Hari Ini</h3>
                                <p className={styles.widgetValue}>{formatRupiah(summary?.pendapatan?.total_dp || 0)}</p>
                            </div>
                        </div>

                        <div className={`${styles.widget} ${styles.widgetCustomer}`}>
                            <div className={styles.widgetIcon}>👥</div>
                            <div className={styles.widgetContent}>
                                <h3>Customer Baru (Bulan Ini)</h3>
                                <p className={styles.widgetValue}>{newCustomers}</p>
                            </div>
                        </div>
                    </section>

                    {/* Alerts */}
                    {alerts?.upcomingOrders?.length > 0 && (
                        <section className={styles.alertsSection}>
                            <h2>🔔 Notifikasi Pesanan Mendekati Jam Ambil</h2>

                            <div className={styles.alertBox}>
                                {alerts.upcomingOrders.map((order) => (
                                    <div key={order.id} className={styles.alertItem}>
                                        <span className={styles.alertBadge}>{order.jam_ambil}</span>
                                        <span>{order.nomor_pesanan} - {order.nama_customer}</span>
                                        <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase().replace(' ', '')]}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Top Products */}
                    {topProducts.length > 0 && (
                        <section className={styles.topProductsSection}>
                            <h2>🏆 Top 5 Produk Terlaris (7 Hari Terakhir)</h2>
                            <div className={styles.productList}>
                                {topProducts.map((product, index) => (
                                    <div key={index} className={styles.productItem}>
                                        <div className={styles.productRank}>#{index + 1}</div>
                                        <div className={styles.productInfo}>
                                            <h4>{product.nama_produk}</h4>
                                            <p>{product.total_qty} pcs • {product.total_orders} pesanan • {formatRupiah(product.total_revenue)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
