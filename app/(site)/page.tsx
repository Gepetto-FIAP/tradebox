import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { BiStore, BiBuildings, BiLineChart, BiBarcode, BiPackage, BiTrendingUp, BiCheckCircle, BiRocket, BiShield, BiSupport } from 'react-icons/bi';

export default function Home() {
  return (
    <div className={styles.home_content}>
      <div>
        
      </div>

      <div className={styles.heading}>
        <h1>teste </h1>
        <p> </p>
      </div>

      <div className={styles.element}>

        <div className={styles.element_content}>

    

        </div>
      </section>

      {/* CTA Final */}
      <section className={styles.cta_section}>
        <div className={styles.cta_content}>
          <h2>Pronto para transformar sua gestão?</h2>
            <Link href="/auth/register" className={styles.btn_cta_large}>
            Criar Conta
          </Link>
        </div>
      </section>
    </div>
  );
}