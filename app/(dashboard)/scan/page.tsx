
"use client";

import styles from './page.module.css';

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import {  Result } from "@zxing/library";

// Aspect ratio and crop size factor
const DESIRED_CROP_ASPECT_RATIO = 3 / 2;
const CROP_SIZE_FACTOR = 0.3;

export default function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCroppedCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropOverlayRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

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
            intervalId = setInterval(captureFrameAndCrop, 1);
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
      const cropY = (video.videoHeight - cropHeight) / 2;

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

      console.log(`Crop area: x=${cropX}, y=${cropY}, width=${cropWidth}, height=${cropHeight}, videoWidth=${video.videoWidth}, videoHeight=${video.videoHeight}, container=${containerRect.width}x${containerRect.height}  `);


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
      overlayDiv.style.boxSizing = 'border-box';

      
      const decodeCanvas = async () => {
        try {
          const result: Result = await codeReader.current.decodeFromCanvas(displayCanvas);
          console.log("Decoded barcode:", result.getText());
          setBarcodeResult(result.getText());
          navigator.vibrate([200, 100, 200]);
        } catch (err: unknown) {
           if (err instanceof Error && err.name !== "NotFoundException") {
                console.error("Decoding error:", err);
              }
        }
      };

      decodeCanvas(); // Call the async function
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

  return (
    <div className={styles.container}>
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

            <div className={styles.line}></div>
            {barcodeResult}

          </div>

          
        </div>
      )}
      {error && <p style={{ color: '#ef4444', marginTop: '1rem', fontSize: '1rem' }}>{error}</p>}

      <canvas ref={displayCroppedCanvasRef} className={styles.canvas}>
        Seu navegador não suporta o elemento canvas.
      </canvas>       
     
    </div>
  );
}