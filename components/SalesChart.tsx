'use client';

import { Chart, Filler, CategoryScale, PointElement, LinearScale, LineElement, Title, Tooltip, Legend, ScriptableContext } from 'chart.js';
import {Line} from 'react-chartjs-2'

Chart.register(Filler, CategoryScale, PointElement, LinearScale, LineElement, Title, Tooltip, Legend);




const data = {
  labels: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
  datasets: [
    {
      backgroundColor: (context: ScriptableContext<"line">) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, "#2276cbb0");
        gradient.addColorStop(1, "#2276cb08");
        return gradient;
      },
      label: 'Vendas',
      data: [20, 24, 28, 22, 22, 24, 24, 32],
      borderColor: '#2276cb',
      borderWidth: 5,
      tension: 0.3,
      fill: true,
      pointRadius: 0
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    tooltip: { enabled: false },
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

export default function SalesChart() {
  return <Line data={data} options={options} />;
}