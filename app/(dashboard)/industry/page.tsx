'use client';

import { useState, useEffect } from 'react';
import PricingInsightsWidget from '@/components/dashboard/Cards/PricingInsightsWidget/PricingInsightsWidget';
import styles from './page.module.css';
import Table from '@/components/ui/Table/Table';
import CardData from '@/components/dashboard/Cards/CardData/CardData';
import { BiStoreAlt, BiBasket, BiLineChart, BiDollar } from "react-icons/bi";

type Period = '7d' | '30d' | '90d';

interface MetricsData {
  total_produtos: number;
  crescimento_produtos: number;
  total_vendedores: number;
  crescimento_vendedores: number;
  receita_gerada: number;
  crescimento_receita: number;
}

interface Seller {
  vendedor: string;
  receita: number;
}

export default function IndustryDashboard() {
  const [periodo, setPeriodo] = useState<Period>('30d');
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch metrics
        const metricsResponse = await fetch(`/api/industry/dashboard/metrics?periodo=${periodo}`);
        if (metricsResponse.ok) {
          const metricsResult = await metricsResponse.json();
          setMetrics(metricsResult.metrics);
        }

        // Fetch sellers performance
        const sellersResponse = await fetch(`/api/industry/dashboard/sellers-performance?periodo=${periodo}&limit=10`);
        if (sellersResponse.ok) {
          const sellersResult = await sellersResponse.json();
          setSellers(sellersResult.sellers || []);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo]);

  // Campanhas mockadas baseadas no período
  const getCampaigns = (period: Period): { value: number; growth: number } => {
    const campaignMap: Record<Period, { value: number; previousValue: number }> = {
      '7d': { value: 2, previousValue: 1 },
      '30d': { value: 9, previousValue: 6 },
      '90d': { value: 25, previousValue: 18 }
    };
    
    const data = campaignMap[period];
    const growth = data.previousValue > 0 
      ? Math.round(((data.value - data.previousValue) / data.previousValue) * 100)
      : 100;
    
    return { value: data.value, growth };
  };

  const campaigns = getCampaigns(periodo);

  // Formatar valor de crescimento
  const formatGrowth = (growth: number): string => {
    if (growth === 0) return '0%';
    return growth > 0 ? `+${growth}%` : `${growth}%`;
  };

  // Formatar moeda
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const columns = [
    {
      key: 'rank',
      header: 'Rank',
      render: (value: number) => `#${value}`
    },
    {
      key: 'vendedor',
      header: 'Vendedor'
    },
    {
      key: 'receita',
      header: 'Faturamento',
      render: (value: number) => 
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }
  ];

  const sellersWithRank = sellers.map((seller, index) => ({
    ...seller,
    rank: index + 1
  }));

  return (
    <>
      {/* Period Toggle - Positioned in top right */}
      <div className={styles.period_toggle}>
        <button
          onClick={() => setPeriodo('7d')}
          className={periodo === '7d' ? styles.active : ''}
        >
          7 dias
        </button>
        <button
          onClick={() => setPeriodo('30d')}
          className={periodo === '30d' ? styles.active : ''}
        >
          30 dias
        </button>
        <button
          onClick={() => setPeriodo('90d')}
          className={periodo === '90d' ? styles.active : ''}
        >
          90 dias
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.sellers_wrapper}>
        <div className={styles.table_header}>
          Vendedores em alta
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>
        ) : sellers.length > 0 ? (
          <Table columns={columns} data={sellersWithRank} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Sem dados para o período</div>
        )}
      </div>

      <div className={styles.profit_wrapper}>
        <PricingInsightsWidget />
      </div>

      <div className={styles.cards_data_wrapper}>
        {loading || !metrics ? (
          <>
            <CardData icon={<BiStoreAlt />} label="Sellers" value="--" badge_value="--" />
            <CardData icon={<BiBasket />} label="Produtos" value="--" badge_value="--" />
            <CardData icon={<BiDollar />} label="Faturamento" value="--" badge_value="--" />
            <CardData icon={<BiLineChart />} label="Campanhas" value="--" badge_value="--" />
          </>
        ) : (
          <>
            <CardData 
              icon={<BiStoreAlt />} 
              label="Sellers" 
              value={metrics.total_vendedores} 
              badge_value={formatGrowth(metrics.crescimento_vendedores)} 
            />
            <CardData 
              icon={<BiBasket />} 
              label="Produtos" 
              value={metrics.total_produtos} 
              badge_value={formatGrowth(metrics.crescimento_produtos)} 
            />
            <CardData 
              icon={<BiDollar />} 
              label="Faturamento" 
              value={formatCurrency(metrics.receita_gerada)} 
              badge_value={formatGrowth(metrics.crescimento_receita)} 
            />
            <CardData 
              icon={<BiLineChart />} 
              label="Campanhas" 
              value={campaigns.value} 
              badge_value={formatGrowth(campaigns.growth)} 
            />
          </>
        )}
      </div>
      </div>
    </>
  );
}
