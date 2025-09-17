import { BiMoneyWithdraw } from "react-icons/bi";
import styles from './RecentOrders.module.css';

export default function RecentOrders() {
  return (
    <div>
        <ul className={styles.orders_list}>
            <li className={styles.order_item}>
                <div className={styles.order_icon}>
                    <BiMoneyWithdraw />
                </div>
                <div className={styles.order_info}>
                    <div className={styles.order_customer}>
                        Luiz Inacio Lula da Silva Barbosa
                    </div>
                    <div className={styles.order_date}>
                        01/01/1900
                    </div>
                </div>
                <div className={styles.order_amount}>
                    + R$ 250,00
                </div>
            </li>

            <li className={styles.order_item}>
                <div className={styles.order_icon}>
                    <BiMoneyWithdraw />
                </div>
                <div className={styles.order_info}>
                    <div className={styles.order_customer}>
                        Jair Messias Bolsonaro
                    </div>
                    <div className={styles.order_date}>
                        01/01/2024
                    </div>
                </div>
                <div className={styles.order_amount}>
                    + R$ 110,00
                </div>
            </li>

            <li className={styles.order_item}>
                <div className={styles.order_icon}>
                    <BiMoneyWithdraw />
                </div>
                <div className={styles.order_info}>
                    <div className={styles.order_customer}>
                        Pedro de Alcântara João Carlos Leopoldo Salvador Bibiano Francisco
                    </div>
                    <div className={styles.order_date}>
                        07/09/1822
                    </div>
                </div>
                <div className={styles.order_amount}>
                    + R$ 9999,00
                </div>
            </li>
        </ul>
    </div>
  ); 
}


