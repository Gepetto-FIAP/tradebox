import { ReactNode } from 'react';
import styles from './CardData.module.css';

type CardDataProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
};

export default function CardData({ icon, label, value }: CardDataProps) {
  return (
    <div className={styles.card_data}>
      <div className={styles.card_content_left}>
        <div className={styles.card_icon}>{icon}</div>
      </div>
      <div className={styles.card_content_right}>
        <div className={styles.card_label}>{label}</div>
        <div className={styles.card_info}>
          <div className={styles.card_value}>{value}</div>
          {/* badge removido para simplificar, adicione se quiser */}
        </div>
      </div>
    </div>
  );
}