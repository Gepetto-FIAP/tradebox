// Configurações centralizadas dos gráficos
import { ChartOptions } from 'chart.js';

// Cores da aplicação
export const CHART_COLORS = {
  primary: '#01b5fa',
  primaryRgba: (alpha: number) => `rgba(1, 181, 250, ${alpha})`,
  background: 'rgba(0, 56, 77, 0.95)',
  border: '#01b5fa',
  text: '#ffffff',
  secondary: '#e0e0e0',
};

// Configuração base compartilhada
const baseConfig = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: CHART_COLORS.background,
      titleColor: CHART_COLORS.primary,
      bodyColor: CHART_COLORS.text,
      borderColor: CHART_COLORS.border,
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      padding: 8,
      titleFont: {
        size: 11,
        weight: 'bold' as const,
      },
      bodyFont: {
        size: 10,
      },
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: false,
      },
      beginAtZero: true,
    },
  },
  layout: {
    padding: {
      top: 5,
      bottom: 5,
      left: 5,
      right: 5,
    },
  },
};

// Configurações do gráfico Line
export const lineChartOptions: ChartOptions<'line'> = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 8,
        font: {
          size: 10,
          family: 'inherit',
        },
        color: CHART_COLORS.secondary,
        boxWidth: 8,
        boxHeight: 8,
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
        color: 'rgba(224, 224, 224, 0.1)',
      },
      ticks: {
        color: CHART_COLORS.secondary,
        font: {
          size: 9,
        },
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(224, 224, 224, 0.1)',
      },
      ticks: {
        color: CHART_COLORS.secondary,
        font: {
          size: 9,
        },
      },
      beginAtZero: true,
    },
  },
  elements: {
    point: {
      radius: 3,
      hoverRadius: 6,
      hitRadius: 10,
    },
    line: {
      borderWidth: 2,
    },
  },
};

// Configurações do gráfico Bar
export const barChartOptions: ChartOptions<'bar'> = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 8,
        font: {
          size: 10,
          family: 'inherit',
        },
        color: CHART_COLORS.secondary,
        boxWidth: 8,
        boxHeight: 8,
      },
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
        color: 'rgba(224, 224, 224, 0.1)',
      },
      ticks: {
        color: CHART_COLORS.secondary,
        font: {
          size: 9,
        },
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      display: true,
      grid: {
        display: true,
        color: 'rgba(224, 224, 224, 0.1)',
      },
      ticks: {
        color: CHART_COLORS.secondary,
        font: {
          size: 9,
        },
        precision: 0,
      },
      beginAtZero: true,
    },
  },
  elements: {
    bar: {
      borderRadius: 4,
    },
  },
};

// Configurações do gráfico Doughnut
export const doughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 8,
        font: {
          size: 9,
          family: 'inherit',
        },
        color: CHART_COLORS.secondary,
        boxWidth: 6,
        boxHeight: 6,
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels && data.datasets.length) {
            const dataset = data.datasets[0];
            const total = (dataset.data as number[]).reduce((acc, val) => acc + val, 0);
            
            return data.labels.map((label, i) => {
              const value = (dataset.data as number[])[i];
              const percentage = ((value / total) * 100).toFixed(1);
              
              return {
                text: `${label}: ${percentage}%`,
                fillStyle: Array.isArray(dataset.backgroundColor) 
                  ? dataset.backgroundColor[i] 
                  : dataset.backgroundColor,
                hidden: false,
                index: i,
                strokeStyle: Array.isArray(dataset.borderColor) ? dataset.borderColor[i] : dataset.borderColor,
                lineWidth: 2,
                fontColor: CHART_COLORS.secondary,
              };
            });
          }
          return [];
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: CHART_COLORS.background,
      titleColor: CHART_COLORS.primary,
      bodyColor: CHART_COLORS.text,
      borderColor: CHART_COLORS.border,
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      padding: 8,
      titleFont: {
        size: 11,
        weight: 'bold',
      },
      bodyFont: {
        size: 10,
      },
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed;
          const dataset = context.dataset;
          const total = (dataset.data as number[]).reduce((acc: number, val) => acc + (val as number), 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
  cutout: '60%',
  layout: {
    padding: {
      top: 10,
      bottom: 5,
      left: 10,
      right: 10,
    },
  },
};

// Função para criar dados do gráfico de vendas
export const createVendasChartData = (vendasPeriodo: { periodo: string; vendas: number }[]) => ({
  labels: vendasPeriodo.map(item => item.periodo),
  datasets: [{
    label: 'Número de Vendas',
    data: vendasPeriodo.map(item => item.vendas),
    borderColor: CHART_COLORS.primary,
    backgroundColor: CHART_COLORS.primaryRgba(0.1),
    tension: 0.4,
    fill: true,
    pointBackgroundColor: CHART_COLORS.primary,
    pointBorderColor: '#ffffff',
    pointBorderWidth: 2,
    pointRadius: 2,
    pointHoverRadius: 5,
    borderWidth: 2,
  }],
});

// Função para criar dados do gráfico de produtos
export const createProdutosChartData = (topProdutos: { nome_produto: string; quantidade_vendida: number }[]) => ({
  labels: topProdutos.slice(0, 5).map(p => {
    const nome = p.nome_produto;
    return nome.length > 15 ? nome.substring(0, 15) + '...' : nome;
  }),
  datasets: [{
    label: 'Quantidade Vendida',
    data: topProdutos.slice(0, 5).map(p => p.quantidade_vendida),
    backgroundColor: [
      CHART_COLORS.primaryRgba(1),
      CHART_COLORS.primaryRgba(0.8),
      CHART_COLORS.primaryRgba(0.6),
      CHART_COLORS.primaryRgba(0.4),
      CHART_COLORS.primaryRgba(0.2),
    ],
    borderColor: CHART_COLORS.primary,
    borderWidth: 0,
    borderRadius: 4,
    barThickness: 'flex' as const,
    maxBarThickness: 50,
  }],
});

// Função para criar dados do gráfico de status
export const createStatusChartData = (produtosVendidos: number) => ({
  labels: ['Produtos Vendidos', 'Em Estoque', 'Baixo Estoque'],
  datasets: [{
    data: [produtosVendidos, 150, 25],
    backgroundColor: [
      CHART_COLORS.primaryRgba(1),
      CHART_COLORS.primaryRgba(0.5),
      'rgba(224, 224, 224, 0.8)',
    ],
    borderWidth: 2,
    borderColor: 'rgba(0, 56, 77, 0.5)',
    hoverBackgroundColor: [
      CHART_COLORS.primaryRgba(0.9),
      CHART_COLORS.primaryRgba(0.4),
      'rgba(224, 224, 224, 0.6)',
    ],
    hoverBorderWidth: 3,
    hoverBorderColor: CHART_COLORS.primary,
  }],
});
