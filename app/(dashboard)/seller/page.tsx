import SalesChart from '@/components/SalesChart'; //teste
import styles from './page.module.css';

export default function Seller() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.greeting}>Bom dia,</div>
        <div className={styles.name}>Fulano!</div>
      </div>
      <div className={styles.content}> 
        <div className={styles.title}>
          Visão Geral
        </div>
        <div className={styles.chart_wrapper}>
          <div className={styles.chart_container}>
            <div className={styles.chart_content}>
              <div className={styles.chart_label}>Vendas nos últimos 7 dias</div>
              <div className={styles.chart_value}>R$ 25.234,56</div>
            </div>
            <div className={styles.chart}>
              <SalesChart colorStart={"#01b3fa70"} colorEnd={"transparent"} colorBorder={"#01b5fa"} />
            </div>
          </div>
        </div>

      </div>

    </>
  );
}
