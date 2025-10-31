'use client';

import React, { useEffect, useState } from 'react';
import { BiLoader } from 'react-icons/bi';
import styles from './PricingInsightsWidget.module.css';

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

export default function PricingInsightsWidget({ 
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

  return (
    <>

    <div className={styles.pricing_container} style={{ display: 'flex' }}>
      {loading && (
        <div className={styles.loading_overlay}>
          <BiLoader className={styles.loading_spinner} />
        </div>
      )}
      
      <div className={styles.pricing_label}>
        Insights de Precificação
      </div>
      


      <div className={styles.pricing_content}>

        
        <div className={styles.pricing_stats}>
          <div className={styles.stat_card}>
            <div className={styles.stat_label}>Produtos com Baixa Margem</div>
            <div className={`${styles.stat_value} ${styles.large}`}>
              {data?.total_produtos_baixa_margem ?? 0}
            </div>
          </div>

          <div className={styles.stat_card}>
            <div className={styles.stat_label}>Margem Média Atual</div>
            <div className={styles.stat_value}>
              {(data?.margem_media_atual && typeof data.margem_media_atual === 'number') 
                ? data.margem_media_atual.toFixed(1) 
                : '0.0'}%
            </div>
          </div>

          <div className={styles.stat_card}>
            <div className={styles.stat_label}>Margem Alvo por Produto</div>
            <div className={styles.stat_value_editable}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={margemAlvoInput}
                onChange={(e) => setMargemAlvoInput(e.target.value)}
                className={styles.margem_input}
                placeholder="25.0"
                disabled={loading}
              />
              <span className={styles.percent_symbol}>%</span>
            </div>
          </div>
        </div>

        {data && (
          <div className={styles.pricing_insight}>
            <div className={styles.insight_text}>
              {hasLowMarginProducts ? (
                <>
                  <strong>{data.total_produtos_baixa_margem} produto(s)</strong> estão com margem 
                  abaixo de {margem_maxima}%. Considere ajustar o preço de custo para 
                  permitir que os sellers tenham margem competitiva de pelo menos {margemAlvoAtual}%.
                </>
              ) : (
                <>
                  Excelente! Todos os seus produtos estão com margem acima de {margem_maxima}%. 
                  Os sellers podem trabalhar com preços competitivos e manter boa lucratividade.
                </>
              )}
            </div>
          </div>
        )}

        {hasLowMarginProducts && (
          <div className={styles.products_list}>
            <div className={styles.list_header_row}>
              <div className={styles.list_header}>Produtos que precisam de ajuste:</div>
              {totalPages > 1 && (
                <div className={styles.pagination_controls}>
                  <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 0}
                    className={styles.page_button}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>
                  <span className={styles.page_indicator}>
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages - 1}
                    className={styles.page_button}
                    aria-label="Próxima página"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
            <div className={styles.products_grid}>
              {currentProducts.map((product) => (
                <div key={product.produto_id} className={styles.product_row}>
                  <div className={styles.product_info}>
                    <div className={styles.product_name}>{product.nome}</div>
                    <div className={styles.product_details}>
                      {product.vendedor} • Margem atual: {(product.margem_atual && typeof product.margem_atual === 'number') 
                        ? product.margem_atual.toFixed(1) 
                        : '0.0'}%
                    </div>
                  </div>
                  
                  <div className={styles.product_prices}>
                    <div className={styles.price_item}>
                      <span className={styles.price_label}>Custo Atual:</span>
                      <div className={styles.price_input_group}>
                        <span className={styles.currency}>R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editingValues[`${product.produto_id}-preco_custo`] || 
                                 (product.preco_custo_atual && typeof product.preco_custo_atual === 'number' 
                                  ? product.preco_custo_atual : 0)}
                          min="0"
                          onChange={(e) => handleInputChange(product.produto_id, e.target.value)}
                          onBlur={(e) => handleCostChange(product.produto_id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          disabled={updating === product.produto_id}
                          placeholder="0.00"
                          className={styles.price_input}
                        />
                        {updating === product.produto_id && <BiLoader className={styles.spinner} />}
                      </div>
                    </div>
                    
                    <div className={styles.price_item}>
                      <span className={styles.price_label}>Sugerido:</span>
                      <span className={styles.price_value}>
                        {(product.preco_custo_sugerido && typeof product.preco_custo_sugerido === 'number') 
                          ? product.preco_custo_sugerido.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })
                          : 'R$ 0,00'}
                      </span>
                    </div>
                    
                    <div className={styles.price_item}>
                      <span className={styles.price_label}>Preço Seller:</span>
                      <span className={styles.price_value}>
                        {(product.preco_base && typeof product.preco_base === 'number') 
                          ? product.preco_base.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })
                          : 'R$ 0,00'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

