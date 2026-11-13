/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Check, Move, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import {
  LoadedImageSource,
  renderOptimizedProfilePhoto,
  SquareCropParams,
} from '../../utils/imageProcessor';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface PhotoCropModalProps {
  isOpen: boolean;
  imageSource: LoadedImageSource | null;
  onCancel: () => void;
  onConfirm: (optimizedDataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  isOpen,
  imageSource,
  onCancel,
  onConfirm,
  title = 'Ajustar Enquadramento',
  subtitle = 'Arraste para centrar e ajuste o zoom. A imagem será apresentada em formato circular.',
}) => {
  const { playEnterSound, playExitSound } = useInterfaceAudio();
  const cropBoxRef = useRef<HTMLDivElement | null>(null);

  const [boxSize, setBoxSize] = useState<number>(264);
  const [zoom, setZoom] = useState<number>(1);
  const [panRatioX, setPanRatioX] = useState<number>(0);
  const [panRatioY, setPanRatioY] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dragStateRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startPanX: number;
    startPanY: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Repor valores sempre que abre com uma nova imagem
  useEffect(() => {
    if (isOpen && imageSource) {
      setZoom(1);
      setPanRatioX(0);
      setPanRatioY(0);
      setErrorMsg(null);
      setIsProcessing(false);
    }
  }, [isOpen, imageSource]);

  // Medir a caixa quadrada de recorte de forma responsiva
  useEffect(() => {
    if (!isOpen) return;
    const el = cropBoxRef.current;
    if (!el) return;

    const updateSize = () => {
      if (el.clientWidth > 0) {
        setBoxSize(el.clientWidth);
      }
    };
    updateSize();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateSize);
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  if (!isOpen || !imageSource) return null;

  const minDim = Math.min(imageSource.width, imageSource.height);
  const displayWidth = boxSize * zoom * (imageSource.width / minDim);
  const displayHeight = boxSize * zoom * (imageSource.height / minDim);
  const maxShiftX = Math.max(0, (displayWidth - boxSize) / 2);
  const maxShiftY = Math.max(0, (displayHeight - boxSize) / 2);
  const translateX = panRatioX * maxShiftX;
  const translateY = panRatioY * maxShiftY;

  const clampRatio = (val: number) => Math.max(-1, Math.min(1, val));

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: panRatioX,
      startPanY: panRatioY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.startX;
    const dy = e.clientY - dragStateRef.current.startY;

    if (maxShiftX > 0.5) {
      setPanRatioX(clampRatio(dragStateRef.current.startPanX + dx / maxShiftX));
    }
    if (maxShiftY > 0.5) {
      setPanRatioY(clampRatio(dragStateRef.current.startPanY + dy / maxShiftY));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStateRef.current.active) {
      dragStateRef.current.active = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignorar
      }
    }
  };

  const handleReset = () => {
    playEnterSound();
    setZoom(1);
    setPanRatioX(0);
    setPanRatioY(0);
  };

  const handleConfirmCrop = () => {
    try {
      setIsProcessing(true);
      setErrorMsg(null);
      playEnterSound();

      const cropParams: SquareCropParams = {
        zoom,
        panRatioX,
        panRatioY,
      };
      const dataUrl = renderOptimizedProfilePhoto(imageSource, cropParams);
      onConfirm(dataUrl);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Não foi possível processar a fotografia seleccionada.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-[var(--app-surface)] p-5 sm:p-6 shadow-2xl border border-[var(--app-border)] space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--app-border)]">
          <div>
            <h3 className="text-sm font-bold text-[var(--app-text)]">{title}</h3>
            <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5 leading-snug">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playExitSound();
              onCancel();
            }}
            aria-label="Fechar"
            className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Square Crop Canvas with Circular Preview Guide */}
        <div className="flex flex-col items-center space-y-3">
          <div
            ref={cropBoxRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden bg-slate-950 border border-[var(--app-border)] shadow-inner select-none touch-none cursor-grab active:cursor-grabbing"
          >
            <img
              src={imageSource.previewUrl}
              alt="Pré-visualização para recorte"
              draggable={false}
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                maxWidth: 'none',
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px))`,
              }}
              className="pointer-events-none select-none"
            />

            {/* Máscara circular sobre o recorte quadrado */}
            <div
              className="absolute inset-0 rounded-full border-2 border-white/90 pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.56)',
              }}
            />

            {/* Indicador subtil de arrasto */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-medium flex items-center gap-1 pointer-events-none backdrop-blur-xs">
              <Move className="w-3 h-3" />
              <span>Arraste para posicionar</span>
            </div>
          </div>

          {/* Controlo de Zoom */}
          <div className="w-full max-w-xs space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-[var(--app-text-muted)]">
              <span className="font-semibold">Aproximação (Zoom)</span>
              <span className="font-mono font-bold text-[var(--app-text)]">{zoom.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.15).toFixed(2))))}
                className="p-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
                aria-label="Diminuir zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg bg-stone-200 dark:bg-slate-700 accent-[var(--app-accent)] cursor-pointer"
                aria-label="Zoom da fotografia"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))))}
                className="p-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
                aria-label="Aumentar zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-lg border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
                title="Repor posição inicial"
                aria-label="Repor posição inicial"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600">
            {errorMsg}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              playExitSound();
              onCancel();
            }}
            className="px-4 py-2.5 rounded-xl border border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--app-text)] transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirmCrop}
            className="px-4 py-2.5 rounded-xl bg-[var(--app-accent)] hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-[0.98]"
          >
            <Check className="w-4 h-4" />
            <span>{isProcessing ? 'A processar...' : 'Confirmar Fotografia'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
