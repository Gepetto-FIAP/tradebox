import RecentOrders from '@/components/RecentOrders/RecentOrders';
import styles from './page.module.css';


export default function Sell() {
  return (
    <div className={styles.history_sell}>
      <div className={styles.history_label}>
        Histórico de vendas
      </div>
      <div className={styles.history_table}>
        <RecentOrders/>
      </div>
    </div>
  );
}
