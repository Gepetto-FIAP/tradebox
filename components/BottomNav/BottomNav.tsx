
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook para pegar a URL atual
import styles from './BottomNav.module.css';
import { BiHome, BiLineChart, BiStore, BiBarcodeReader, BiPackage, BiCog } from "react-icons/bi";

export default function BottomNav() {
  const pathname = usePathname();
  
  // Determinar o tipo de navegação baseado na rota atual
  const isIndustry = pathname?.startsWith('/industry');
  
  // Configurar itens de navegação baseado no tipo de usuário
  const navItems = isIndustry ? [
    { href: '/industry', icon: BiHome, label: 'Home' },
    { href: '/industry/products', icon: BiPackage, label: 'Produtos' },
    { href: '/industry/analytics', icon: BiLineChart, label: 'Relatórios' },
    { href: '/industry/settings', icon: BiCog, label: 'Config' },
  ] : [
    { href: '/seller', icon: BiHome, label: 'Home' },
    { href: '/seller/sell', icon: BiBarcodeReader, label: 'Vender' },
    { href: '/seller/store', icon: BiStore, label: 'Loja' },
    { href: '/seller/analytics', icon: BiLineChart, label: 'Análises' },
  ];
  
  const activeIndex = navItems.findIndex(item => item.href === pathname);

  return (
    <nav className={styles.nav}>
      <div className={styles.slider} style={{ left: `${activeIndex * 100/navItems.length}%` }} />
      {navItems.map((item, idx) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive ? styles.activeItem : ''}`}>
            <item.icon className={styles.icon}/>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Export nomeado para compatibilidade
export { default as BottomNav } from './BottomNav';

