"use client";

import { useState } from 'react';
import styles from './page.module.css';
import SalesChartFiltrable from '@/components/dashboard/Tables/SalesTableFiltrable/SalesTableFiltrable';


export default function Analytics() {
  const [status, setStatus] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [limit, setLimit] = useState(50);

  const STATUS_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'CONCLUIDA', label: 'Concluída' },
    { value: 'CANCELADA', label: 'Cancelada' },
    { value: 'PENDENTE', label: 'Pendente' },
  ];

  return (
    
    <div className={styles.content}>
      <div className={styles.product_chart_wrapper}>
        <div className={styles.chart_header}>
          <div className={styles.chart_label}>
            Vendas
          </div>

          <div className={styles.chart_filters}>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              placeholder="Data início"
            />
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              placeholder="Data fim"
            />
            
            <input
              type="number"
              value={limit}
              min={1}
              max={200}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ width: 80 }}
              placeholder="Limite"
            />
          </div>

        </div>

        
        <div className={styles.bar_chart}>
          <SalesChartFiltrable
            status={status}
            dataInicio={dataInicio}
            dataFim={dataFim}
            limit={limit}
          />
        </div>
      </div>
    </div>
  );
}
  