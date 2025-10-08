
'use client';

import { useState } from 'react';
import styles from './analytics.module.css';
import CardData from '@/components/CardData/CardData';
import SalesChart from '@/components/SalesChart';
import { 
  BiDollar, 
  BiTrendingUp, 
  BiCart, 
  BiUser, 
  BiPackage, 
  BiStar,
  BiTime,
  BiBarChart,
  BiPieChart,
  BiRefresh
} from 'react-icons/bi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function Analytics() {
  const [timeFilter, setTimeFilter] = useState('7d');

  // Dados para os cards principais
  const mainMetrics = [
    { icon: <BiDollar />, label: 'Receita Total', value: 'R$ 47.250' },
    { icon: <BiCart />, label: 'Pedidos', value: '324' },
    { icon: <BiTrendingUp />, label: 'Crescimento', value: '+12.5%' },
    { icon: <BiUser />, label: 'Clientes Únicos', value: '189' }
  ];

  // Dados para cards secundários
  const secondaryMetrics = [
    { icon: <BiPackage />, label: 'Produtos Vendidos', value: '1.247' },
    { icon: <BiStar />, label: 'Avaliação Média', value: '4.8' },
    { icon: <BiTime />, label: 'Tempo Médio Entrega', value: '2.3 dias' },
    { icon: <BiBarChart />, label: 'Taxa de Conversão', value: '3.2%' }
  ];

  // Dados para gráfico de barras - Vendas por categoria
  const categoryData = {
    labels: ['Eletrônicos', 'Roupas', 'Casa', 'Esportes', 'Livros', 'Outros'],
    datasets: [
      {
        label: 'Vendas (R$)',
        data: [12500, 8900, 6700, 4200, 3100, 2300],
        backgroundColor: [
          'rgba(1, 181, 250, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(1, 181, 250, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Dados para gráfico de rosca - Status dos pedidos
  const orderStatusData = {
    labels: ['Entregue', 'Em Trânsito', 'Processando', 'Cancelado'],
    datasets: [
      {
        data: [68, 18, 10, 4],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(1, 181, 250, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(1, 181, 250, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Dados para gráfico de linha - Performance mensal
  const monthlyPerformanceData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Receita (R$)',
        data: [28000, 32000, 35000, 31000, 38000, 42000, 45000, 47000, 44000, 49000, 52000, 47250],
        borderColor: 'rgba(1, 181, 250, 1)',
        backgroundColor: 'rgba(1, 181, 250, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Pedidos',
        data: [145, 165, 180, 158, 195, 215, 230, 240, 225, 250, 265, 324],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Produtos mais vendidos
  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 45, revenue: 'R$ 67.500' },
    { name: 'Notebook Dell', sales: 32, revenue: 'R$ 48.000' },
    { name: 'Tênis Nike Air', sales: 28, revenue: 'R$ 8.400' },
    { name: 'Camiseta Basic', sales: 67, revenue: 'R$ 6.700' },
    { name: 'Fone Bluetooth', sales: 89, revenue: 'R$ 17.800' }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          },
          padding: 8
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          },
          padding: 8
        }
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: {
          font: {
            size: 10
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          },
          padding: 8
        }
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className={styles.analytics_container}>
      {/* Header com filtros */}
      <div className={styles.analytics_header}>
        <div className={styles.header_title}>
          <h1>Analytics Dashboard</h1>
          <p>Análise completa das suas vendas e performance</p>
        </div>
        <div className={styles.header_actions}>
          <div className={styles.time_filters}>
            {['7d', '30d', '90d', '1y'].map((filter) => (
              <button
                key={filter}
                className={`${styles.filter_btn} ${timeFilter === filter ? styles.active : ''}`}
                onClick={() => setTimeFilter(filter)}
              >
                {filter === '7d' ? '7 dias' : filter === '30d' ? '30 dias' : filter === '90d' ? '90 dias' : '1 ano'}
              </button>
            ))}
          </div>
          <button className={styles.refresh_btn}>
            <BiRefresh />
          </button>
        </div>
      </div>

      {/* Cards principais de métricas */}
      <div className={styles.main_metrics}>
        {mainMetrics.map((metric, index) => (
          <CardData
            key={index}
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>

      {/* Gráficos principais */}
      <div className={styles.main_charts}>
        {/* Gráfico de tendência de vendas */}
        <div className={styles.chart_card}>
          <div className={styles.chart_header}>
            <h3>Tendência de Vendas</h3>
            <p>R$ 47.250</p>
          </div>
          <div className={styles.sales_chart_container}>
            <SalesChart 
              colorStart="rgba(1, 181, 250, 0.3)"
              colorEnd="rgba(1, 181, 250, 0.05)"
              colorBorder="rgba(1, 181, 250, 1)"
            />
          </div>
        </div>

        {/* Performance mensal */}
        <div className={styles.chart_card}>
          <div className={styles.chart_header}>
            <h3>Performance Mensal</h3>
            <p>R$ 574.250</p>
          </div>
          <div className={styles.chart_content_large}>
            <Line data={monthlyPerformanceData} options={lineChartOptions} />
          </div>
        </div>

        {/* Status dos pedidos */}
        <div className={styles.chart_card}>
          <div className={styles.chart_header}>
            <h3>Status dos Pedidos</h3>
            <p>324 pedidos</p>
          </div>
          <div className={styles.chart_content}>
            <Doughnut data={orderStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Seção com gráficos de análise */}
      <div className={styles.secondary_section}>
        {/* Gráfico de vendas por categoria */}
        <div className={styles.chart_card}>
          <div className={styles.chart_header}>
            <h3>Vendas por Categoria</h3>
            <p>R$ 37.700</p>
          </div>
          <div className={styles.chart_content}>
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>

        {/* Top produtos */}
        <div className={styles.top_products}>
          <div className={styles.section_header}>
            <h3>Produtos Mais Vendidos</h3>
            <p>Top 5 produtos por receita</p>
          </div>
          <div className={styles.products_list}>
            {topProducts.map((product, index) => (
              <div key={index} className={styles.product_item}>
                <div className={styles.product_rank}>#{index + 1}</div>
                <div className={styles.product_info}>
                  <div className={styles.product_name}>{product.name}</div>
                  <div className={styles.product_stats}>
                    <span>{product.sales} vendas</span>
                    <span className={styles.product_revenue}>{product.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cards de métricas secundárias */}
        <div className={styles.secondary_metrics}>
          {secondaryMetrics.map((metric, index) => (
            <CardData
              key={index}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
            />
          ))}
        </div>
      </div>

      {/* Insights e alertas */}
      <div className={styles.insights_section}>
        <div className={styles.section_header}>
          <h3>Insights e Recomendações</h3>
        </div>
        <div className={styles.insights_grid}>
          <div className={styles.insight_card}>
            <BiTrendingUp className={styles.insight_icon} />
            <div className={styles.insight_content}>
              <h4>Crescimento Acelerado</h4>
              <p>Suas vendas cresceram 12.5% em relação ao período anterior. Continue investindo em marketing para manter o momentum.</p>
            </div>
          </div>
          <div className={styles.insight_card}>
            <BiPackage className={styles.insight_icon} />
            <div className={styles.insight_content}>
              <h4>Estoque Baixo</h4>
              <p>3 produtos estão com estoque baixo. Considere reabastecer para não perder vendas.</p>
            </div>
          </div>
          <div className={styles.insight_card}>
            <BiStar className={styles.insight_icon} />
            <div className={styles.insight_content}>
              <h4>Excelente Avaliação</h4>
              <p>Sua avaliação média de 4.8 está acima da média da plataforma. Parabéns!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  