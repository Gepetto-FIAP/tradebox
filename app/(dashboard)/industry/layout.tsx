import LogoutButton from "@/components/ui/LogoutButton/LogoutButton";
import { requireIndustry } from "@/lib/authorization";
import styles from './layout.module.css';
import { getCurrentUser } from '@/lib/auth';
import BottomNav from '@/components/layout/BottomNav/BottomNav';

export const dynamic = 'force-dynamic';

export default async function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  await requireIndustry();
  const user = await getCurrentUser();
  const userName = user?.nome?.split(' ')[0] || 'Indústria';

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
          <div className={styles.header}>
              <div className={styles.greeting_wrapper}>
                <div className={styles.greeting}>Olá,</div>
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
  </div>

  );
}
