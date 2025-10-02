"use client";
import SalesChart from '@/components/SalesChart';
import styles from './analytics.module.css';
import CardData from '@/components/CardData/CardData';
import { BiCartAlt, BiDollar, BiLineChart, BiBasket } from 'react-icons/bi';
import { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import BottomNav from '@/components/BottomNav/BottomNav';
import { saveAs } from 'file-saver';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

interface TableRow {
  id: number;
  date: string;
  retailer: string;
  product: string;
  quantity: number;
  total: number;
}

const initialData: TableRow[] = [
  { id: 1, date: '2025-09-01', retailer: 'Fábrica A', product: 'Widget A', quantity: 10, total: 120 },
  { id: 2, date: '2025-09-02', retailer: 'Fábrica B', product: 'Widget B', quantity: 5, total: 60 },
  { id: 3, date: '2025-09-03', retailer: 'Fábrica C', product: 'Widget A', quantity: 8, total: 96 },
  { id: 4, date: '2025-09-03', retailer: 'Fábrica E', product: 'Widget D', quantity: 12, total: 125 },
  { id: 5, date: '2025-09-05', retailer: 'Fábrica A', product: 'Widget C', quantity: 11, total: 110 },
  { id: 6, date: '2025-09-01', retailer: 'Fábrica A', product: 'Widget A', quantity: 5, total: 60 },
  { id: 7, date: '2025-09-02', retailer: 'Fábrica B', product: 'Widget D', quantity: 16, total: 150 },
  { id: 8, date: '2025-09-03', retailer: 'Fábrica C', product: 'Widget A', quantity: 8, total: 96 },
  { id: 9, date: '2025-09-03', retailer: 'Fábrica B', product: 'Widget D', quantity: 14, total: 130 },
  { id: 10, date: '2025-09-05', retailer: 'Fábrica E', product: 'Widget C', quantity: 14, total: 110 },
];

export default function IndustryAnalytics() {
  const [filter, setFilter] = useState({ date: '', retailer: '', product: '' });
  const filteredData: TableRow[] = initialData.filter(row =>
    (!filter.date || row.date === filter.date) &&
    (!filter.retailer || row.retailer.toLowerCase().includes(filter.retailer.toLowerCase())) &&
    (!filter.product || row.product.toLowerCase().includes(filter.product.toLowerCase()))
  );

  // Indicadores para os cards
  const totalUnits = filteredData.reduce((sum, r) => sum + r.quantity, 0);
  const activeRetailers = new Set(filteredData.map(r => r.retailer)).size;
  const productSales: Record<string, number> = {};
  filteredData.forEach(r => {
    productSales[r.product] = (productSales[r.product] || 0) + r.quantity;
  });
  const bestProduct = Object.entries(productSales).reduce((best, [prod, qty]) => qty > best.qty ? { prod, qty } : best, { prod: '', qty: 0 }).prod;
  const totalRevenue = filteredData.reduce((sum, r) => sum + r.total, 0);

  function exportToCSV(data: TableRow[]) {
    const header = ['Data', 'Industria', 'Produto', 'Quantidade', 'Valor Total'];
    const rows = data.map(row => [row.date, row.retailer, row.product, row.quantity, row.total]);
    const csvContent = [header, ...rows]
      .map(e => e.map(String).map(v => '"' + v.replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `relatorio-industry-${new Date().toISOString().slice(0,10)}.csv`);
  }

  // Gráfico de linha: vendas por dia
  const lineData = {
    labels: filteredData.map(r => r.date),
    datasets: [{
      label: 'Vendas por dia',
      data: filteredData.map(r => r.quantity),
      borderColor: '#01b5fa',
      backgroundColor: '#01b5fa70',
      tension: 0.3,
    }],
  };
  const lineOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Quantidade: ${ctx.parsed.y}`,
        },
      },
    },
  };

  // Gráfico de barras: produtos mais vendidos
  const barData = {
    labels: Object.keys(productSales),
    datasets: [{
      label: 'Produtos mais vendidos',
      data: Object.values(productSales),
      backgroundColor: '#01b5fa70',
      borderColor: '#01b5fa',
      borderWidth: 1,
    }],
  };
  const barOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Qtd: ${ctx.parsed.y} | Produto: ${ctx.label}`,
        },
      },
    },
  };

  // Gráfico de barras: faturamento por produto
  const revenueByProduct: Record<string, number> = {};
  filteredData.forEach(r => {
    revenueByProduct[r.product] = (revenueByProduct[r.product] || 0) + r.total;
  });
  const revenueBarData = {
    labels: Object.keys(revenueByProduct),
    datasets: [{
      label: 'Faturamento por produto',
      data: Object.values(revenueByProduct),
      backgroundColor: '#00384d70',
      borderColor: '#00384d',
      borderWidth: 1,
    }],
  };
  const revenueBarOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (ctx: any) => `R$ ${ctx.parsed.y} | Produto: ${ctx.label}`,
        },
      },
    },
  };

  return (
    <div className={styles.fullBg}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.greeting}>Dashboard Indústria</div>
          <div className={styles.name}>Bem-vindo!</div>
        </div>
        <div className={styles.cards_data_wrapper}>
          <div className={styles.cards_data}>
            <CardData icon={<BiCartAlt />} label="Produtos Cadastrados" value={245} />
            <CardData icon={<BiDollar />} label="Faturamento" value={"R$ 41.789"} />
            <CardData icon={<BiLineChart />} label="Linhas de Produção" value={8} />
            <CardData icon={<BiBasket />} label="Parceiros" value={32} />
          </div>
        </div>
        <div className={styles.filters}>
          <input type="date" value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} className={styles.filterInput} />
          <input type="text" placeholder="Industria" value={filter.retailer} onChange={e => setFilter(f => ({ ...f, retailer: e.target.value }))} className={styles.filterInput} />
          <input type="text" placeholder="Produto" value={filter.product} onChange={e => setFilter(f => ({ ...f, product: e.target.value }))} className={styles.filterInput} />
          <button className={styles.filterButton} onClick={() => setFilter({ date: '', retailer: '', product: '' })}>Limpar filtros</button>
          <button className={styles.filterButton} style={{background:'#00384d'}} onClick={() => exportToCSV(filteredData)}>Exportar CSV</button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Industria</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>Nenhum resultado encontrado.</td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id + '-' + row.date + '-' + row.product}>
                    <td>{row.date}</td>
                    <td>{row.retailer}</td>
                    <td>{row.product}</td>
                    <td>{row.quantity}</td>
                    <td>R$ {row.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ height: 16 }} />
        <div className={styles.charts}>
          <div className={styles.chartBox}><Line data={lineData} options={lineOptions} /></div>
          <div className={styles.chartBox}><Bar data={barData} options={barOptions} /></div>
          <div className={styles.chartBox}><Bar data={revenueBarData} options={revenueBarOptions} /></div>
        </div>
        <div style={{ height: 50 }} />
        <BottomNav/>
      </div>
    </div>
  );
}