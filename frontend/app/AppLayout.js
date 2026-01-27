'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export default function RootLayout({ children }) {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Produk', path: '/', icon: '🍰' },
        { name: 'Customer', path: '/customer', icon: '👥' },
        { name: 'Transaksi', path: '/transaksi', icon: '🛒' },
        { name: 'Rekap', path: '/rekap', icon: '📊' },
    ];

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <h2>Puas Bakery</h2>
                </div>
                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
