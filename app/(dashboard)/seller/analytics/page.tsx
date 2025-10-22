'use client';

import { useState } from 'react';
import styles from './page.module.css';
import CardData from '@/components/dashboard/CardData/CardData';
import SalesChart from '@/components/dashboard/SalesChart/SalesChart';
import { BiDollar, BiCart, BiUser, BiRefresh } from 'react-icons/bi';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useAnalyticsData } from './useAnalyticsData';
import { 
  lineChartOptions, 
  barChartOptions, 
  doughnutOptions, 
  createVendasChartData, 
  createProdutosChartData, 
  createStatusChartData 
} from './chartConfigs';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export default function Analytics() {
  const { loading, metrics, vendasPeriodo, topProdutos } = useAnalyticsData();

  if (loading || !metrics) {
    return (
      <div className={styles.loading}>
        <BiRefresh className={styles.loadingIcon} />
        <p>Carregando...</p>
      </div>
    );
  }

  // Métricas principais
  const mainMetrics = [
    { 
      icon: <BiDollar />, 
      label: 'Receita Total', 
      value: `R$ ${metrics.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      badge_value: `+${metrics.crescimento_percentual}%`
    },
    { 
      icon: <BiCart />, 
      label: 'Total de Vendas', 
      value: metrics.total_vendas.toString(),
      badge_value: '+8 hoje'
    },
    { 
      icon: <BiUser />, 
      label: 'Clientes Únicos', 
      value: metrics.clientes_unicos.toString(),
      badge_value: '+12.5%'
    }
  ];

  // Dados dos gráficos usando funções utilitárias
  const vendasData = createVendasChartData(vendasPeriodo);
  const produtosData = createProdutosChartData(topProdutos);
  const statusData = createStatusChartData(metrics.produtos_vendidos);

  return (
    <div className={styles.container}>
      {/* Métricas principais */}
      <div className={styles.metricsGrid}>
        {mainMetrics.map((metric, index) => (
          <CardData 
            key={index}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            badge_value={metric.badge_value}
          />
        ))}
      </div>

      {/* Gráficos */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>Vendas por Período</h3>
          <div className={styles.chartContainer}>
            <Line data={vendasData} options={lineChartOptions} />
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <h3>Top Produtos Vendidos</h3>
          <div className={styles.chartContainer}>
            <Bar data={produtosData} options={barChartOptions} />
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <h3>Status dos Produtos</h3>
          <div className={styles.chartContainer}>
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </div>

        <div className={styles.summaryCard}>
          <h3>Resumo do Período</h3>
          <div className={styles.summaryContent}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Ticket Médio</span>
              <span className={styles.summaryValue}>R$ {metrics.ticket_medio.toFixed(2)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Produtos Vendidos</span>
              <span className={styles.summaryValue}>{metrics.produtos_vendidos}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Crescimento</span>
              <span className={styles.summaryValue}>+{metrics.crescimento_percentual}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}