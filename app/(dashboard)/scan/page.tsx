
"use client";

import styles from './page.module.css';
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {  Result } from "@zxing/library";

import { BiBasket, BiChevronRight, BiChevronUp, BiPlus, BiX  } from "react-icons/bi";


// Aspect ratio and crop size factor
const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
const CROP_SIZE_FACTOR = 0.3;

export default function CameraView() {
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
        console.log("Video is wider than container");
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
          console.log("Decoded barcode:", result.getText());

          consultarProduto(result.getText());
        
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


  async function consultarProduto(codigo: string) {

    if (productInfo != null) return;
    setBarcodeResult(codigo);

    try {
      const response = await fetch(`/api/gtin?codigo=${codigo}`);
      const data = await response.json();      
      setProductInfo(data);
    } catch (err) {
      setProductInfo({ error: "Erro ao consultar produto." });
    }
  }

const [basketOpen, setBasketOpen] = useState(false);

  return (
    
    <div className={styles.container_scan}>

      <button 
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1, fontSize: '0.7rem' }}
      onClick={() => consultarProduto("7894900700398 ")}
      >
        Testar consulta
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
          <>
            <div>Consultando: {barcodeResult}</div>
          </>
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
                  <img src={productInfo.imageBase64} />
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
                </div>
                <div className={styles.button_wrapper}>
                  <button className={styles.button} >
                     <BiPlus   />
                  </button>
                </div>
              </div>
            )}
            <button className={styles.button_close} onClick={() => (
              setProductInfo(null),
              setBarcodeResult(null)
              )}>
                <BiX />
              </button>
          </div>
        )}    
      </div>




      <div className={`${styles.basket_wrapper} ${basketOpen ? styles.open : ''}`}>
        <button className={styles.basket_open_button} onClick={() => setBasketOpen(!basketOpen)}>
          <BiChevronUp />
        </button>
        <div className={styles.basket}>
          <div className={styles.basket_content}>
            <div className={styles.basket_items}>
              <BiBasket />
              <div className={styles.basket_items_quantity}>
                0 Itens
              </div>
            </div>
            <div className={styles.basket_value}>
              R$ 0,00
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}