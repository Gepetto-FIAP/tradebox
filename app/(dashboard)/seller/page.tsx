import SalesChart from '@/components/dashboard/SalesChart/SalesChart'; 
import styles from './page.module.css';
import TrendingProducts from '@/components/dashboard/TrendingProducts/TrendingProducts'; 
import CardData from '@/components/dashboard/CardData/CardData';
import {BiCartAlt, BiDollar, BiLineChart, BiBasket} from 'react-icons/bi';


const axisData = {
  x: [15, 22, 17, 20, 24, 27, 24],
  y: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
};


export default async function Seller() {

  return ( 
    <>
      <div className={styles.content}> 
        <div className={styles.chart_wrapper}>

              <SalesChart
              colorStart={"#01b5fa70"} 
              colorEnd={"transparent"} 
              colorBorder={"#01b5fa"}
              axis={axisData}
              />
            
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
