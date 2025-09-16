import BottomNav from "@/components/BottomNav/BottomNav";
import styles from './layout.module.css';

export default function DashboardSellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className={styles.layout}>
            
            {children}
            
            <div className={styles.nav}>
                <BottomNav/>
            </div>
        </div>
  );
}
