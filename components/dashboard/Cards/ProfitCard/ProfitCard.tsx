'use client';

import React, { useMemo, useState } from 'react';
import styles from './ProfitCard.module.css';

interface Totals { revenue: number; cost: number }

interface Props {
  totalsByPeriod?: Record<string, Totals>;
}

export default function ProfitCard({ totalsByPeriod = {}}: Props) {
  const keys = Object.keys(totalsByPeriod);
  const defaultKeys = keys.length ? keys : ['7', '30'];

  const [key, setKey] = useState<string>(defaultKeys[0]);

  const { revenue, cost } = useMemo(() => {
    const totals = totalsByPeriod[key];
    return { revenue: totals?.revenue || 0, cost: totals?.cost || 0 };
  }, [totalsByPeriod, key]);

  const profit = revenue - cost;
  const pct = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className={styles.profit_container}>
      <div className={styles.profit_label}>
        Detalhes do lucro
      </div>

      <div className={styles.profit_details}>
        <div className={styles.profit_details_period}>
          {defaultKeys.map(k => (
          <button
            key={k}
            onClick={() => setKey(k)}
            className={ k === key ? styles.active : ''}
          >
            { k} dias
          </button>
        ))}
        </div>
        <div className={styles.profit_details_chart}>
          <div className={styles.profit_details_info}>
            <div className={styles.profit_details_percentage}>
              {pct}%
            </div>
            <div className={styles.profit_details_text}>
              Margem de lucro
            </div>

          </div>

          <div className={styles.profit_details_squares}>
            {
              Array.from({ length: 20 }, (_, i) => {
                const angle = 180 + i * (360 / 38);
                const opacity = Math.min(1, Math.max(0.075, (pct - i * 5) / 5)); 

                return (
                  <div
                    key={i}
                    className={styles.profit_square}
                    style={{
                      transform: `
                        rotate(${angle}deg)
                        translate(7em)
                        perspective(100px)
                        rotateY(-50deg)
                      `,
                      opacity,
                    }}
                  />
                );
              })
            }
          </div>
        </div>
        <div className={styles.profit_details_values}>
          <div className={styles.profit_details_revenue}>
            {fmt(revenue)}
          </div>
          <div className={styles.profit_details_cost}>
            {fmt(cost)}
          </div>
        </div>
      </div>
    </div>
  );
}