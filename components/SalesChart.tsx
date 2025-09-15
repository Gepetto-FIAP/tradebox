'use client';

import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril'],
  datasets: [
    {
      label: 'Vendas',
      data: [12, 19, 3, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Vendas por mês' },
  },
};

export default function SalesChart() {
  return <Bar data={data} options={options} />;
}