import Header from '@/components/Header/Header';
import styles from './layout.module.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Header />

    <main className={styles.main}>
      {children}
    </main>

   
    </>
  );
}
