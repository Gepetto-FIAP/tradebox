'use client';

import { useState, useEffect } from 'react';
import Modal from '../../../ui/Modal/Modal';
import styles from './SaleItemsModal.module.css';

interface SaleItem {
  id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  produto_nome: string;
  produto_gtin: string;
}

interface Sale {
  id: number;
  data_venda: string;
  valor_total: number;
  quantidade_itens: number;
  status: string;
}

interface SaleItemsModalProps {
  saleId: number;
  onClose: () => void;
}

export default function SaleItemsModal({ saleId, onClose }: SaleItemsModalProps) {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/sales/${saleId}`);
        const data = await response.json();

        if (data.success) {
          setSale(data.sale);
          setItems(data.items || []);
        } else {
          setError('Erro ao carregar detalhes da venda');
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes da venda:', error);
        setError('Erro ao conectar com o servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetails();
  }, [saleId]);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Detalhes da Venda #${saleId}`}>
      <div className={styles.modal_content}>
        {loading && (
          <div className={styles.loading}>
            <p>Carregando detalhes...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && sale && (
          <>
            <div className={styles.sale_info}>
              <div className={styles.info_row}>
                <span className={styles.label}>Data:</span>
                <span className={styles.value}>
                  {sale.data_venda ? (
                    <>
                      {new Date(sale.data_venda).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(sale.data_venda).toLocaleTimeString('pt-BR')}
                    </>
                  ) : (
                    'Data não disponível'
                  )}
                </span>
              </div>
              <div className={styles.info_row}>
                <span className={styles.label}>Status:</span>
                <span className={`${styles.value} ${sale.status ? styles[sale.status.toLowerCase()] : ''}`}>
                  {sale.status || 'N/A'}
                </span>
              </div>
            </div>

            <div className={styles.items_table}>
              <table>
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>GTIN</th>
                    <th>Qtd.</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || `item-${index}`}>
                      <td>{item.produto_nome || 'N/A'}</td>
                      <td className={styles.gtin}>{item.produto_gtin || 'N/A'}</td>
                      <td className={styles.center}>{item.quantidade || 0}</td>
                      <td className={styles.price}>
                        R$ {item.preco_unitario ? Number(item.preco_unitario).toFixed(2) : '0.00'}
                      </td>
                      <td className={styles.price}>
                        R$ {item.subtotal ? Number(item.subtotal).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.total_row}>
              <span className={styles.total_label}>Total da Venda:</span>
              <span className={styles.total_value}>
                R$ {sale.valor_total ? Number(sale.valor_total).toFixed(2) : '0.00'}
              </span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

