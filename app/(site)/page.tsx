import Link from 'next/link';
import styles from './page.module.css';
import ProfitCard from '@/components/dashboard/ProfitCard/ProfitCard';

export default function Home() {
  return (
    <>
    <section className={styles.content} id={styles.hero}>
      <div className={styles.hero}>

        
        <h1 className={styles.hero_title}>
          <span className={styles.highlight}>
            Gestao inteligente 
          </span>
          <span>
            {' '}para varejo e indústria.
          </span>
        </h1>

        <p className={styles.hero_description}>
          Analytics em tempo real, scanner GTIN e dashboards completos. Tudo que você precisa para crescer.
        </p>


        <div className={styles.hero_element}>
          <div className={styles.element}>

              <div className={styles.profit_preview}>
                <ProfitCard
                  totalsByPeriod={{
                    '7': { revenue: 1200, cost: 800 },
                    '30': { revenue: 4200, cost: 3200 },
                    '90': { revenue: 12500, cost: 9000 },
                  }}
                />
                
              </div>
            


          </div>
        </div>
      </div>

    </section>
    

    <section>

    </section>
    </>
  );
}
