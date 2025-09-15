import BottomNav from "@/components/BottomNav/BottomNav";
import styles from './layout.module.css';

export default function DashboardSellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <div className={styles.layout}>
            <div>
                <p>Header</p>
            </div>
            <div>
                {children}
            </div>
            <div className={styles.nav}>
                <BottomNav/>
            </div>
        </div>
  );
}
