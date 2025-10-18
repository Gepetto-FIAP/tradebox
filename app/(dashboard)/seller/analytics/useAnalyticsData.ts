// Hook customizado para buscar dados de analytics
import { useState, useEffect } from 'react';
import { AnalyticsMetrics, VendasPorPeriodo, TopProdutos } from '@/lib/types';
import { 
  getAnalyticsMetrics, 
  getVendasPorPeriodo, 
  getTopProdutos 
} from '@/lib/mockAnalytics';

interface UseAnalyticsDataReturn {
  loading: boolean;
  metrics: AnalyticsMetrics | null;
  vendasPeriodo: VendasPorPeriodo[];
  topProdutos: TopProdutos[];
  refetch: () => Promise<void>;
}

export function useAnalyticsData(): UseAnalyticsDataReturn {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [vendasPeriodo, setVendasPeriodo] = useState<VendasPorPeriodo[]>([]);
  const [topProdutos, setTopProdutos] = useState<TopProdutos[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as APIs em paralelo
      const [metricsRes, vendasRes, produtosRes] = await Promise.all([
        fetch('/api/analytics/metrics'),
        fetch('/api/analytics/vendas-periodo?periodo=7d'),
        fetch('/api/analytics/top-produtos?limite=5&periodo=30d'),
      ]);

      // Processar respostas
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
        console.log('✅ Métricas carregadas via API');
      }

      if (vendasRes.ok) {
        const vendasData = await vendasRes.json();
        setVendasPeriodo(vendasData);
        console.log('✅ Vendas por período carregadas via API');
      }

      if (produtosRes.ok) {
        const produtosData = await produtosRes.json();
        setTopProdutos(produtosData);
        console.log('✅ Top produtos carregados via API');
      }

      // Se alguma falhou, usa fallback
      if (!metricsRes.ok || !vendasRes.ok || !produtosRes.ok) {
        throw new Error('Erro em uma ou mais requisições');
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados via API, usando fallback:', error);
      
      // Fallback para funções mock
      setMetrics(getAnalyticsMetrics());
      setVendasPeriodo(getVendasPorPeriodo());
      setTopProdutos(getTopProdutos());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    loading,
    metrics,
    vendasPeriodo,
    topProdutos,
    refetch: fetchData,
  };
}
