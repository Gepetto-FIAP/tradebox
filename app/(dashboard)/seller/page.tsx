import SalesChart from '@/components/SalesChart'; //teste
import styles from './page.module.css';

export default function Seller() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.greeting}>Bom dia,</div>
        <div className={styles.name}>Fulano!</div>
      </div>
      <div className={styles.chart}>
        <SalesChart />
      </div>
    </>
  );
}
