'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BiShow, BiTrendingDown } from 'react-icons/bi';
import Modal from '@/components/ui/Modal/Modal';
import Table from '@/components/ui/Table/Table';
import styles from './ProfitCard.module.css';

interface ProductSuggestion {
  produto_id: number;
  nome: string;
  gtin: string;
  vendedor: string;
  preco_custo_atual: number;
  preco_base: number;
  margem_atual: number;
  preco_custo_sugerido: number;
  margem_alvo: number;
  reducao_necessaria: number;
}

interface PricingInsightsData {
  total_produtos_baixa_margem: number;
  margem_media_atual: number;
  margem_alvo: number;
  sugestoes: ProductSuggestion[];
}

interface Props {
  margem_maxima?: number;
  margem_alvo?: number;
}

export default function ProfitCard({
  margem_maxima = 15, 
  margem_alvo = 25 
}: Props) {
  const [data, setData] = useState<PricingInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{[key: string]: any}>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [margemAlvoAtual, setMargemAlvoAtual] = useState(margem_alvo);
  const [margemAlvoInput, setMargemAlvoInput] = useState(margem_alvo.toString());
  const [showModal, setShowModal] = useState(false);
  
  const PRODUCTS_PER_PAGE = 4;

  const fetchData = async (customMargemAlvo?: number) => {
    try {
      setLoading(true);
      setError(null);

      const targetMargemAlvo = customMargemAlvo !== undefined ? customMargemAlvo : margemAlvoAtual;
      const url = `/api/industry/dashboard/pricing-insights?margem_maxima=${margem_maxima}&margem_alvo=${targetMargemAlvo}&limit=100`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.insights) {
        setData(result.insights);
        setCurrentPage(0); // Resetar para primeira página
        
        // Inicializar valores de edição
        const initialValues: {[key: string]: any} = {};
        result.insights.sugestoes.forEach((product: ProductSuggestion) => {
          const currentCost = product.preco_custo_atual;
          initialValues[`${product.produto_id}-preco_custo`] = 
            (currentCost && typeof currentCost === 'number') ? currentCost : 0;
        });
        setEditingValues(initialValues);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (err) {
      console.error('Erro ao buscar pricing insights:', err);
      setError('Erro ao carregar insights de precificação');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [margem_maxima]);

  // Debounce para atualizar margem alvo
  useEffect(() => {
    const timer = setTimeout(() => {
      const numValue = parseFloat(margemAlvoInput);
      if (!isNaN(numValue) && numValue > 0 && numValue !== margemAlvoAtual) {
        setMargemAlvoAtual(numValue);
        fetchData(numValue);
      }
    }, 1200); // 1200ms de delay após parar de digitar

    return () => clearTimeout(timer);
  }, [margemAlvoInput]);

  const updateProductCost = async (productId: number, newCost: number) => {
    if (updating !== null) return;

    try {
      setUpdating(productId);
      
      const response = await fetch(`/api/industry/products/${productId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preco_custo: newCost })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || 'Erro ao atualizar preço de custo');
      }
      
      // Recarregar dados após atualização bem-sucedida
      await fetchData();
      
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      alert(error.message || 'Erro ao atualizar preço de custo. Tente novamente.');
      
      // Restaurar valor anterior
      if (data) {
        const product = data.sugestoes.find(p => p.produto_id === productId);
        if (product) {
          const currentCost = product.preco_custo_atual;
          setEditingValues(prev => ({
            ...prev,
            [`${productId}-preco_custo`]: (currentCost && typeof currentCost === 'number') ? currentCost : 0
          }));
        }
      }
    } finally {
      setUpdating(null);
    }
  };

  const handleCostChange = (productId: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateProductCost(productId, numValue);
    }
  };

  const handleInputChange = (productId: number, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [`${productId}-preco_custo`]: value
    }));
  };

  if (error) {
    return (
      <div className={styles.pricing_container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  const hasLowMarginProducts = (data?.total_produtos_baixa_margem ?? 0) > 0;
  
  // Paginação
  const totalPages = data ? Math.ceil(data.sugestoes.length / PRODUCTS_PER_PAGE) : 0;
  const startIndex = currentPage * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = data ? data.sugestoes.slice(startIndex, endIndex) : [];
  
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // Função para calcular cor baseada na relação margem atual vs margem alvo
  const getColorByMarginRatio = (currentMargin: number, targetMargin: number) => {
    const ratio = currentMargin / targetMargin;
    
    if (ratio >= 1.2) return '#10b981'; // Verde - Muito acima da meta (120%+)
    if (ratio >= 1.0) return '#3b82f6'; // Azul - Atingiu ou superou a meta (100%+)
    if (ratio >= 0.7) return '#f59e0b'; // Laranja - Próximo da meta (70%+)
    return '#ef4444'; // Vermelho - Muito abaixo da meta (<70%)
  };

  // Calcular a cor e intensidade de cada square
  const getSquareColor = (index: number, currentMargin: number, targetMargin: number) => {
    const baseColor = getColorByMarginRatio(currentMargin, targetMargin);
    const intensity = Math.min(1, Math.max(0.1, (currentMargin - index * (targetMargin / 20)) / (targetMargin / 20)));
    
    // Converter hex para RGB e aplicar opacidade
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${intensity})`;
  };

  const currentMargin = data?.margem_media_atual ?? 0;

  // Função para formatar moeda
  const formatCurrency = (value: number): string => {
    const numValue = (value && typeof value === 'number' && !isNaN(value)) ? value : 0;
    return numValue.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Colunas para a tabela de produtos com margem baixa
  const lowMarginColumns = [
    {
      key: 'nome',
      header: 'Produto',
      render: (value: string, row: ProductSuggestion) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{value}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>
            GTIN: {row.gtin}
          </div>
        </div>
      )
    },
    {
      key: 'vendedor',
      header: 'Vendedor',
      render: (value: string) => (
        <span style={{ fontSize: '0.85rem' }}>{value}</span>
      )
    },
    {
      key: 'margem_atual',
      header: 'Margem',
      render: (value: number) => {
        const margin = (value && typeof value === 'number') ? value : 0;
        return (
          <span style={{ 
            color: margin < 5 ? '#ef4444' : margin < 15 ? '#f59e0b' : '#10b981',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            {margin.toFixed(1)}%
          </span>
        );
      }
    },
    {
      key: 'preco_custo_atual',
      header: 'Custo',
      render: (value: number) => {
        const cost = (value && typeof value === 'number') ? value : 0;
        return (
          <span style={{ fontSize: '0.85rem' }}>{formatCurrency(cost)}</span>
        );
      }
    },
    {
      key: 'preco_base',
      header: 'Preço Seller',
      render: (value: number) => {
        const price = (value && typeof value === 'number') ? value : 0;
        return (
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formatCurrency(price)}</span>
        );
      }
    }
  ];
  return (
    <div className={styles.profit_container}>
      <div className={styles.profit_label}>
        Detalhes do lucro
      </div>

      <div className={styles.profit_details}>

       
        <div className={styles.profit_details_chart}>
          <div className={styles.profit_details_info}>
            <div className={ styles.profit_details_margin}>



              <div className={styles.profit_details_target_margin}>
                <div className={styles.profit_details_percentage}>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={margemAlvoInput}
                    onChange={(e) => setMargemAlvoInput(e.target.value)}
                    className={styles.margem_input}
                    disabled={loading}
                />

                <span>
                  %
                </span>
                </div>
                <div className={styles.profit_details_text}>
                  Margem alvo
                </div>
              </div>

              <div className={styles.profit_details_divider}>
                /
              </div>

              <div className={styles.profit_details_current_margin}>
                <div className={styles.profit_details_percentage}>
                  {(data?.margem_media_atual ?? 0).toFixed(1)}%
                </div>
                <div className={styles.profit_details_text}>
                  Margem atual
                </div>
              </div>

            </div>


          </div>

          <div className={styles.profit_details_squares}>
            {
              Array.from({ length: 20 }, (_, i) => {
                const angle = 180 + i * (360 / 38);
                const squareColor = getSquareColor(i, currentMargin, margemAlvoAtual);
                const opacity = Math.min(1, Math.max(0.075, ( (data?.margem_media_atual ?? 0 ) - i * 5) / 5));

                return (
                  <div
                    key={i}
                    className={styles.profit_square}
                    style={{
                      transform: `
                        rotate(${angle}deg)
                        translate(7em)
                        perspective(100px)
                        rotateY(-50deg)
                      `,
                      backgroundColor: squareColor,
                      opacity: opacity
                    }}
                  />
                );
              })
            }
          </div>
        </div>
        <div className={styles.profit_details_insights}>
          <div className={styles.margin_status_indicator}>
            <div 
              className={styles.status_dot}
              style={{ backgroundColor: getColorByMarginRatio(currentMargin, margemAlvoAtual) }}
            />
            <span className={styles.status_label}>
              {(() => {
                const ratio = currentMargin / margemAlvoAtual;
                if (ratio >= 1.2) return 'Margem Excelente';
                if (ratio >= 1.0) return 'Meta Atingida';
                if (ratio >= 0.7) return 'Próximo da Meta';
                return 'Abaixo da Meta';
              })()}
            </span>
          </div>
          
          <div className={styles.profit_details_insight_text}>

              {hasLowMarginProducts ? (
                <>
                <span>
                  {(data?.total_produtos_baixa_margem ?? 0)} produto(s)
                </span> estão com margem abaixo de <span>{margem_maxima}%</span>. 
                Considere ajustar o preço de custo para
                que os sellers tenham margem de pelo menos <span>{margemAlvoAtual}%</span>.
                </>
              ) : (
                <>
                  Excelente! Todos os seus produtos estão com margem acima de {margem_maxima}%. 
                  Os sellers podem trabalhar com preços competitivos e manter boa lucratividade.
                </>
              )}

          </div>

          {/* Botão para ver produtos com margem baixa */}
          {hasLowMarginProducts && (
            <button 
              onClick={() => setShowModal(true)}
              className={styles.view_products_button}
            >
              <BiTrendingDown />
              <span>Ver Produtos</span>
              <BiShow />
            </button>
          )}
        </div>
      </div>

      {/* Modal de produtos com margem baixa */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Produtos com Margem Baixa"
      >
        <div className={styles.modal_content}>
          <div className={styles.modal_header_info}>
            <p style={{ 
              color: 'var(--color-secondary)', 
              marginBottom: '1rem',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              Encontrados <strong>{data?.sugestoes?.length || 0} produtos</strong> com margem abaixo de {margem_maxima}%.
              <br />
              Considere ajustar os preços de custo para melhorar a competitividade dos sellers.
            </p>
          </div>
          
          <div className={styles.modal_table_wrapper}>
            <Table 
              columns={lowMarginColumns} 
              data={data?.sugestoes || []}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}