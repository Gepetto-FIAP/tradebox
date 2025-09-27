import { BiBarcodeReader, BiPlus   } from "react-icons/bi";
import styles from './layout.module.css';
import Link from "next/link";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.sell_content}>
          {children}
        </div>
        <div className={styles.sell_options}>
          <Link href="/scan" className={styles.button}>
            <BiBarcodeReader  />
            <div className={styles.button_label}>
              Escanear produto
            </div>
          </Link>
          <Link href="/manual" className={styles.button}>
            <BiPlus/>
            <div className={styles.button_label}>
              Inserir manualmente
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
