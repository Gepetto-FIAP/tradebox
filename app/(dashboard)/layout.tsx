import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard_content}>
        {children} 
      </div>
    </div>
  );
}
