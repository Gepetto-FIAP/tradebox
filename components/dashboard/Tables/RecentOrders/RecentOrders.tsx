'use client';

import { useState, useEffect } from 'react';
import Table from '../../../ui/Table/Table';
import SaleItemsModal from '../../SaleItemsModal/SaleItemsModal';
import styles from './RecentOrders.module.css';

interface Order {
  id: number;
  data_venda: string;
  quantidade_itens: number;
  valor_total: number;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  // Função para buscar pedidos recentes do banco
  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/sales?limit=20');
      const data = await response.json();
      
      if (data.success && data.sales) {
        setOrders(data.sales);
      } else {
        setError('Erro ao carregar vendas');
      }
      
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError('Erro ao conectar com o servidor');
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
      key: 'id',
      header: 'Nº',
      render: (value: number) => `#${value}`
    },
    {
      key: 'data_venda',
      header: 'Data',
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleDateString('pt-BR');
      }
    },
    {
      key: 'quantidade_itens',
      header: 'Itens',
      render: (value: number, row: Order) => (
        <button 
          onClick={() => setSelectedSaleId(row.id)}
          className={styles.items_button}
        >
          {value} {value === 1 ? 'item' : 'itens'}
        </button>
      )
    },
    {
      key: 'valor_total',
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

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Nenhuma venda realizada ainda</p>
      </div>
    );
  }

  return (
    <>
      <Table columns={columns} data={orders} />
      {selectedSaleId && (
        <SaleItemsModal 
          saleId={selectedSaleId} 
          onClose={() => setSelectedSaleId(null)} 
        />
      )}
    </>
  );
}