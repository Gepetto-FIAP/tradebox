import styles from './CardData.module.css';
import {BiCartAlt } from 'react-icons/bi';

export default function CardData() {
  return (
    <div className={styles.card_data}>
        <div className={styles.card_content_left}>
            <div className={styles.card_icon}>
                <BiCartAlt />
            </div>
        </div>
        <div className={styles.card_content_right}>
            <div className={styles.card_label}>
                Total de vendas
            </div>

            <div className={styles.card_info}>
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
    </div>
  );
}