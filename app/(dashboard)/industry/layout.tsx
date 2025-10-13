import LogoutButton from "@/components/LogoutButton/LogoutButton";
import { requireIndustry } from "@/lib/authorization";
import styles from './layout.module.css';

export const dynamic = 'force-dynamic';

export default async function IndustryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar se o usuário é indústria antes de renderizar
  await requireIndustry();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.header_content}>
          <div className={styles.header_logo}>
            <span>Trade</span>
            <span>Box</span>
          </div>
          <span className={styles.header_subtitle}>Indústria</span>
        </div>
        <LogoutButton variant="full" />
      </header>
      <main className={styles.main_content}>
        {children}
      </main>
    </div>
  );
}
