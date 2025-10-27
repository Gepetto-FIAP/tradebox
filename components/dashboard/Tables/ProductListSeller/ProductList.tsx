'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/ui/Table/Table';
import { BiTrashAlt, BiLoader } from 'react-icons/bi';
import styles from './ProductList.module.css';

interface Product {
  id: number;
  nome: string;
  preco_base: number;
  estoque: number;
  gtin: string;
  industria_id: number | null;
  industria_nome?: string;
}

interface Industry {
  id: number;
  nome: string;
}


export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const [editingValues, setEditingValues] = useState<{[key: string]: any}>({});

  // Buscar produtos do banco
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success && data.products) {
        setProducts(data.products);
        
        // Inicializar valores de edição
        const initialValues: {[key: string]: any} = {};
        data.products.forEach((product: Product) => {
          initialValues[`${product.id}-nome`] = product.nome;
          initialValues[`${product.id}-preco_base`] = product.preco_base;
          initialValues[`${product.id}-estoque`] = product.estoque;
          initialValues[`${product.id}-industria_id`] = product.industria_id || '';
        });
        setEditingValues(initialValues);
      } else {
        setError('Erro ao carregar produtos');
      }
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Buscar indústrias para dropdown
  const fetchIndustries = async () => {
    try {
      const response = await fetch('/api/industries');
      const data = await response.json();
      
      if (data.success && data.industries) {
        setIndustries(data.industries);
      }
    } catch (error) {
      console.error('Erro ao buscar indústrias:', error);
    }
  };

  // Atualizar produto no banco
  const updateProduct = async (productId: number, field: keyof Product, value: string | number) => {
    if (updating !== null) {
      return;
    }

    try {
      setUpdating(productId);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(prevProducts => 
          prevProducts.map(product => 
            product.id === productId 
              ? { ...product, [field]: value }
              : product
          )
        );
      } else {
        alert(`Erro: ${data.error || 'Falha ao atualizar produto'}`);
        // Reverter valor em caso de erro
        fetchProducts();
      }
      
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto. Tente novamente.');
      fetchProducts();
    } finally {
      setUpdating(null);
    }
  };

  // Deletar produto
  const handleDeleteProduct = async (productId: number, productName: string) => {
    const confirmDelete = confirm(`Tem certeza que deseja excluir "${productName}"?`);
    
    if (confirmDelete) {
      try {
        setUpdating(productId);
        
        const response = await fetch(`/api/products/${productId}`, { 
          method: 'DELETE' 
        });
        
        const data = await response.json();
        
        if (data.success) {
          setProducts(prevProducts => 
            prevProducts.filter(product => product.id !== productId)
          );

          setEditingValues(prev => {
            const newValues = { ...prev };
            delete newValues[`${productId}-nome`];
            delete newValues[`${productId}-preco_base`];
            delete newValues[`${productId}-estoque`];
            delete newValues[`${productId}-industria_id`];
            return newValues;
          });
        } else {
          alert(`Erro: ${data.error || 'Falha ao excluir produto'}`);
        }
        
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente.');
      } finally {
        setUpdating(null);
      }
    }
  };


  const handleNameChange = (productId: number, value: string) => {
    if (value.trim()) {
      updateProduct(productId, 'nome', value);
    }
  };

  const handlePriceChange = (productId: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateProduct(productId, 'preco_base', numValue);
    }
  };

  const handleStockChange = (productId: number, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateProduct(productId, 'estoque', numValue);
    }
  };

  const handleIndustryChange = (productId: number, value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    updateProduct(productId, 'industria_id', num as any);
    handleInputChange(productId, 'industria_id', value);
  };


  const handleInputChange = (productId: number, field: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [`${productId}-${field}`]: value
    }));
  };


  useEffect(() => {
    fetchProducts();
    fetchIndustries();
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
      render: (value: string, row: Product) => (
        <input 
          type="text" 
          value={editingValues[`${row.id}-nome`] || ''}
          onChange={(e) => handleInputChange(row.id, 'nome', e.target.value)}
          onBlur={(e) => handleNameChange(row.id, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          disabled={updating === row.id}
        />
      )
    },
    {
      key: 'preco_base',
      header: 'Preço',
      render: (value: number, row: Product) => (
        <input 
          type="number" 
          value={editingValues[`${row.id}-preco_base`] || ''} 
          step="0.01"
          min="0"
          onChange={(e) => handleInputChange(row.id, 'preco_base', e.target.value)}
          onBlur={(e) => handlePriceChange(row.id, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          disabled={updating === row.id}
        />
      )
    },
    {
      key: 'estoque',
      header: 'Estoque',
      render: (value: number, row: Product) => (
        <input 
          type="number" 
          value={editingValues[`${row.id}-estoque`] || ''} 
          min="0"
          onChange={(e) => handleInputChange(row.id, 'estoque', e.target.value)}
          onBlur={(e) => handleStockChange(row.id, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          disabled={updating === row.id}
        />
      )
    },
    {
      key: 'gtin',
      header: 'GTIN',
    },
    {
      key: 'industria_id',
      header: 'Indústria',
      render: (value: number | null, row: Product) => (
        <select
          title={row.industria_nome || 'Selecione uma indústria'}
          value={editingValues[`${row.id}-industria_id`] ?? ''}
          onChange={(e) => {
            handleIndustryChange(row.id, e.target.value);
          }}         
          disabled={updating === row.id}
        >
          <option value="">Selecione uma indústria</option>
          {industries.map(industry => (
            <option key={industry.id} value={industry.id}>
              {industry.nome}
            </option>
          ))}
        </select>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (value: any, row: Product) => (
        <div>
          <button 
            onClick={() => handleDeleteProduct(row.id, row.nome)}
            disabled={loading || updating === row.id}
            title={updating === row.id ? 'Atualizando...' : 'Excluir produto'}
          >
            {updating === row.id ? <BiLoader/> : <BiTrashAlt />}
          </button>
        </div>

      )
    }
  ];

  if (loading) {
    return <div className={styles.loading}>Carregando produtos...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <Table data={products} columns={columns} />
    </>

  );
}