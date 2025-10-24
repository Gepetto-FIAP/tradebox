'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import styles from './CameraScanner.module.css';
import { BiX, BiCamera } from 'react-icons/bi';

interface CameraScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
  title?: string;
}

export default function CameraScanner({ 
  onDetected, 
  onClose, 
  title = 'Escanear Código de Barras' 
}: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    let mounted = true;
    let hasDetected = false; // Flag para evitar múltiplas detecções

    async function startScanner() {
      if (!videoRef.current) return;

      try {
        // Solicitar permissão da câmera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' // Câmera traseira em mobile
          } 
        });

        if (!mounted) {
          // Se componente foi desmontado, parar stream
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setHasPermission(true);
        setIsScanning(true);

        // Inicializar ZXing reader
        const codeReader = new BrowserMultiFormatReader();
        readerRef.current = codeReader;

        // Começar a decodificar do stream de vídeo
        codeReader.decodeFromVideoDevice(
          null, // null usa a câmera padrão
          videoRef.current,
          (result, error) => {
            if (result && !hasDetected) {
              // Código detectado!
              hasDetected = true; // Marcar como detectado para evitar múltiplas chamadas
              const code = result.getText();
              console.log('Código detectado:', code);
              
              // Vibrar se disponível (feedback tátil)
              if (navigator.vibrate) {
                navigator.vibrate(200);
              }

              // Parar scanner e notificar pai
              cleanup();
              onDetected(code);
            }

            if (error && error.name !== 'NotFoundException') {
              // NotFoundException é esperado quando não há código na imagem
              console.error('Erro ao escanear:', error);
            }
          }
        );

      } catch (err: any) {
        console.error('Erro ao acessar câmera:', err);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permissão para acessar a câmera foi negada. Por favor, autorize o acesso.');
          setHasPermission(false);
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('Nenhuma câmera foi encontrada no dispositivo.');
          setHasPermission(false);
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Câmera está em uso por outro aplicativo.');
          setHasPermission(false);
        } else {
          setError('Erro ao iniciar câmera. Tente novamente.');
          setHasPermission(false);
        }
      }
    }

    function cleanup() {
      if (readerRef.current) {
        readerRef.current.reset();
        readerRef.current = null;
      }
      setIsScanning(false);
    }

    startScanner();

    return () => {
      mounted = false;
      cleanup();
    };
  }, []); // Remover onDetected das dependências para evitar loop

  function handleClose() {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            aria-label="Fechar"
          >
            <BiX size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {error ? (
            <div className={styles.errorContainer}>
              <BiCamera size={64} />
              <p className={styles.errorMessage}>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => {
                  setError('');
                  setHasPermission(null);
                  window.location.reload(); // Recarregar para pedir permissão novamente
                }}
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              <div className={styles.videoContainer}>
                <video 
                  ref={videoRef} 
                  className={styles.video}
                  playsInline
                  muted
                />
                <div className={styles.scannerOverlay}>
                  <div className={styles.scannerFrame}>
                    <div className={styles.corner} style={{ top: 0, left: 0 }} />
                    <div className={styles.corner} style={{ top: 0, right: 0 }} />
                    <div className={styles.corner} style={{ bottom: 0, left: 0 }} />
                    <div className={styles.corner} style={{ bottom: 0, right: 0 }} />
                  </div>
                  <div className={styles.scannerLine} />
                </div>
              </div>

              <div className={styles.instructions}>
                <p>Posicione o código de barras dentro da área marcada</p>
                {isScanning && (
                  <p className={styles.scanningText}>
                    <span className={styles.pulse}>●</span> Escaneando...
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

