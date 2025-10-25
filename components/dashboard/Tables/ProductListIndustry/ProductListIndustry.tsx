'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/ui/Table/Table';
import { BiTrashAlt, BiLoader, BiExpand } from 'react-icons/bi';
import styles from './ProductListIndustry.module.css';

// Dados temporários - depois vão vir do DB
const mockProducts = [
  { 
    id: 1,
    name: 'Produto A',
    price: 29.99,
    cost: 19.99,
    gtin: '1234567890123',
    seller: 1
  },
  { 
    id: 2,
    name: 'Produto B', 
    price: 49.99,
    cost: 29.99,
    gtin: '2345678901234',
    seller: 2
  },
  { 
    id: 3,
    name: 'Produto C',
    price: 19.99,
    cost: 9.99,
    gtin: '3456789012345',
    seller: 2
  },
  { 
    id: 4,
    name: 'Produto D',
    price: 39.99,
    cost: 24.99,
    gtin: '4567890123456',
    seller: 3
  },
  { 
    id: 5,
    name: 'Produto E',
    price: 59.99,
    cost: 34.99,
    gtin: '5678901234567',
    seller: 3
  }

];

const sellers = [
  {
    id: 1,
    name: 'Loja do João'
  },  
  {
    id: 2,
    name: 'Mercado da Maria'
  },
  {
    id: 3,
    name: 'Supermercado Central'
  }
];

interface Product {
  id: number;
  name: string;
  price: number;
  cost: number;
  gtin: string;
  seller: number;
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
        initialValues[`${product.id}-cost`] = product.cost || 0;
      });

      setEditingValues(initialValues);
      
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCostChange = (productId: number, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      updateProduct(productId, 'cost', numValue);
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
    },
    {
      key: 'gtin',
      header: 'GTIN',
    },
    {
      key: 'seller',
      header: 'Seller',
      render: (value: number) => {
        const seller = sellers.find(sel => sel.id === value);
        return <span>{seller ? seller.name : '-'}</span>;
      }
    },

    {
        key: 'cost',
        header: 'Custo',
        render: (value: number, row: Product) => (
            <input 
            type="number" 
            value={editingValues[`${row.id}-cost`] || ''} 
            min="0"
            onChange={(e) => handleInputChange(row.id, 'cost', e.target.value)}
            onBlur={(e) => handleCostChange(row.id, e.target.value)}
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
      header: 'Preço Seller',
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