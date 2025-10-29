'use client';

import { useState } from 'react';
import Modal from '../../../ui/Modal/Modal';
import MoneyInput from '../../../ui/InputMoney/InputMoney';
import styles from './ManualSaleModal.module.css';
import { BiSearch, BiPlus, BiTrash, BiChevronRight } from 'react-icons/bi';

interface Product {
  id: number;
  nome: string;
  gtin: string;
  preco_base: number;
  estoque: number;
  industria_nome?: string;
}

interface CartItem extends Product {
  quantidade: number;
  preco_unitario: number;
}

interface ManualSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleComplete?: () => void;
}

export default function ManualSaleModal({ isOpen, onClose, onSaleComplete }: ManualSaleModalProps) {
  const [gtin, setGtin] = useState('');
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = async () => {
    if (!gtin.trim()) {
      setError('Digite um GTIN');
      return;
    }

    setLoading(true);
    setError('');
    setSearchedProduct(null);

    try {
      const response = await fetch(`/api/products/gtin/${gtin.trim()}`);
      const data = await response.json();

      if (data.success && data.found && data.products && data.products.length > 0) {
        // Se houver múltiplos produtos, selecionar o com menor preço base
        const product = data.products.reduce((prev: Product, current: Product) => 
          (current.preco_base < prev.preco_base) ? current : prev
        );
        
        // Validar estoque
        if (product.estoque <= 0) {
          setError(`Produto "${product.nome}" está sem estoque disponível`);
          return;
        }
        
        setSearchedProduct(product);
        setQuantidade(1);
        setPrecoUnitario(Math.round(product.preco_base * 100));
      } else {
        setError('Produto não encontrado no catálogo');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!searchedProduct) return;

    if (quantidade <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }

    if (precoUnitario <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }

    // Validar estoque
    if (quantidade > searchedProduct.estoque) {
      setError(`Quantidade solicitada (${quantidade}) excede o estoque disponível (${searchedProduct.estoque})`);
      return;
    }

    const newItem: CartItem = {
      ...searchedProduct,
      quantidade,
      preco_unitario: precoUnitario / 100
    };

    setCart([...cart, newItem]);
    setGtin('');
    setSearchedProduct(null);
    setQuantidade(1);
    setPrecoUnitario(0);
    setError('');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(index);
      return;
    }

    setCart(cart.map((item, i) => 
      i === index ? { ...item, quantidade: newQuantity } : item
    ));
  };

  const getTotalValue = () => {
    return cart.reduce((sum, item) => sum + (item.quantidade * item.preco_unitario), 0);
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      setError('Adicione pelo menos um produto ao carrinho');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: cart.map(item => ({
            produto_id: item.id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Venda realizada com sucesso!\nTotal: R$ ${data.valor_total.toFixed(2)}`);
        setCart([]);
        setGtin('');
        setSearchedProduct(null);
        setQuantidade(1);
        setPrecoUnitario(0);
        if (onSaleComplete) onSaleComplete();
        onClose();
      } else {
        setError(data.message || 'Erro ao finalizar venda');
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Venda Manual">
      <div className={styles.modal_content}>
        {/* Seção de Busca */}
        <div className={styles.search_section}>
          <div className={styles.search_input_wrapper}>
            <input
              type="text"
              value={gtin}
              onChange={(e) => setGtin(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite o GTIN do produto"
              className={styles.search_input}
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={styles.search_button}
            >
              <BiSearch />
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {error && <div className={styles.error_message}>{error}</div>}

          {/* Produto Encontrado */}
          {searchedProduct && (
            <div className={styles.product_found}>
              <div className={styles.product_info}>
                <h4>{searchedProduct.nome}</h4>
                <p className={styles.product_gtin}>GTIN: {searchedProduct.gtin}</p>
                {searchedProduct.industria_nome && (
                  <p className={styles.product_industry}>{searchedProduct.industria_nome}</p>
                )}
              </div>

              <div className={styles.product_fields}>
                <div className={styles.field}>
                  <label>Quantidade:</label>
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className={styles.quantity_input}
                  />
                </div>

                <div className={styles.field}>
                  <label>Preço Unitário:</label>
                  <div className={styles.price_input_wrapper}>
                    <span className={styles.currency}>R$</span>
                    <MoneyInput
                      value={precoUnitario}
                      onValueChange={setPrecoUnitario}
                    />
                  </div>
                </div>
              </div>

              <button onClick={handleAddToCart} className={styles.add_button}>
                <BiPlus />
                Adicionar ao Carrinho
              </button>
            </div>
          )}
        </div>

        {/* Carrinho */}
        {cart.length > 0 && (
          <div className={styles.cart_section}>
            <h3>Carrinho ({cart.length} {cart.length === 1 ? 'item' : 'itens'})</h3>
            <div className={styles.cart_items}>
              {cart.map((item, index) => (
                <div key={index} className={styles.cart_item}>
                  <div className={styles.cart_item_info}>
                    <div className={styles.cart_item_name}>{item.nome}</div>
                    <div className={styles.cart_item_gtin}>GTIN: {item.gtin}</div>
                  </div>

                  <div className={styles.cart_item_quantity}>
                    <button onClick={() => handleUpdateQuantity(index, item.quantidade - 1)}>
                      -
                    </button>
                    <span>{item.quantidade}</span>
                    <button onClick={() => handleUpdateQuantity(index, item.quantidade + 1)}>
                      +
                    </button>
                  </div>

                  <div className={styles.cart_item_price}>
                    <div className={styles.unit_price}>
                      R$ {item.preco_unitario.toFixed(2)}
                    </div>
                    <div className={styles.subtotal}>
                      R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(index)}
                    className={styles.remove_button}
                  >
                    <BiTrash />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.cart_total}>
              <span>Total:</span>
              <span className={styles.total_value}>
                R$ {getTotalValue().toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleFinalizeSale}
              disabled={isProcessing}
              className={styles.finalize_button}
            >
              {isProcessing ? 'Processando...' : 'Finalizar Venda'}
              <BiChevronRight />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

