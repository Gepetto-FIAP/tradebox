'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/Table/Table';
import { BiTrashAlt, BiLoader } from 'react-icons/bi';
import styles from './ProductList.module.css';

// Dados temporários - depois vão vir do DB
const mockProducts = [
  { 
    id: 1,
    name: 'Produto A',
    price: 29.99,
    stock: 100,
    gtin: '1234567890123'
  },
  { 
    id: 2,
    name: 'Produto B', 
    price: 49.99,
    stock: 50,
    gtin: '2345678901234'
  },
  { 
    id: 3,
    name: 'Produto C',
    price: 19.99,
    stock: 200,
    gtin: '3456789012345'
  },
  { 
    id: 4,
    name: 'Produto D',
    price: 39.99,
    stock: 150,
    gtin: '4567890123456'
  },
    { 
    id: 5,
    name: 'Produto E',
    price: 59.99,
    stock: 80,
    gtin: '5678901234567'
  }
];

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  gtin: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

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
      
      // Atualizar estado local
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
        
        // Atualizar estado local
        setProducts(prevProducts => 
          prevProducts.filter(product => product.id !== productId)
        );
        
        console.log(`Produto ${productName} excluído com sucesso`);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente.');
      } finally {
        setUpdating(null);
      }
    }
  };

  // Handlers para cada campo
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
          defaultValue={value}
          onBlur={(e) => handleNameChange(row.id, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleNameChange(row.id, e.currentTarget.value);
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
          defaultValue={value} 
          step="0.01"
          min="0"
          onBlur={(e) => handlePriceChange(row.id, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handlePriceChange(row.id, e.currentTarget.value);
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
          defaultValue={value} 
          min="0"
          onBlur={(e) => handleStockChange(row.id, e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleStockChange(row.id, e.currentTarget.value);
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

  return <Table data={products} columns={columns} />;
}