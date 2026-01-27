'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './rekap.module.css';

export default function RekapLayout({ children }) {
    const pathname = usePathname();

    const tabs = [
        { name: '📊 Produksi Harian', path: '/rekap/produksi' },
        { name: '💰 Transaksi Harian', path: '/rekap/transaksi' },
        { name: '🏆 Produk Terlaris', path: '/rekap/terlaris' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Laporan & Rekapitulasi</h1>
                <p className={styles.subtitle}>Pantau aktivitas produksi dan penjualan toko Anda</p>
            </div>

            <nav className={styles.tabs}>
                {tabs.map((tab) => (
                    <Link
                        key={tab.path}
                        href={tab.path}
                        className={`${styles.tab} ${pathname === tab.path ? styles.activeTab : ''}`}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>

            <main>{children}</main>
        </div>
    );
}
