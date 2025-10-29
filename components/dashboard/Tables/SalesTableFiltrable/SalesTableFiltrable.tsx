'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/ui/Table/Table';
import styles from './SalesTableFiltrable.module.css';

interface Sale {
  id: number;
  vendedor_id: number;
  cliente_id: number | null;
  data_venda: string;
  valor_total: number;
  quantidade_itens: number;
  status: string;
  observacoes: string | null;
  created_at: string;
  cliente_nome: string | null;
}

type Props = {
    status: string;
    dataInicio: string;
    dataFim: string;
    limit: number;
};


const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'PENDENTE', label: 'Pendente' },
];

export default function SalesList(
    { status, dataInicio, dataFim, limit }: Props
) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Monta a URL com os filtros
  function buildUrl() {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);
    if (limit) params.append('limit', String(limit));
    return `/api/sales?${params.toString()}`;
  }

  useEffect(() => {
    setLoading(true);
    fetch(buildUrl())
      .then(res => res.json())
      .then(data => setSales(Array.isArray(data.sales) ? data.sales : []))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [status, dataInicio, dataFim, limit]);

  const columns = [
    { key: 'id', header: 'ID', render: (v: number) => `#${v}` },
    { key: 'data_venda', header: 'Data', render: (v: string) => new Date(v).toLocaleString() },
    { key: 'cliente_nome', header: 'Cliente', render: (v: string | null) => v ?? '-' },
    { key: 'valor_total', header: 'Valor Total', render: (v: number) => `R$ ${v.toFixed(2)}` },
    { key: 'quantidade_itens', header: 'Itens' },
    { key: 'status', header: 'Status' },
    { key: 'observacoes', header: 'Observações', render: (v: string | null) => v ?? '-' },
  ];

  return (
    <div>


      {loading ? (
        <div className={styles.loading}>Carregando vendas...</div>
      ) : (
        <Table data={sales} columns={columns} />
      )}
    </div>
  );
}