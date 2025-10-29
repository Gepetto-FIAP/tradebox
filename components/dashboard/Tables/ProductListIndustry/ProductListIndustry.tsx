'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/ui/Table/Table';
import { BiLoader } from 'react-icons/bi';
import styles from './ProductListIndustry.module.css';

interface Product {
  id: number;
  nome: string;
  preco_base: number;
  preco_custo: number;
  gtin: string;
  vendedor_nome: string;
  vendedor_id: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [editingValues, setEditingValues] = useState<{[key: string]: any}>({});
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/industry/products');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar produtos');
      }
      
      const result = await response.json();
      
      if (result.success && result.products) {
        setProducts(result.products);
        
        // Inicializar valores de edição
        const initialValues: {[key: string]: any} = {};
        result.products.forEach((product: Product) => {
          initialValues[`${product.id}-preco_custo`] = product.preco_custo || 0;
        });
        setEditingValues(initialValues);
      } else {
        throw new Error('Formato de resposta inválido');
      }
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const updateProductCost = async (productId: number, newCost: number) => {
    if (updating !== null) {
      console.log('Aguarde o update anterior terminar');
      return;
    }

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
      
      // Atualizar produto localmente
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, preco_custo: newCost }
            : product
        )
      );
      
      console.log('Preço de custo atualizado com sucesso');
      
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      alert(error.message || 'Erro ao atualizar preço de custo. Tente novamente.');
      
      // Restaurar valor anterior
      const product = products.find(p => p.id === productId);
      if (product) {
        setEditingValues(prev => ({
          ...prev,
          [`${productId}-preco_custo`]: product.preco_custo
        }));
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

  const handleInputChange = (productId: number, field: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [`${productId}-${field}`]: value
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns = [
    {
      key: 'id',  
      header: 'ID',
      render: (value: number) => `#${value}`
    },
    {
      key: 'nome',
      header: 'Nome do Produto',
    },
    {
      key: 'gtin',
      header: 'GTIN',
    },
    {
      key: 'vendedor_nome',
      header: 'Vendedor',
      render: (value: string) => <span>{value || '-'}</span>
    },
    {
      key: 'preco_custo',
      header: 'Preço de Custo',
      render: (value: number, row: Product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: '500', color: 'var(--color-text)', opacity: 0.7 }}>R$</span>
            <input 
              type="number" 
              step="0.01"
              value={editingValues[`${row.id}-preco_custo`] || ''} 
              min="0"
              onChange={(e) => handleInputChange(row.id, 'preco_custo', e.target.value)}
              onBlur={(e) => handleCostChange(row.id, e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              disabled={updating === row.id}
              placeholder="0.00"
              style={{ 
                padding: '6px 10px', 
                borderRadius: '4px', 
                border: '1px solid var(--color-border)',
                width: '90px'
              }}
            />
          </div>
          {updating === row.id && <BiLoader className={styles.spinner} />}
        </div>
      )
    },
    {
      key: 'preco_base',
      header: 'Preço do Seller',
      render: (value: number) => 
        value ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'
    }
  ];

  if (loading) {
    return <div className={styles.loading}>Carregando produtos...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (products.length === 0) {
    return <div className={styles.empty}>Nenhum produto cadastrado</div>;
  }

  return (
    <>
      <Table data={products} columns={columns} />
    </>
  );
}