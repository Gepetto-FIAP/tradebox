'use client';

import { useState, useEffect, FormEvent, useRef, useCallback } from 'react';
import { BiBarcode, BiSearch, BiScan } from 'react-icons/bi';
import styles from './AddProductForm.module.css';
import CameraScanner from '../CameraScanner/CameraScanner';

interface AddProductFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProductFormData {
  gtin: string;
  nome: string;
  descricao: string;
  preco_base: string;
  preco_custo: string;
  estoque: string;
  categoria_id: string;
  industria_id: string;
}

interface GTINProduct {
  gtin: string;
  nome: string;
  descricao?: string;
  marca?: string;
  categoria?: string;
}

interface Category {
  id: number;
  nome: string;
}

interface Industry {
  id: number;
  nome: string;
}

export default function AddProductForm({ onSuccess, onCancel }: AddProductFormProps) {
  const [step, setStep] = useState<'gtin' | 'form'>('gtin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gtinSearch, setGtinSearch] = useState('');
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    gtin: '',
    nome: '',
    descricao: '',
    preco_base: '',
    preco_custo: '',
    estoque: '0',
    categoria_id: '',
    industria_id: ''
  });

  // Buscar categorias e indústrias ao montar
  useEffect(() => {
    fetchCategories();
    fetchIndustries();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success && data.categories) {
        const validCategories = data.categories.filter((cat: Category) => cat.id != null);
        setCategories(validCategories);
      }
    } catch (err) {
      console.error('Erro ao buscar categorias:', err);
    }
  }

  async function fetchIndustries() {
    try {
      const res = await fetch('/api/industries');
      const data = await res.json();
      if (data.success && data.industries) {
        const validIndustries = data.industries.filter((ind: Industry) => ind.id != null);
        setIndustries(validIndustries);
      }
    } catch (err) {
      console.error('Erro ao buscar indústrias:', err);
    }
  }

  const handleOpenCameraScanner = useCallback(() => {
    setShowCameraScanner(true);
    setError('');
  }, []);

  const handleCameraDetected = useCallback((code: string) => {
    console.log('Camera detected code:', code);
    setShowCameraScanner(false);
    setGtinSearch(code);
    
    // Usar a função de busca existente
    searchByGTINCode(code);
  }, []);

  async function searchByGTINCode(code: string) {
    if (!code.trim()) {
      setError('Código inválido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Buscar dados do produto na API GTIN externa
      const gtinRes = await fetch(`/api/gtin?code=${code}`);
      const gtinData = await gtinRes.json();

      if (gtinData.success && gtinData.product) {
        // Preenche formulário com dados da API externa
        const product: GTINProduct = gtinData.product;
        setFormData({
          gtin: product.gtin,
          nome: product.nome,
          descricao: product.descricao || '',
          preco_base: '',
          preco_custo: '',
          estoque: '0',
          categoria_id: '',
          industria_id: ''
        });
        setStep('form');
      } else {
        // Não encontrou na API GTIN, permite cadastro manual
        setFormData(prev => ({ ...prev, gtin: code }));
        setStep('form');
      }
    } catch (err) {
      console.error('Erro ao buscar GTIN:', err);
      setError('Erro ao buscar produto. Você pode cadastrar manualmente.');
      setFormData(prev => ({ ...prev, gtin: code }));
      setStep('form');
    } finally {
      setLoading(false);
    }
  }

  async function searchByGTIN() {
    if (!gtinSearch.trim()) {
      setError('Digite um código de barras');
      return;
    }

    await searchByGTINCode(gtinSearch);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Validações
    if (!formData.gtin.trim()) {
      setError('GTIN é obrigatório');
      return;
    }

    if (!formData.nome.trim()) {
      setError('Nome do produto é obrigatório');
      return;
    }

    if (!formData.preco_base || parseFloat(formData.preco_base) <= 0) {
      setError('Preço de venda deve ser maior que zero');
      return;
    }

    const preco_custo = parseFloat(formData.preco_custo) || 0;
    const preco_base = parseFloat(formData.preco_base);

    if (preco_custo > preco_base) {
      setError('Preço de custo não pode ser maior que o preço de venda');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        gtin: formData.gtin.trim(),
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || undefined,
        preco_base: parseFloat(formData.preco_base),
        preco_custo: preco_custo > 0 ? preco_custo : undefined,
        estoque: parseInt(formData.estoque) || 0,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : undefined,
        industria_id: formData.industria_id ? parseInt(formData.industria_id) : undefined
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || data.error || 'Erro ao cadastrar produto');
      }
    } catch (err: any) {
      setError('Erro ao cadastrar produto. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  function skipToManualEntry() {
    setFormData({
      ...formData,
      gtin: gtinSearch || ''
    });
    setStep('form');
  }

  if (step === 'gtin') {
    return (
      <div className={styles.form_container}>
        <div className={styles.scan_section}>
          <BiBarcode className={styles.barcode_icon} />
          <h3>Escanear ou Buscar Produto</h3>
          <p className={styles.description}>
            Use a câmera para escanear o código de barras ou digite manualmente.
          </p>

          <div className={styles.scan_options}>
            <button
              type="button"
              onClick={handleOpenCameraScanner}
              className={styles.camera_button}
              disabled={loading}
            >
              <BiScan />
              Escanear com Câmera
            </button>

            <div className={styles.divider}>
              <span>ou</span>
            </div>

            <div className={styles.input_group}>
              <input
                type="text"
                placeholder="Digite o código de barras"
                value={gtinSearch}
                onChange={(e) => setGtinSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchByGTIN()}
                className={styles.input}
                disabled={loading}
              />
              <button
                type="button"
                onClick={searchByGTIN}
                disabled={loading || !gtinSearch.trim()}
                className={styles.search_button}
              >
                <BiSearch />
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.error_message}>
              {error}
            </div>
          )}

          <div className={styles.divider}>
            <span>ou</span>
          </div>

          <button
            type="button"
            onClick={skipToManualEntry}
            className={styles.manual_button}
            disabled={loading}
          >
            Cadastrar Manualmente
          </button>

          <button
            type="button"
            onClick={onCancel}
            className={styles.cancel_button}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>

        {/* Camera Scanner Modal */}
        {showCameraScanner && (
          <CameraScanner
            onDetected={handleCameraDetected}
            onClose={() => setShowCameraScanner(false)}
            title="Escanear Código de Barras"
          />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form_container}>
      <div className={styles.form_section}>
        <h3>Dados do Produto</h3>

        <div className={styles.form_grid}>
          <div className={styles.form_group}>
            <label htmlFor="gtin">
              GTIN / Código de Barras <span className={styles.required}>*</span>
            </label>
            <input
              id="gtin"
              type="text"
              value={formData.gtin}
              onChange={(e) => setFormData({ ...formData, gtin: e.target.value })}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="nome">
              Nome do Produto <span className={styles.required}>*</span>
            </label>
            <input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.form_group_full}>
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className={styles.textarea}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="preco_base">
              Preço de Venda (R$) <span className={styles.required}>*</span>
            </label>
            <input
              id="preco_base"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco_base}
              onChange={(e) => setFormData({ ...formData, preco_base: e.target.value })}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="preco_custo">
              Preço de Custo (R$)
              <span className={styles.optional}> (opcional)</span>
            </label>
            <input
              id="preco_custo"
              type="number"
              step="0.01"
              min="0"
              value={formData.preco_custo}
              onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
              className={styles.input}
              disabled={loading}
            />
            <small className={styles.hint}>
              Pode ser definido pela indústria posteriormente
            </small>
          </div>

          <div className={styles.form_group}>
            <label htmlFor="estoque">Estoque Inicial</label>
            <input
              id="estoque"
              type="number"
              min="0"
              value={formData.estoque}
              onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="categoria_id">Categoria</label>
            <select
              id="categoria_id"
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={`cat-${cat.id}`} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.form_group}>
            <label htmlFor="industria_id">Indústria / Fornecedor</label>
            <select
              id="industria_id"
              value={formData.industria_id}
              onChange={(e) => setFormData({ ...formData, industria_id: e.target.value })}
              className={styles.select}
              disabled={loading}
            >
              <option value="">Selecione uma indústria</option>
              {industries.map((ind) => (
                <option key={`ind-${ind.id}`} value={ind.id}>
                  {ind.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className={styles.error_message}>
            {error}
          </div>
        )}

        <div className={styles.button_group}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancel_button}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submit_button}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
          </button>
        </div>
      </div>

      {/* Camera Scanner Modal */}
      {showCameraScanner && (
        <CameraScanner
          onDetected={handleCameraDetected}
          onClose={() => setShowCameraScanner(false)}
          title="Escanear Código de Barras"
        />
      )}
    </form>
  );
}
