import SalesChart from '@/components/SalesChart'; //teste
import styles from './page.module.css';
import RecentOrders from '@/components/RecentOrders/RecentOrders';
import CardData from '@/components/CardData/CardData';

export default function Seller() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.greeting}>Bom dia,</div>
        <div className={styles.name}>Fulano!</div>
      </div>
      <div className={styles.content}> 

        <div className={styles.chart_wrapper}>
          <div className={styles.chart_container}>
            <div className={styles.chart_content}>
              <div className={styles.card_label}>Vendas nos últimos 7 dias</div>
              <div className={styles.chart_value}>R$ 25.234,56</div>
            </div>
            <div className={styles.chart}>
              <SalesChart colorStart={"#01b5fa70"} colorEnd={"transparent"} colorBorder={"#01b5fa"} />
            </div>
          </div>
        </div>

        <div className={styles.recent_orders_wrapper}>
          <div className={styles.orders_container}>
            <div className={styles.orders_content}>
              <div className={styles.card_label}>Últimas vendas</div>
            </div>
            <div className={styles.recent_orders}>
              <RecentOrders/>
            </div>
          </div>
        </div>

        <div className={styles.cards_data_wrapper}>

          <div className={styles.cards_data}>
              <CardData/>
              <CardData/>
              <CardData/>
          </div>

        </div>



      </div>

    </>
  );
}
