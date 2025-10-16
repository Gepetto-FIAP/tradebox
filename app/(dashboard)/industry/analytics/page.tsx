"use client";
import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';
import styles from './analytics.module.css';
import CardData from '@/components/CardData/CardData';
import { BiCartAlt, BiDollar, BiLineChart, BiBasket } from 'react-icons/bi';
import BottomNav from '@/components/BottomNav/BottomNav';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// Types
interface AnalyticsData {
  summary: {
    totalProducts: number;
    totalRevenue: number;
    activeRetailers: number;
    totalSales: number;
  };
  salesByDay: Array<{ date: string; sales: number; revenue: number }>;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  salesByRetailer: Array<{ retailer: string; sales: number; revenue: number }>;
}

// Mock Data
const mockData: AnalyticsData = {
  summary: {
    totalProducts: 245,
    totalRevenue: 41789,
    activeRetailers: 32,
    totalSales: 1847
  },
  salesByDay: [
    { date: '10/10', sales: 120, revenue: 4500 },
    { date: '10/11', sales: 145, revenue: 5200 },
    { date: '10/12', sales: 98, revenue: 3800 },
    { date: '10/13', sales: 167, revenue: 6100 },
    { date: '10/14', sales: 134, revenue: 4900 },
    { date: '10/15', sales: 189, revenue: 7200 }
  ],
  topProducts: [
    { name: 'Widget Premium', sales: 234, revenue: 12500 },
    { name: 'Widget Standard', sales: 189, revenue: 8900 },
    { name: 'Widget Eco', sales: 145, revenue: 6700 },
    { name: 'Widget Pro', sales: 98, revenue: 5600 }
  ],
  salesByRetailer: [
    { retailer: 'SuperMercado ABC', sales: 89, revenue: 4200 },
    { retailer: 'Loja Premium', sales: 67, revenue: 3800 },
    { retailer: 'Rede Varejo', sales: 123, revenue: 5900 },
    { retailer: 'Mercado Central', sales: 45, revenue: 2100 }
  ]
};

export default function IndustryAnalytics() {
  const [data, setData] = useState<AnalyticsData>(mockData);
  const [loading, setLoading] = useState(false);

  // Fetch Analytics Data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // TODO: Descomentar quando a API estiver pronta
      /*
      const response = await fetch('/api/industry/analytics');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Erro da API:', result.message);
        setData(mockData); // Fallback para mock data
      }
      */
      
      // MODO DESENVOLVIMENTO: Usando mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simula latência
      setData(mockData);
      
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setData(mockData); // Fallback em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Preparar dados para gráficos
  const salesChartData = {
    labels: data.salesByDay.map(item => item.date),
    datasets: [{
      label: 'Vendas por Dia',
      data: data.salesByDay.map(item => item.sales),
      borderColor: '#01b5fa',
      backgroundColor: '#01b5fa30',
      tension: 0.4,
    }]
  };

  const productsChartData = {
    labels: data.topProducts.map(item => item.name),
    datasets: [{
      label: 'Produtos Mais Vendidos',
      data: data.topProducts.map(item => item.sales),
      backgroundColor: ['#01b5fa', '#00384d', '#87ceeb', '#4a90e2'],
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  if (loading) {
    return (
      <div className={styles.fullBg}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Carregando analytics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullBg}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.greeting}>Analytics Indústria</div>
          <div className={styles.name}>Dashboard Completo</div>
        </div>

        {/* KPIs Cards */}
        <div className={styles.cards_data_wrapper}>
          <div className={styles.cards_data}>
            <CardData 
              icon={<BiCartAlt />} 
              label="Produtos" 
              value={data.summary.totalProducts} 
            />
            <CardData 
              icon={<BiDollar />} 
              label="Faturamento" 
              value={`R$ ${(data.summary.totalRevenue / 1000).toFixed(1)}k`} 
            />
            <CardData 
              icon={<BiLineChart />} 
              label="Vendas" 
              value={data.summary.totalSales} 
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className={styles.charts}>
          <div className={styles.chartBox}>
            <h3>Vendas por Dia</h3>
            <div style={{ height: '250px' }}>
              <Line data={salesChartData} options={chartOptions} />
            </div>
          </div>
          
          <div className={styles.chartBox}>
            <h3>Top Produtos</h3>
            <div style={{ height: '250px' }}>
              <Bar data={productsChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        <section>

          <div className={styles.tableWrapper}>
            <h3>🏪 Top Varejistas</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Varejista</th>
                  <th>Vendas</th>
                  <th>Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {data.salesByRetailer.map((item, index) => (
                  <tr key={index}>
                    <td>{item.retailer}</td>
                    <td>{item.sales} unidades</td>
                    <td>R$ {item.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ height: 40 }} />
        <BottomNav/>
      </div>
    </div>
  );
}