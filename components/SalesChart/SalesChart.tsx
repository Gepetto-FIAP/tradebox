'use client';

import { Chart, Filler, CategoryScale, PointElement, LinearScale, LineElement, Title, Tooltip, Legend, ScriptableContext, elements } from 'chart.js';
import {Line} from 'react-chartjs-2'

Chart.register(Filler, CategoryScale, PointElement, LinearScale, LineElement, Title, Tooltip, Legend);

type SalesChartProps = {
  colorStart?: string;
  colorEnd?: string;
  colorBorder?: string; 
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
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

const axisX = [15, 22, 17, 20, 24, 27, 24];
const axisY = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export default function SalesChart({ colorStart, colorEnd, colorBorder }: SalesChartProps) {

  const data = {
  labels: axisY,
  datasets: [
    {
      backgroundColor: (context: ScriptableContext<"line">) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        gradient.addColorStop(0, colorStart || "#fff");
        gradient.addColorStop(1, colorEnd || "#fff");
        return gradient;
      },
      label: 'Vendas',
      data: axisX,
      borderWidth: 2,
      borderColor: colorBorder,
      tension: 0.333,
      fill: true,
      pointRadius: axisX.map((value) => (value === Math.max(...axisX) ? 4 : 0)),
      pointBackgroundColor: "#fff",
      pointHoverRadius: 4,
      pointHoverBackgroundColor: colorBorder || "#000",
      pointBorderWidth: 0,
    },
  ],
};


  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  );
}