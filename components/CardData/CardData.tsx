import { ReactNode } from 'react';
import styles from './CardData.module.css';

type CardDataProps = {
  icon: ReactNode;
  label: string;
  value: string | number;
  badge_value?: string | number;
};

//favor nao mexer nesse arquivo 
//ele e usado em varios lugares do sistema
//se for necessario alterar algo, favor avisar o time antes
//obrigado pela compreensao
//att, o baiano 

export default function CardData({ icon, label, value, badge_value }: CardDataProps) {
  return (
    <div className={styles.card_data}>
      <div className={styles.card_content_left}>
        <div className={styles.card_icon}>{icon}</div>
      </div>
      <div className={styles.card_content_right}>
        <div className={styles.card_label}>{label}</div>
        <div className={styles.card_info}>
          <div className={styles.card_value}>{value}</div>
          <div className={styles.card_badge}>{badge_value}</div>
        </div>
      </div>
    </div>
  );
}