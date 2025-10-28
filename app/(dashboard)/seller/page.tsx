'use client';

import { useState, useEffect } from 'react';
import SalesChart from '@/components/dashboard/Charts/SalesChart/SalesChart'; 
import styles from './page.module.css';
import TrendingProducts from '@/components/dashboard/Tables/TrendingProducts/TrendingProducts'; 
import CardData from '@/components/dashboard/Cards/CardData/CardData';
import {BiCartAlt, BiDollar, BiBasket, BiPackage} from 'react-icons/bi';

interface DashboardMetrics {
  total_vendas: number;
  faturamento: number;
  vendas_7d: number;
  total_produtos: number;
  produtos_estoque_baixo: number;
  total_vendas_anterior: number;
  faturamento_anterior: number;
}

interface MonthlyPerformance {
  mes: string;
  qtd_pedidos: number;
  receita: number;
}

export default function Seller() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<{x: number[], y: string[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar métricas
        const metricsResponse = await fetch('/api/dashboard/metrics?periodo=30d');
        const metricsData = await metricsResponse.json();
        
        if (metricsData.success && metricsData.metrics) {
          setMetrics(metricsData.metrics);
        }
        
        // Buscar dados para o gráfico (últimos 7 dias)
        const dailySalesResponse = await fetch('/api/dashboard/daily-sales');
        const dailySalesData = await dailySalesResponse.json();
        
        if (dailySalesData.success && dailySalesData.dailySales) {
          // Criar array com os últimos 7 dias
          const last7Days = getLast7Days();
          const dailySalesMap = new Map(
            dailySalesData.dailySales.map((sale: any) => [sale.dia, sale.qtd_vendas])
          );
          
          // Preencher valores com 0 para dias sem vendas
          const dailyValues: number[] = last7Days.map((_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const dateStr = date.toISOString().split('T')[0];
            return (dailySalesMap.get(dateStr) as number) || 0;
          });
          
          setChartData({
            x: dailyValues,
            y: last7Days
          });
        }
        
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getLast7Days = () => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const result = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push(days[date.getDay()]);
    }
    
    return result;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) {
      if (current === 0) return '0%';
      return '+100%';
    }
    const percentage = ((current - previous) / previous) * 100;
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  if (loading || !metrics) {
    return (
      <div className={styles.content}>
        <div className={styles.loading}>Carregando dashboard...</div>
      </div>
    );
  }

  return ( 
    <>
      <div className={styles.content}> 
        <div className={styles.chart_wrapper}>
          {chartData && (
            <SalesChart
              colorStart={"#01b5fa70"} 
              colorEnd={"transparent"} 
              colorBorder={"#01b5fa"}
              value={formatCurrency(metrics.vendas_7d)}
              axis={chartData}
            />
          )}
        </div>
        <div className={styles.recent_orders_wrapper}>
          <div className={styles.orders_container}>
            <div className={styles.orders_content}>
              <div className={styles.card_label}>Produtos em alta</div>
            </div>
            <div className={styles.recent_orders}>
              <TrendingProducts/>
            </div>
          </div>
        </div>
        <div className={styles.cards_data_wrapper}>
          <div className={styles.cards_data}>
              <CardData 
                icon={<BiCartAlt/>} 
                label="Vendas" 
                value={metrics.total_vendas} 
                badge_value={calculatePercentage(metrics.total_vendas, metrics.total_vendas_anterior)} 
              />
              <CardData 
                icon={<BiDollar />} 
                label="Faturamento" 
                value={formatCurrency(metrics.faturamento)} 
                badge_value={calculatePercentage(metrics.faturamento, metrics.faturamento_anterior)} 
              />
              <CardData 
                icon={<BiBasket />} 
                label="Produtos" 
                value={metrics.total_produtos} 
                badge_value="Total" 
              />
              <CardData 
                icon={<BiPackage />} 
                label="Estoque Baixo" 
                value={metrics.produtos_estoque_baixo} 
                badge_value={metrics.produtos_estoque_baixo > 0 ? 'Atenção' : 'OK'} 
              />
          </div>
        </div>
      </div>
    </>
  );

}
