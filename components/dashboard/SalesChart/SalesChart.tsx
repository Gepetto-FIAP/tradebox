'use client';

import { Chart, Filler, CategoryScale, PointElement, LinearScale, LineElement, Title, Tooltip, Legend, ScriptableContext, elements, ChartOptions } from 'chart.js';
import {Line} from 'react-chartjs-2'
import styles from './SalesChart.module.css';

Chart.register(Filler, CategoryScale, PointElement, LinearScale, LineElement, Title, Tooltip, Legend);

type SalesChartProps = {
  colorStart?: string;
  colorEnd?: string;
  colorBorder?: string;
  axis: {
    x: number[];
    y: string[];
  };
};

const options: ChartOptions<'line'> = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    tooltip: { enabled: true },
    legend: { display: false },
    title: { display: false },
  },  
  
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
};

export default function SalesChart({ colorStart, colorEnd, colorBorder, axis }: SalesChartProps) {

  const data = {
  labels: axis.y,
  datasets: [
    {
      backgroundColor: (context: ScriptableContext<"line">) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, colorStart || "#fff");
        gradient.addColorStop(1, colorEnd || "#fff");
        return gradient;
      },
      label: 'Vendas',
      data: axis.x,
      borderWidth: 2,
      borderColor: colorBorder,
      tension: 0.333,
      fill: true,
      pointRadius: axis.x.map((value) => (value === Math.max(...axis.x) ? 4 : 0)),
      pointBackgroundColor: "#fff",
      pointHoverRadius: 4,
      pointHoverBackgroundColor: colorBorder || "#000",
      pointBorderWidth: 0,
    },
  ],
  
};


  return (
    <>
    <div className={styles.chart_container}>
      <div className={styles.chart_content}>
        <div className={styles.card_label}>Vendas nos últimos 7 dias</div>
        <div className={styles.chart_value}>R$ 25.234,56</div>
      </div>
      <div className={styles.chart}>
        <Line data={data} options={options} />
      </div>
    </div>
    </>
  );
}