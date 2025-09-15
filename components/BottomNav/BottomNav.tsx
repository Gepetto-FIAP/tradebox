
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook para pegar a URL atual
import styles from './BottomNav.module.css';
import { BiHome, BiMoneyWithdraw, BiLineChart, BiStore, BiBarcodeReader, BiCart, BiCar } from "react-icons/bi";

const navItems = [
  { href: '/seller', icon: BiHome, label: 'Home' },
  { href: '/seller/campaign', icon: BiCart , label: 'Campanhas' },
  { href: '/seller/sell', icon: BiBarcodeReader , label: 'Vender' },
  { href: '/seller/store', icon: BiStore , label: 'Loja' },
  { href: '/seller/analytics', icon: BiLineChart , label: 'Análises' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const activeIndex = navItems.findIndex(item => item.href === pathname);

  return (
    <nav className={styles.nav}>
      <div className={styles.slider} style={{ left: `${activeIndex * 100/navItems.length}%` }} />
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={styles.navItem}>
            <item.icon className={isActive ? styles.activeIcon : styles.icon}/>
          </Link>
        );
      })}
    </nav>
  );
}
