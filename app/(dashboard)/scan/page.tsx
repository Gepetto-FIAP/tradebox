"use client";

import styles from './page.module.css';
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {  Result } from "@zxing/library";

import { BiBasket, BiCartAdd, BiChevronRight, BiChevronUp, BiPlus, BiX, BiArrowBack, BiMinus  } from "react-icons/bi";
import MoneyInput from '@/components/ui/InputMoney/InputMoney';
import Button from '@/components/ui/Button/Button';


// Aspect ratio and crop size factor
const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
const CROP_SIZE_FACTOR = 0.3;

export default function CameraView() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCroppedCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropOverlayRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  const [productInfo, setProductInfo] = useState<any>(null);
  const [barcodeResult, setBarcodeResult] = useState<any>(null);

  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.style.animationPlayState = barcodeResult ? 'paused' : 'running';
    }
  }, [barcodeResult]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            intervalId = setInterval(captureFrameAndCrop, 100);
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Impossível acessar a câmera. Verifique as permissões.");
      }
    };

    const captureFrameAndCrop = () => {
      if (!videoRef.current || !displayCroppedCanvasRef.current || !cropOverlayRef.current) return;

      const video = videoRef.current;
      const displayCanvas = displayCroppedCanvasRef.current;
      const displayContext = displayCanvas.getContext("2d");
      const overlayDiv = cropOverlayRef.current;

      if (!displayContext) return;

      const tempCanvas = document.createElement("canvas");
      const tempContext = tempCanvas.getContext("2d");
      if (!tempContext) return;

      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      tempContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

      let cropWidth, cropHeight;
      const videoRatio = video.videoWidth / video.videoHeight;

      if (videoRatio / DESIRED_CROP_ASPECT_RATIO > 1) {
        cropHeight = video.videoHeight * CROP_SIZE_FACTOR;
        cropWidth = cropHeight * DESIRED_CROP_ASPECT_RATIO;
      } else {
        cropWidth = video.videoWidth * CROP_SIZE_FACTOR;
        cropHeight = cropWidth / DESIRED_CROP_ASPECT_RATIO;
      }

      cropWidth = Math.min(cropWidth, video.videoWidth);
      cropHeight = Math.min(cropHeight, video.videoHeight);

      const MIN_CROP_WIDTH = 200;
      const MAX_CROP_WIDTH = 700;
      const MIN_CROP_HEIGHT = 100;
      const MAX_CROP_HEIGHT = 500;

      cropWidth = Math.max(MIN_CROP_WIDTH, Math.min(MAX_CROP_WIDTH, cropWidth));
      cropHeight = Math.max(MIN_CROP_HEIGHT, Math.min(MAX_CROP_HEIGHT, cropHeight));

      const cropX = (video.videoWidth - cropWidth) / 2;
      
      const cropYOffset = video.videoHeight * 0.15; 
      const cropY = ((video.videoHeight - cropHeight) / 2) - cropYOffset;

      displayCanvas.width = cropWidth;
      displayCanvas.height = cropHeight;

      displayContext.drawImage(
        tempCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );

      const container = video.parentElement;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = containerRect.width / containerRect.height;

      let drawWidth = containerRect.width;
      let drawHeight = containerRect.height;
      let offsetX = 0;
      let offsetY = 0;

      if (videoAspect > containerAspect) {
        // Vídeo é mais largo: cortado nas laterais
        drawHeight = containerRect.height;
        drawWidth = drawHeight * videoAspect;
        offsetX = (drawWidth - containerRect.width) / 2;
      } else {
        // Vídeo é mais alto: cortado no topo/fundo
        drawWidth = containerRect.width;
        drawHeight = drawWidth / videoAspect;
        offsetY = (drawHeight - containerRect.height) / 2;
      }

      // Agora, calcule o overlay relativo ao vídeo exibido:
      const overlayLeft = ((cropX / video.videoWidth) * drawWidth) - offsetX;
      const overlayTop = ((cropY / video.videoHeight) * drawHeight) - offsetY;
      const overlayWidth = (cropWidth / video.videoWidth) * drawWidth;
      const overlayHeight = (cropHeight / video.videoHeight) * drawHeight;

      overlayDiv.style.position = 'absolute';
      overlayDiv.style.left = `${overlayLeft}px`;
      overlayDiv.style.top = `${overlayTop}px`;
      overlayDiv.style.width = `${overlayWidth}px`;
      overlayDiv.style.height = `${overlayHeight}px`;
      overlayDiv.style.borderRadius = '8px';
      overlayDiv.style.pointerEvents = 'none';
      overlayDiv.style.opacity = '1';
      overlayDiv.style.boxSizing = 'border-box';
      
      const decodeCanvas = async () => {
        try {
          const result: Result = await codeReader.current.decodeFromCanvas(displayCanvas);
          const decodedText = result.getText();
          
          console.log("Decoded barcode:", decodedText);

          consultarProduto(decodedText);
        
        } catch (err: unknown) {
          if (err instanceof Error && err.name !== "NotFoundException") {
            console.error("Decoding error:", err);
          }
        }
      };

      decodeCanvas();
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const [productValue, setProductValue] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [productStock, setProductStock] = useState<number>(0);
  const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
  const [industries, setIndustries] = useState<any[]>([]);
  const [isQuickRegister, setIsQuickRegister] = useState(false);
  const [basketOpen, setBasketOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);

  // Buscar indústrias ao montar
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch('/api/industries');
        const data = await response.json();
        if (data.success && data.industries) {
          setIndustries(data.industries);
        }
      } catch (error) {
        console.error('Erro ao buscar indústrias:', error);
      }
    };
    fetchIndustries();
  }, []);

  async function consultarProduto(codigo: string) {
    // Evitar múltiplas consultas do mesmo código enquanto já está processando
    if (barcodeResult === codigo) return;
    
    setBarcodeResult(codigo);
    setIsQuickRegister(false);
    
    try {
      // 1. Primeiro buscar no BD local
      const localResponse = await fetch(`/api/products/gtin/${codigo}`);
      const localData = await localResponse.json();
      
      if (localData.success && localData.found && localData.products && localData.products.length > 0) {
        // Produto encontrado no catálogo
        // Se houver múltiplos, selecionar o com menor preço base
        const product = localData.products.reduce((prev: any, current: any) => 
          (current.preco_base < prev.preco_base) ? current : prev
        );
        
        // Validar estoque
        if (product.estoque <= 0) {
          setProductInfo({ 
            error: `Produto "${product.nome}" está sem estoque disponível.` 
          });
          return;
        }
        
        setProductInfo({
          id: product.id,
          nome: product.nome,
          ean: codigo,
          marca: product.industria_nome || 'Sem marca',
          categoria: product.categoria_nome || 'Sem categoria',
          imageBase64: 'data:image/png;base64,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', // Produto local não tem imagem
          preco_base: product.preco_base,
          estoque: product.estoque
        });
        setProductValue(Math.round(product.preco_base * 100)); // Converter para centavos
        setProductQuantity(1);
        setProductStock(product.estoque);
        return;
      }
      
      // 2. Se não encontrado, buscar na API externa
      const externalResponse = await fetch(`/api/gtin?codigo=${codigo}`);
      const externalData = await externalResponse.json();
      
      if (externalData.success && externalData.product) {
        // Produto encontrado na API externa - mostrar cadastro rápido
        setProductInfo({
          ...externalData.product,
          ean: codigo
        });
        setIsQuickRegister(true);
        setProductValue(0);
        setProductQuantity(1);
        setProductStock(0);
        setSelectedIndustry(null);
      } else {
        setProductInfo({ error: "Produto não encontrado." });
      }
    } catch (err) {
      console.error('Erro ao consultar produto:', err);
      setProductInfo({ error: "Erro ao consultar produto." });
    }
  }

  async function handleQuickRegister() {
    if (!productValue || productValue === 0) {
      alert("Preencha o preço de venda!");
      return;
    }

    if (!productStock || productStock < 0) {
      alert("Preencha o estoque inicial!");
      return;
    }

    // Validar se a quantidade de venda não excede o estoque cadastrado
    if (productQuantity > productStock) {
      alert(`Quantidade de venda (${productQuantity}) não pode ser maior que o estoque cadastrado (${productStock})`);
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gtin: productInfo.ean,
          nome: productInfo.nome,
          descricao: productInfo.descricao || '',
          preco_base: productValue / 100,
          preco_custo: 0,
          estoque: productStock,
          categoria_id: null,
          industria_id: selectedIndustry,
          ativo: 'Y'
        })
      });

      const data = await response.json();
      
      if (data.success && data.product) {
        addToCart({
          ...productInfo,
          id: data.product.id,
          productValue: productValue / 100,
          quantity: productQuantity,
          preco_base: productValue / 100,
          estoque: data.product.estoque
        });
        
        setProductInfo(null);
        setBarcodeResult(null);
        setProductValue(0);
        setProductQuantity(1);
        setProductStock(0);
        setSelectedIndustry(null);
        setIsQuickRegister(false);
      } else {
        alert(data.message || 'Erro ao cadastrar produto');
      }
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto');
    }
  }

  function addToCart(product: any) {
    setCart((prev) => [...prev, product]);
  }

  const totalValue = cart.reduce((sum, item) => {
    return sum + (item.productValue * item.quantity);
  }, 0);

  function updateCartItemQuantity(index: number, newQuantity: number) {
    setCart(prevCart =>
      newQuantity > 0
        ? prevCart.map((item, i) =>
            i === index ? { ...item, quantity: newQuantity } : item
          )
        : prevCart.filter((_, i) => i !== index) // remove o item se quantidade for zero
    );
  }

  function getCleanCart(cart: any[]) {
    return cart.map(item => ({
      produto_id: item.id,
      quantidade: item.quantity,
      preco_unitario: item.productValue
    }));
  }

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  async function handleFinalizeSale() {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho antes de finalizar a venda');
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: getCleanCart(cart),
          observacoes: null
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Venda realizada com sucesso!\nTotal: R$ ${data.valor_total.toFixed(2)}\nItens: ${data.quantidade_itens}`);
        setCart([]);
        setBasketOpen(false);
      } else {
        alert(data.message || 'Erro ao finalizar venda');
      }
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className={styles.container_scan}>
      
      
      <button 
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, fontSize: '0.7rem' }}
      onClick={() => consultarProduto("7894900700398 ")}
      >
        Testar consulta ... 

      </button>
      
      {/* Botão de voltar */}
      <button 
        className={styles.back_button}
        onClick={() => router.push('/seller/sell')}
        aria-label="Voltar"
      >
        <BiArrowBack />
        Voltar
      </button>

      {!error && (
        <div className={styles.cam_wrapper}>
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            playsInline
            muted
          />
          <div className={styles.overlay} ref={cropOverlayRef}> 
            <span></span>
            <span></span>
            <div className={styles.line} ref={lineRef}></div>
          </div>
        </div>
      )}

      {error && 
      <p style={{ color: '#f55', marginTop: '1rem', fontSize: '1rem' }}>
        {error}
      </p>}

      <canvas ref={displayCroppedCanvasRef} className={styles.canvas}></canvas>   
      
      <div className={styles.product_box_wrapper}>
        {barcodeResult && !productInfo && ( 
          <div>Consultando: {barcodeResult}</div>
        )}

        {productInfo && (
          <div className={styles.product_box}>
            {productInfo.error ? (
              <div className={styles.product_error}>
                {productInfo.error}
              </div>
            ) : (
              <div className={styles.product_content}>
                <div className={styles.product_image}>
                  `{console.log(productInfo)}`
                  {productInfo.imageBase64 && <img src={productInfo.imageBase64} alt={productInfo.nome} />}
                </div>
                <div className={styles.product_info}>
                  <div className={styles.product_name}>
                    {productInfo.nome || "Produto"}
                  </div>
                  <div className={styles.product_gtin}>
                    <div>
                      GTIN: 
                    </div>
                    <div>
                      {productInfo.ean }  
                    </div>
                  </div>
                  <div className={styles.product_brand}>
                    <div>
                      Marca: 
                    </div>
                    <div>
                      {productInfo.marca }
                    </div>
                  </div>
                  
                  {/* Campos do cadastro rápido inline */}
                  {isQuickRegister && (
                    <div className={styles.quick_register}>
                      <div style={{ fontSize: '0.85rem', color: '#fbbf24', marginTop: '0.5rem' }}>
                        Produto não encontrado no catálogo. Preencha os dados para cadastro rápido:
                      </div>
                      
                      {/* 1. Estoque (obrigatório) */}
                      <div style={{ marginTop: '0.75rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                          Estoque inicial *:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={productStock}
                          onChange={(e) => setProductStock(Number(e.target.value))}
                          placeholder="Ex: 10"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}
                        />
                      </div>
                      
                      {/* 2. Indústria (opcional) */}
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                          Indústria (opcional):
                        </label>
                        <select
                          value={selectedIndustry || ''}
                          onChange={(e) => setSelectedIndustry(e.target.value ? Number(e.target.value) : null)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}
                        >
                          <option value="">Sem indústria</option>
                          {industries.map((ind) => (
                            <option key={ind.id} value={ind.id}>
                              {ind.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* 3. Quantidade de venda */}
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                          Quantidade a vender (após cadastro):
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-bg)',
                              color: 'var(--color-secondary)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <BiMinus />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(Number(e.target.value))}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-bg)',
                              color: 'var(--color-secondary)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              textAlign: 'center'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setProductQuantity(productQuantity + 1)}
                            style={{
                              padding: '0.5rem',
                              backgroundColor: 'var(--color-bg)',
                              color: 'var(--color-secondary)',
                              border: '1px solid var(--color-border)',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            <BiPlus />
                          </button>
                        </div>
                        {productStock > 0 && productQuantity > productStock && (
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                            ⚠️ Quantidade maior que estoque ({productStock})
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Controle de quantidade para produto existente */}
                  {!isQuickRegister && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
                        Quantidade:
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <BiMinus />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={productInfo.estoque || 999}
                          value={productQuantity}
                          onChange={(e) => setProductQuantity(Number(e.target.value))}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (productInfo.estoque && productQuantity < productInfo.estoque) {
                              setProductQuantity(productQuantity + 1);
                            } else if (!productInfo.estoque) {
                              setProductQuantity(productQuantity + 1);
                            }
                          }}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: 'var(--color-bg)',
                            color: 'var(--color-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <BiPlus />
                        </button>
                      </div>
                      {productInfo.estoque && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', opacity: 0.7, marginTop: '0.25rem' }}>
                          Estoque disponível: {productInfo.estoque} unidades
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={styles.button_wrapper}>
                    <button className={styles.button}
                      onClick={() => {
                        if (isQuickRegister) {
                          handleQuickRegister();
                        } else {
                          if (!productValue || Number(productValue) === 0) {
                            alert("Preencha o valor do produto!");
                            return;
                          }
                          // Validar estoque
                          if (productInfo.estoque && productQuantity > productInfo.estoque) {
                            alert(`Quantidade solicitada (${productQuantity}) excede o estoque disponível (${productInfo.estoque})`);
                            return;
                          }
                          addToCart({
                            ...productInfo,
                            productValue: productValue / 100,
                            quantity: productQuantity
                          });
                          setProductInfo(null);
                          setBarcodeResult(null);
                          setProductValue(0);
                          setProductQuantity(1);
                        }
                      }}
                      >
                        <div className={styles.button_icon}>
                          <BiCartAdd />
                        </div>
                        <div className={styles.button_text}>
                          {isQuickRegister ? 'Cadastrar e Adicionar' : 'Adicionar'}
                        </div>
                    </button>
                  </div>
                </div>

                <div className={styles.product_price}>
                  <div className={styles.product_price_label}>
                    {isQuickRegister ? 'Preço Venda' : 'R$'}
                  </div>
                  <MoneyInput 
                  value={productValue} 
                  onValueChange={setProductValue} />
                </div>

              </div>
            )}
            <button className={styles.button_close} onClick={() => {
              setProductInfo(null);
              setBarcodeResult(null);
              setProductValue(0);
              setProductQuantity(1);
              setProductStock(0);
              setSelectedIndustry(null);
              setIsQuickRegister(false);
            }}>
                <BiX />
              </button>
          </div>
        )}    
      </div>


      <div className={`${styles.basket_wrapper} ${basketOpen ? styles.open : ''}`}>
        <button className={styles.basket_open_button} onClick={() => setBasketOpen(!basketOpen)}>
          <BiChevronUp />
        </button>
        <div className={styles.basket_header}>
          <div className={styles.basket_items}>
            <div className={styles.basket_icon}>
              <BiBasket />
            </div>
            <div className={styles.basket_items_quantity}>
              {cart.length} Itens
            </div>
          </div>
          <div className={styles.basket_value}>
             {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
          </div>
        </div>
        <div className={styles.basket_content}>
          <div className={styles.basket_items_list}>
            {
              cart.map((cartItem, index) => (
                <div key={index} className={styles.basket_item}>
                  <div className={styles.basket_product_image}>
                    <img src={cartItem.imageBase64} alt={cartItem.nome} />
                  </div>
                  <div className={styles.basket_product_info}>
                    <div className={styles.basket_product_name}>
                      {cartItem.nome}
                    </div>
                    <div className={styles.basket_product_quantity}>
                      <button onClick={() => updateCartItemQuantity(index, cartItem.quantity - 1)}>-</button>
                      <div>
                        {cartItem.quantity}
                      </div>
                      <button onClick={() => updateCartItemQuantity(index, cartItem.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className={styles.basket_product_price}> 
                    <div className={styles.basket_product_total}>
                      {(cartItem.productValue * cartItem.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                    </div>
                    <div className={styles.basket_product_subtotal}>
                      {cartItem.productValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'})}
                    </div>
                  </div>

                </div>
              ))
            }
          </div>

          <div className={styles.basket_checkout}>
            <button 
            onClick={handleFinalizeSale}
            disabled={isCheckingOut || cart.length === 0}
            className={styles.checkout_button}>
              <div className={styles.checkout_button_text}>
                {isCheckingOut ? 'Processando...' : 'Finalizar Venda'}
              </div>
              <div className={styles.checkout_button_icon}>
                <BiChevronRight />
              </div>
            </button>
          </div>
        </div>


      </div>

    </div>
  );
}