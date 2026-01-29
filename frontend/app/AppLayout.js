'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export default function RootLayout({ children }) {
    const pathname = usePathname();
    const [notificationCount, setNotificationCount] = useState(0);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
        { name: 'Produk', path: '/', icon: '🍰' },
        { name: 'Customer', path: '/customer', icon: '👥' },
        { name: 'Transaksi', path: '/transaksi', icon: '🛒' },
        { name: 'Pelunasan', path: '/pelunasan', icon: '💰' },
        { name: 'Rekap', path: '/rekap', icon: '📊' },
        { name: 'Settings', path: '/settings', icon: '⚙️' },
    ];

    // Fetch notification count
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/dashboard/alerts');
                const data = await res.json();
                if (data.success) {
                    setNotificationCount(data.data.upcomingOrders?.length || 0);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
        // Refresh every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.brand}>
                    <h2>Puas Bakery</h2>
                    <Link href="/notifications" className={styles.notificationBell}>
                        <span className={styles.bellIcon}>🔔</span>
                        {notificationCount > 0 && (
                            <span className={styles.badge}>{notificationCount}</span>
                        )}
                    </Link>
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
