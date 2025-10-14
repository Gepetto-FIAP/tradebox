import BottomNav from "@/components/BottomNav/BottomNav";
import LogoutButton from "@/components/LogoutButton/LogoutButton";
import { requireRetailer } from "@/lib/authorization";
import styles from './layout.module.css';
import { getCurrentUser } from '@/lib/auth';


export default async function DashboardSellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Verificar se o usuário é varejista antes de renderizar
  await requireRetailer();

  const user = await getCurrentUser();
  const userName = user?.nome?.split(' ')[0] || 'Usuário';

  return (
    
        <div className={styles.layout}>
            <div className={styles.header}>
                <div className={styles.greeting_wrapper}>
                  <div className={styles.greeting}>Bom dia,</div>
                  <div className={styles.name}>{userName}!</div>
                </div>
                
                <LogoutButton variant="full" />
            </div>
            <main className={styles.main_content}>
                {children}
            </main>
            <div className={styles.nav_wrapper}>
                <BottomNav/>
            </div>
        </div>
  );
}
