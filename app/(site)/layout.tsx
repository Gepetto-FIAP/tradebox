import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
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

    <Footer />
   
    </>
  );
}
