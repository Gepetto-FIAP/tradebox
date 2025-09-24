import styles from './CardData.module.css';
import {BiCartAlt } from 'react-icons/bi';

export default function CardData() {
  return (
    <div className={styles.card_data}>
        <div className={styles.card_header}> 
            <div className={styles.card_icon}>
                <BiCartAlt />
            </div>
            <div className={styles.card_label}>
                Total de vendas
            </div>
        </div>
        <div className={styles.card_body}>
            <div className={styles.card_value}> 
                24
            </div>
            <div className={styles.card_badge}>
                <span>
                    +5%
                </span>
            </div>
        </div>
    </div>
  );
}