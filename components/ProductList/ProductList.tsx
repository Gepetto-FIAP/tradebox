'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/Table/Table';
import Modal from '@/components/Modal/Modal';
import { BiTrashAlt, BiLoader, BiExpand } from 'react-icons/bi';
import styles from './ProductList.module.css';

// Dados temporários - depois vão vir do DB
const mockProducts = [
  { 
    id: 11,
    name: 'Produto A',
    price: 29.99,
    stock: 100,
    gtin: '1234567890123',
    industry: 'Unilever'
  },
  { 
    id: 2,
    name: 'Produto B', 
    price: 49.99,
    stock: 50,
    gtin: '2345678901234',
    industry: 'Procter & Gamble'
  },
  { 
    id: 3,
    name: 'Produto C',
    price: 19.99,
    stock: 200,
    gtin: '3456789012345',
    industry: null
  },
  { 
    id: 4,
    name: 'Produto D',
    price: 39.99,
    stock: 150,
    gtin: '4567890123456',
    industry: 'Nestlé'
  },
  { 
    id: 5,
    name: 'Produto E',
    price: 59.99,
    stock: 80,
    gtin: '5678901234567',
    industry: null
  }
];

const industries = [
  {
    id: 1,
    name: 'Unilever'
  },  
  {
    id: 2,
    name: 'Procter & Gamble'
  },
  {
    id: 3,
    name: 'Nestlé'
  }
];

interface Industry {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  gtin: string;
  industry: string | null;
}


export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const [editingValues, setEditingValues] = useState<{[key: string]: any}>({});

  // Função para buscar produtos do banco (futura implementação)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // TODO: Substituir por chamada real para a API/DB
      // const response = await fetch('/api/products');
      // const data = await response.json();
      // setProducts(data);
      
      // Simulação de delay da API
      await new Promise(resolve => setTimeout(resolve, 900));
      setProducts(mockProducts);

      const initialValues: {[key: string]: any} = {};
      mockProducts.forEach(product => {
        initialValues[`${product.id}-name`] = product.name;
        initialValues[`${product.id}-price`] = product.price;
        initialValues[`${product.id}-stock`] = product.stock;
        initialValues[`${product.id}-industry`] = product.industry || '';
      });
      setEditingValues(initialValues);
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar produto no banco
  const updateProduct = async (productId: number, field: keyof Product, value: string | number) => {
      if (updating !== null) {
        console.log('Aguarde o update anterior terminar');
        return;
      }

    try {
      setUpdating(productId);
      
      // TODO: Fazer chamada para API atualizar no banco
      // await fetch(`/api/products/${productId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ [field]: value })
      // });
      
      // Simulação de delay da API
      await new Promise(resolve => setTimeout(resolve, 900));
      
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, [field]: value }
            : product
        )
      );
      
      console.log(`Produto ${productId} - ${field} atualizado para: ${value}`);
      
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      alert('Erro ao atualizar produto. Tente novamente.');
    } finally {
      setUpdating(null);
    }
  };

  // Função para deletar produto
  const handleDeleteProduct = async (productId: number, productName: string) => {
    
    const confirmDelete = confirm(`Tem certeza que deseja excluir "${productName}"?`);
    
    if (confirmDelete) {
      try {
        setUpdating(productId);
        
        // TODO: Fazer chamada para API deletar no banco
        // await fetch(`/api/products/${productId}`, { method: 'DELETE' })
        // Simulação de delay da API
        await new Promise(resolve => setTimeout(resolve, 900));
        
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );

        setEditingValues(prev => {
          const newValues = { ...prev };
          delete newValues[`${productId}-name`];
          delete newValues[`${productId}-price`];
          delete newValues[`${productId}-stock`];
          delete newValues[`${productId}-industry`];
          return newValues;
        });
        
        console.log(`Produto ${productName} excluído com sucesso`);
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
      updateProduct(productId, 'name', value);
    }
  };

  const handlePriceChange = (productId: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateProduct(productId, 'price', numValue);
    }
  };

  const handleStockChange = (productId: number, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateProduct(productId, 'stock', numValue);
    }
  };

  const handleIndustryChange = (productId: number, value: string) => {
    if (value) {
      updateProduct(productId, 'industry', value);
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
      key: 'name',
      header: 'Nome do Produto',
      render: (value: string, row: Product) => (
        <input 
          type="text" 
          value={editingValues[`${row.id}-name`] || ''}
          onChange={(e) => handleInputChange(row.id, 'name', e.target.value)}
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
      key: 'price',
      header: 'Preço',
      render: (value: number, row: Product) => (
        <input 
          type="number" 
          value={editingValues[`${row.id}-price`] || ''} 
          step="0.01"
          min="0"
          onChange={(e) => handleInputChange(row.id, 'price', e.target.value)}
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
      key: 'stock',
      header: 'Estoque',
      render: (value: number, row: Product) => (
        <input 
          type="number" 
          value={editingValues[`${row.id}-stock`] || ''} 
          min="0"
          onChange={(e) => handleInputChange(row.id, 'stock', e.target.value)}
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
      key: 'industry',
      header: 'Indústria',
      render: (value: string, row: Product) => (
        <select
          title={value || 'Selecione uma indústria'}
          value={editingValues[`${row.id}-industry`] || ''}
          onChange={(e) => {
            handleInputChange(row.id, 'industry', e.target.value);
            handleIndustryChange(row.id, e.target.value); // Select pode salvar imediatamente
          }}         
          disabled={updating === row.id}
        >
          <option value="">Selecione uma indústria</option>
          {industries.map(industry => (
            <option key={industry.id} value={industry.name}>
              {industry.name}
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
            onClick={() => handleDeleteProduct(row.id, row.name)}
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

  return (
    <>
      <Table data={products} columns={columns} />
    </>

  );
}