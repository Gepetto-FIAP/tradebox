'use client';

import { useState, useEffect } from 'react';
import Table from '../../ui/Table/Table';
import styles from './RecentOrders.module.css';

// Mock data - remover quando conectar com DB
const mockOrders = [
    {
        idOrder: 1,
        data: '2023-10-01',
        itens: 3,
        total: 100
    },
    {
        idOrder: 2,
        data: '2023-10-02',
        itens: 1,
        total: 50
    },
    {
        idOrder: 3,
        data: '2023-10-03',
        itens: 2,
        total: 75
    },
    {
        idOrder: 4,
        data: '2023-10-04',
        itens: 1,
        total: 50
    }
];

interface Order {
  idOrder: number;
  data: string;
  itens: number;
  total: number;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar pedidos recentes do banco
  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      
      // TODO: Substituir por chamada real para a API/DB
      // const response = await fetch('/api/orders/recent');
      // 
      // if (!response.ok) {
      //   throw new Error('Erro ao buscar pedidos');
      // }
      // 
      // const data = await response.json();
      // setOrders(data);
      
      // Simulação de chamada da API
      await new Promise(resolve => setTimeout(resolve, 800));
      setOrders(mockOrders);
      
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const columns = [
    {
      key: 'idOrder',
      header: 'Nº',
      render: (value: number) => `#${value}`
    },
    {
      key: 'data',
      header: 'Data',
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString('pt-BR');
      }
    },
    {
      key: 'itens',
      header: 'Itens',
      render: (value: number) => `${value} ${value === 1 ? 'item' : 'itens'}`
    },
    {
      key: 'total',
      header: 'Total',
      render: (value: number) => `R$ ${value.toFixed(2)}`
    }
  ];

  // Estados de loading e erro
  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Carregando pedidos recentes...</p>
      </div>
    );
  }

  return <Table columns={columns} data={orders} />;
}