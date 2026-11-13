/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  Check,
  RefreshCw,
  RotateCcw,
  Smartphone,
  X,
} from 'lucide-react';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';
import { validateImageFile } from '../../utils/imageProcessor';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (blob: Blob) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
}) => {
  const { playEnterSound, playExitSound } = useInterfaceAudio();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const requestIdRef = useRef<number>(0);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraStatus, setCameraStatus] = useState<
    'starting' | 'ready' | 'preview' | 'error'
  >('starting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedPreviewUrl, setCapturedPreviewUrl] = useState<string | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignorar erro ao parar track
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const clearPreviewUrl = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const startCamera = useCallback(
    async (mode: 'user' | 'environment') => {
      const currentReqId = ++requestIdRef.current;
      stopCameraStream();
      setCameraStatus('starting');
      setErrorMessage(null);

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        setCameraStatus('error');
        setErrorMessage(
          'A câmara integrada não está disponível neste navegador. Pode usar a câmara nativa do telemóvel abaixo.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });

        // Se o modal fechou ou houve outra chamada entretanto, parar este stream imediatamente
        if (currentReqId !== requestIdRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            // Alguns browsers iniciam automaticamente via autoPlay
          });
        }
        setCameraStatus('ready');
      } catch (err: unknown) {
        if (currentReqId !== requestIdRef.current) return;

        const errName = err instanceof DOMException ? err.name : '';
        let friendlyMsg =
          'Não foi possível abrir a câmara neste momento. Pode tentar novamente ou usar a câmara do sistema.';

        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          friendlyMsg =
            'A permissão da câmara foi recusada. Para tirar fotografia aqui, autorize o acesso à câmara nas definições ou utilize o botão da câmara nativa abaixo.';
        } else if (
          errName === 'NotFoundError' ||
          errName === 'DevicesNotFoundError' ||
          errName === 'OverconstrainedError'
        ) {
          friendlyMsg =
            'Nenhuma câmara compatível foi detectada neste dispositivo.';
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          friendlyMsg =
            'A câmara está a ser utilizada por outra aplicação neste momento.';
        }

        setCameraStatus('error');
        setErrorMessage(friendlyMsg);
      }
    },
    [stopCameraStream]
  );

  // Solicita permissão e inicia câmara APENAS quando o utilizador abre este modal
  useEffect(() => {
    if (!isOpen) {
      requestIdRef.current += 1;
      stopCameraStream();
      setCapturedBlob(null);
      setCapturedPreviewUrl((prev) => {
        clearPreviewUrl(prev);
        return null;
      });
      return;
    }

    startCamera(facingMode);

    return () => {
      requestIdRef.current += 1;
      stopCameraStream();
    };
  }, [isOpen, facingMode, startCamera, stopCameraStream, clearPreviewUrl]);

  useEffect(() => {
    return () => {
      clearPreviewUrl(capturedPreviewUrl);
    };
  }, [capturedPreviewUrl, clearPreviewUrl]);

  if (!isOpen) return null;

  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setErrorMessage('A imagem da câmara ainda não está pronta. Aguarde um instante.');
      return;
    }

    playEnterSound();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setErrorMessage('Não foi possível capturar a fotografia.');
      return;
    }

    // Espelhar horizontalmente na câmara frontal para corresponder à pré-visualização
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErrorMessage('Falha ao gerar a fotografia capturada.');
          return;
        }
        stopCameraStream();
        const url = URL.createObjectURL(blob);
        setCapturedPreviewUrl((prev) => {
          clearPreviewUrl(prev);
          return url;
        });
        setCapturedBlob(blob);
        setCameraStatus('preview');
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetake = () => {
    playEnterSound();
    setCapturedBlob(null);
    setCapturedPreviewUrl((prev) => {
      clearPreviewUrl(prev);
      return null;
    });
    startCamera(facingMode);
  };

  const handleConfirmCaptured = () => {
    if (!capturedBlob) return;
    playEnterSound();
    const blobToDeliver = capturedBlob;
    stopCameraStream();
    onPhotoCaptured(blobToDeliver);
  };

  const handleNativeCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      // Utilizador cancelou a câmara nativa
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Fotografia inválida.');
      return;
    }

    playEnterSound();
    stopCameraStream();
    onPhotoCaptured(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-3xl bg-[var(--app-surface)] p-5 sm:p-6 shadow-2xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--app-text)]">Tirar Fotografia</h3>
              <p className="text-[11px] text-[var(--app-text-muted)]">
                Armazenamento estritamente local e cifrado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playExitSound();
              stopCameraStream();
              onClose();
            }}
            aria-label="Fechar câmara"
            className="p-1.5 rounded-xl text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden Native Camera Capture Input Fallback (Android / Mobile WebView) */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture={facingMode}
          onChange={handleNativeCameraInputChange}
          className="hidden"
        />

        {/* Camera Viewport / Preview */}
        <div className="relative w-full aspect-square max-w-[300px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-[var(--app-border)] flex items-center justify-center">
          {cameraStatus === 'preview' && capturedPreviewUrl ? (
            <img
              src={capturedPreviewUrl}
              alt="Fotografia capturada"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? '-scale-x-100' : ''
              } ${cameraStatus === 'ready' ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {/* Circular Framing Guide during Live Capture */}
          {(cameraStatus === 'ready' || cameraStatus === 'preview') && (
            <div
              className="absolute inset-0 rounded-full border-2 border-white/80 pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.45)',
              }}
            />
          )}

          {/* Loading State */}
          {cameraStatus === 'starting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/90 p-4 text-center">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-400" />
              <span className="text-xs font-medium">A iniciar câmara...</span>
            </div>
          )}

          {/* Error State */}
          {cameraStatus === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center bg-slate-900/95 text-white">
              <AlertCircle className="w-8 h-8 text-rose-400 shrink-0" />
              <p className="text-xs text-slate-200 leading-relaxed">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* Inline warning/error if any while ready */}
        {errorMessage && cameraStatus !== 'error' && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Controls */}
        {cameraStatus === 'preview' ? (
          <div className="flex items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-2.5 px-3 rounded-xl border border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Repetir</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmCaptured}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Usar e Ajustar</span>
            </button>
          </div>
        ) : cameraStatus === 'ready' ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  setFacingMode((m) => (m === 'user' ? 'environment' : 'user'));
                }}
                className="py-2.5 px-3 rounded-xl border border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition"
                title="Alternar câmara frontal / traseira"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Alternar</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureFrame}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" />
                <span>Capturar Fotografia</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-xl text-[11px] font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Prefere usar a câmara nativa do Android? Toque aqui</span>
            </button>
          </div>
        ) : cameraStatus === 'error' ? (
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Smartphone className="w-4 h-4" />
              <span>Abrir Câmara Nativa do Telemóvel</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="flex-1 py-2 px-3 rounded-xl border border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--app-text)] transition"
              >
                Tentar novamente
              </button>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl border border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--app-text-muted)] transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                playExitSound();
                stopCameraStream();
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text)]"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
