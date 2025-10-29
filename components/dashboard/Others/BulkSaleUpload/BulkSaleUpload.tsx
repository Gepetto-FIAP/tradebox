'use client';

import { useState } from 'react';
import Modal from '../../../ui/Modal/Modal';
import styles from './BulkSaleUpload.module.css';
import { BiUpload, BiX, BiCheck, BiError, BiChevronRight } from 'react-icons/bi';

interface CSVRow {
  gtin: string;
  quantidade: number;
  preco_unitario?: number;
  lineNumber: number;
}

interface ProcessedProduct {
  gtin: string;
  quantidade: number;
  preco_unitario: number;
  produto?: any;
  status: 'valid' | 'no_stock' | 'not_found' | 'error';
  error?: string;
  lineNumber: number;
  selectedProductId?: number;
}

interface BulkSaleUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleComplete?: () => void;
}

type Step = 'upload' | 'processing' | 'review' | 'finalizing' | 'success';

export default function BulkSaleUpload({ isOpen, onClose, onSaleComplete }: BulkSaleUploadProps) {
  const [step, setStep] = useState<Step>('upload');
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedProduct[]>([]);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Por favor, selecione um arquivo CSV');
        return;
      }
      setCSVFile(file);
      setError('');
    }
  };

  const parseCSV = async (file: File): Promise<CSVRow[]> => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    // Verificar header
    const header = lines[0].toLowerCase();
    if (!header.includes('gtin') || !header.includes('quantidade')) {
      throw new Error('CSV deve conter colunas GTIN e QUANTIDADE');
    }
    
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length < 2) {
        throw new Error(`Linha ${i + 1}: formato inválido`);
      }
      
      const gtin = parts[0];
      const quantidade = parseInt(parts[1]);
      const preco_unitario = parts[2] ? parseFloat(parts[2]) : undefined;
      
      // Validações
      if (!gtin || !/^\d{8,14}$/.test(gtin)) {
        throw new Error(`Linha ${i + 1}: GTIN inválido (deve ter 8-14 dígitos)`);
      }
      
      if (isNaN(quantidade) || quantidade <= 0) {
        throw new Error(`Linha ${i + 1}: Quantidade inválida`);
      }
      
      if (preco_unitario !== undefined && (isNaN(preco_unitario) || preco_unitario <= 0)) {
        throw new Error(`Linha ${i + 1}: Preço unitário inválido`);
      }
      
      rows.push({ gtin, quantidade, preco_unitario, lineNumber: i + 1 });
    }
    
    if (rows.length === 0) {
      throw new Error('CSV não contém dados válidos');
    }
    
    return rows;
  };

  const handleProcessCSV = async () => {
    if (!csvFile) {
      setError('Selecione um arquivo CSV');
      return;
    }

    setStep('processing');
    setError('');

    try {
      // 1. Parse do CSV
      const csvRows = await parseCSV(csvFile);
      
      // 2. Buscar produtos em lote
      const gtins = csvRows.map(row => row.gtin);
      
      const response = await fetch('/api/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gtins })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Erro ao buscar produtos');
      }

      // 3. Processar resultados
      const processed: ProcessedProduct[] = csvRows.map(row => {
        const produtos = data.results[row.gtin] || [];
        
        if (produtos.length === 0) {
          // Produto não encontrado
          return {
            gtin: row.gtin,
            quantidade: row.quantidade,
            preco_unitario: row.preco_unitario || 0,
            status: 'not_found' as const,
            error: 'Produto não encontrado no catálogo',
            lineNumber: row.lineNumber
          };
        }
        
        // Se houver múltiplos produtos, selecionar o com menor preço base
        const produto = produtos.reduce((prev: any, current: any) => 
          (current.preco_base < prev.preco_base) ? current : prev
        );
        
        // Validar estoque
        if (produto.estoque < row.quantidade) {
          return {
            gtin: row.gtin,
            quantidade: row.quantidade,
            preco_unitario: row.preco_unitario || produto.preco_base,
            produto,
            status: 'no_stock' as const,
            error: `Estoque insuficiente (disponível: ${produto.estoque})`,
            lineNumber: row.lineNumber,
            selectedProductId: produto.id
          };
        }
        
        // Produto válido
        return {
          gtin: row.gtin,
          quantidade: row.quantidade,
          preco_unitario: row.preco_unitario || produto.preco_base,
          produto,
          status: 'valid' as const,
          lineNumber: row.lineNumber,
          selectedProductId: produto.id
        };
      });

      setProcessedData(processed);
      setStep('review');

    } catch (error: any) {
      console.error('Erro ao processar CSV:', error);
      setError(error.message || 'Erro ao processar arquivo');
      setStep('upload');
    }
  };

  const handleFinalizeSale = async () => {
    setStep('finalizing');
    setError('');

    try {
      const validItems = processedData
        .filter(p => p.status === 'valid' && p.selectedProductId)
        .map(p => ({
          produto_id: p.selectedProductId!,
          quantidade: p.quantidade,
          preco_unitario: p.preco_unitario
        }));

      if (validItems.length === 0) {
        throw new Error('Nenhum item válido para venda');
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: validItems })
      });

      const data = await response.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          if (onSaleComplete) onSaleComplete();
          handleClose();
        }, 2000);
      } else {
        throw new Error(data.message || 'Erro ao finalizar venda');
      }
    } catch (error: any) {
      console.error('Erro ao finalizar venda:', error);
      setError(error.message || 'Erro ao processar venda');
      setStep('review');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setCSVFile(null);
    setProcessedData([]);
    setError('');
    onClose();
  };

  const getValidCount = () => processedData.filter(p => p.status === 'valid').length;
  const getNotFoundCount = () => processedData.filter(p => p.status === 'not_found').length;
  const getNoStockCount = () => processedData.filter(p => p.status === 'no_stock').length;
  const getConflictCount = () => 0; // Não há mais conflitos - sempre retorna 0
  const getTotalValue = () => processedData
    .filter(p => p.status === 'valid')
    .reduce((sum, p) => sum + (p.quantidade * p.preco_unitario), 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Carregar Venda em Massa (CSV)">
      <div className={styles.modal_content}>
        {error && (
          <div className={styles.error_banner}>
            <BiError />
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className={styles.upload_section}>
            <div className={styles.instructions}>
              <h4>Formato do CSV:</h4>
              <pre className={styles.csv_example}>
{`GTIN,QUANTIDADE,PRECO_UNITARIO
7894900011517,2,8.90
7891234567890,5,`}
              </pre>
              <p>• PRECO_UNITARIO é opcional (se vazio, usa o preço base)</p>
              <p>• GTIN deve ter 8-14 dígitos</p>
              <p>• Máximo de 100 produtos por arquivo</p>
            </div>

            <div className={styles.file_input_wrapper}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                id="csv-upload"
                className={styles.file_input}
              />
              <label htmlFor="csv-upload" className={styles.file_label}>
                <BiUpload />
                {csvFile ? csvFile.name : 'Selecionar arquivo CSV'}
              </label>
            </div>

            <button
              onClick={handleProcessCSV}
              disabled={!csvFile}
              className={styles.process_button}
            >
              Processar Arquivo
            </button>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className={styles.processing}>
            <div className={styles.spinner}></div>
            <p>Processando arquivo...</p>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 'review' && (
          <div className={styles.review_section}>
            <div className={styles.summary_cards}>
              <div className={`${styles.summary_card} ${styles.success}`}>
                <BiCheck />
                <div>
                  <div className={styles.card_value}>{getValidCount()}</div>
                  <div className={styles.card_label}>Válidos</div>
                </div>
              </div>

              {getNotFoundCount() > 0 && (
                <div className={`${styles.summary_card} ${styles.error}`}>
                  <BiError />
                  <div>
                    <div className={styles.card_value}>{getNotFoundCount()}</div>
                    <div className={styles.card_label}>Não Encontrados</div>
                  </div>
                </div>
              )}

              {getNoStockCount() > 0 && (
                <div className={`${styles.summary_card} ${styles.error}`}>
                  <BiError />
                  <div>
                    <div className={styles.card_value}>{getNoStockCount()}</div>
                    <div className={styles.card_label}>Sem Estoque</div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.items_table}>
              <table>
                <thead>
                  <tr>
                    <th>Linha</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Preço Unit.</th>
                    <th>Subtotal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.map((item, index) => (
                    <tr key={index} className={styles[item.status]}>
                      <td>{item.lineNumber}</td>
                      <td>
                        {item.produto?.nome || item.gtin}
                        {item.produto?.industria_nome && (
                          <div className={styles.industry_tag}>
                            {item.produto.industria_nome}
                          </div>
                        )}
                      </td>
                      <td>{item.quantidade}</td>
                      <td>R$ {item.preco_unitario.toFixed(2)}</td>
                      <td>R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                      <td>
                        {item.status === 'valid' && <span className={styles.badge_success}>Válido</span>}
                        {item.status === 'not_found' && <span className={styles.badge_error}>Não encontrado</span>}
                        {item.status === 'no_stock' && <span className={styles.badge_error}>Sem estoque</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.total_section}>
              <div className={styles.total_label}>Total da Venda:</div>
              <div className={styles.total_value}>R$ {getTotalValue().toFixed(2)}</div>
            </div>

            <div className={styles.action_buttons}>
              <button onClick={handleClose} className={styles.cancel_button}>
                Cancelar
              </button>
              <button
                onClick={handleFinalizeSale}
                disabled={getValidCount() === 0}
                className={styles.finalize_button}
              >
                Vender Itens Válidos ({getValidCount()})
                <BiChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Finalizing */}
        {step === 'finalizing' && (
          <div className={styles.processing}>
            <div className={styles.spinner}></div>
            <p>Finalizando venda...</p>
          </div>
        )}

        {/* Step 6: Success */}
        {step === 'success' && (
          <div className={styles.success_section}>
            <BiCheck className={styles.success_icon} />
            <h3>Venda realizada com sucesso!</h3>
            <p>A página será recarregada automaticamente...</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

