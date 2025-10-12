import SalesChart from '@/components/SalesChart/SalesChart'; 
import styles from './page.module.css';
import TrendingProducts from '@/components/TrendingProducts/TrendingProducts'; 
import CardData from '@/components/CardData/CardData';
import {BiCartAlt, BiDollar, BiLineChart, BiBasket} from 'react-icons/bi';

export default function Seller() {
  return (
    <>

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
              <div className={styles.card_label}>Produtos em alta</div>
            </div>
            <div className={styles.recent_orders}>
              <TrendingProducts/>
            </div>
          </div>
        </div>

        <div className={styles.cards_data_wrapper}>


          <div className={styles.cards_data}>
              <CardData icon={<BiCartAlt/>} label="Vendas" value={24} badge_value={"+5%"} />
              <CardData icon={<BiDollar />} label="Faturamento" value={"R$25K"} badge_value={"+10%"} />
              <CardData icon={<BiLineChart  />} label="Campanhas" value={3} badge_value={"+25%"} />
              <CardData icon={<BiBasket />} label="Produtos" value={12} badge_value={"+3%"} />
          </div>
        </div>
      </div>
    </>
  );
}
