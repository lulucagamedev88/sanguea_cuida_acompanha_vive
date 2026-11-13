/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import {
  getAvatarsForProfile,
  getDefaultAvatarId,
} from '../../constants/avatars';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { CameraCaptureModal } from './CameraCaptureModal';
import { PhotoCropModal } from './PhotoCropModal';
import {
  LoadedImageSource,
  loadImageForCropping,
  validateImageFile,
} from '../../utils/imageProcessor';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface ProfileVisualIdentityPickerProps {
  gender: 'Masculino' | 'Feminino';
  ageGroup: 'Criança' | 'Adolescente' | 'Adulto';
  selectedAvatarId: string;
  selectedPhotoDataUrl?: string;
  onSelectAvatar: (avatarId: string) => void | Promise<void>;
  onSelectPhoto: (photoDataUrl: string) => void | Promise<void>;
  onRemovePhoto: (fallbackAvatarId: string) => void | Promise<void>;
  mode?: 'wizard' | 'profile';
}

export const ProfileVisualIdentityPicker: React.FC<ProfileVisualIdentityPickerProps> = ({
  gender,
  ageGroup,
  selectedAvatarId,
  selectedPhotoDataUrl,
  onSelectAvatar,
  onSelectPhoto,
  onRemovePhoto,
  mode = 'wizard',
}) => {
  const { playEnterSound, playExitSound } = useInterfaceAudio();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const loadedSourceRef = useRef<LoadedImageSource | null>(null);

  const [showAvatarLibrary, setShowAvatarLibrary] = useState<boolean>(
    !selectedPhotoDataUrl
  );
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cropSource, setCropSource] = useState<LoadedImageSource | null>(null);
  const [isCropOpen, setIsCropOpen] = useState<boolean>(false);
  const [isPreparingImage, setIsPreparingImage] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);

  const availableLibrary = getAvatarsForProfile(gender, ageGroup);
  const defaultAvatarId = getDefaultAvatarId(gender, ageGroup);
  const resolvedAvatarId = availableLibrary.some((a) => a.id === selectedAvatarId)
    ? selectedAvatarId
    : defaultAvatarId;
  const currentAvatarDef = availableLibrary.find((a) => a.id === resolvedAvatarId);

  const cleanupCropSource = () => {
    if (loadedSourceRef.current) {
      loadedSourceRef.current.cleanup();
      loadedSourceRef.current = null;
    }
    setCropSource(null);
  };

  useEffect(() => {
    setShowAvatarLibrary(!selectedPhotoDataUrl);
  }, [selectedPhotoDataUrl]);

  useEffect(() => {
    return () => {
      if (loadedSourceRef.current) {
        loadedSourceRef.current.cleanup();
        loadedSourceRef.current = null;
      }
    };
  }, []);

  const openCropperWithBlob = async (blob: Blob) => {
    try {
      setIsPreparingImage(true);
      setErrorMsg(null);
      setInfoNotice(null);

      cleanupCropSource();
      const loaded = await loadImageForCropping(blob);
      loadedSourceRef.current = loaded;
      setCropSource(loaded);
      setIsCropOpen(true);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar a fotografia seleccionada.'
      );
    } finally {
      setIsPreparingImage(false);
    }
  };

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) {
      // O utilizador cancelou a selecção na galeria — manter o estado actual sem erro
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Imagem inválida.');
      return;
    }

    await openCropperWithBlob(file);
  };

  const handleConfirmCrop = async (optimizedDataUrl: string) => {
    setIsCropOpen(false);
    cleanupCropSource();
    setErrorMsg(null);
    setShowAvatarLibrary(false);
    await onSelectPhoto(optimizedDataUrl);
    setInfoNotice('Fotografia pessoal aplicada e protegida neste dispositivo.');
  };

  const handleCancelCrop = () => {
    setIsCropOpen(false);
    cleanupCropSource();
  };

  const handleCameraPhotoCaptured = async (blob: Blob) => {
    setIsCameraOpen(false);
    await openCropperWithBlob(blob);
  };

  const handleClickRemovePhoto = async () => {
    playExitSound();
    setErrorMsg(null);
    await onRemovePhoto(resolvedAvatarId);
    setShowAvatarLibrary(true);
    setInfoNotice(
      'Fotografia removida. Mantivemos um avatar adequado ao perfil — pode escolher outro abaixo se desejar.'
    );
  };

  const handleSelectAvatarItem = async (avatarId: string) => {
    playEnterSound();
    setErrorMsg(null);
    setInfoNotice(null);
    await onSelectAvatar(avatarId);
  };

  return (
    <div className="space-y-4">
      {/* Hidden native Gallery File Picker */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleGalleryFileChange}
        className="hidden"
      />

      {/* Current Selected Identity Preview Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <AvatarGraphic
            avatarId={resolvedAvatarId}
            photoUrl={selectedPhotoDataUrl}
            alt="Pré-visualização da imagem de perfil"
            size="lg"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              {selectedPhotoDataUrl
                ? 'Fotografia Pessoal Activa'
                : 'Avatar Ilustrado Activo'}
            </span>
            <p className="text-xs font-bold text-[var(--app-text)] truncate mt-0.5">
              {selectedPhotoDataUrl
                ? 'Imagem pessoal (formato circular)'
                : currentAvatarDef?.name || 'Avatar do perfil'}
            </p>
            <p className="text-[11px] text-[var(--app-text-muted)] truncate">
              {selectedPhotoDataUrl
                ? 'Guardada apenas no dispositivo · Cifrada com AES-GCM 256'
                : `${gender} · ${ageGroup} · A fotografia é opcional`}
            </p>
          </div>
        </div>

        {selectedPhotoDataUrl && (
          <button
            type="button"
            onClick={handleClickRemovePhoto}
            className="px-3 py-2 rounded-xl border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/15 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover fotografia</span>
          </button>
        )}
      </div>

      {/* Three Clear Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Opção A — Escolher Avatar */}
        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setErrorMsg(null);
            setShowAvatarLibrary(true);
          }}
          className={`p-3 rounded-2xl border text-left transition flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 cursor-pointer ${
            showAvatarLibrary && !selectedPhotoDataUrl
              ? 'border-rose-500 bg-rose-500/5 ring-2 ring-rose-500/20'
              : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:border-rose-400/60'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <UserCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[var(--app-text)] block">
              Escolher avatar
            </span>
            <span className="text-[10px] text-[var(--app-text-muted)] block leading-tight mt-0.5">
              {availableLibrary.length} opções ({gender} · {ageGroup})
            </span>
          </div>
        </button>

        {/* Opção B — Escolher da Galeria */}
        <button
          type="button"
          disabled={isPreparingImage}
          onClick={() => {
            playEnterSound();
            setErrorMsg(null);
            galleryInputRef.current?.click();
          }}
          className="p-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:border-rose-400/60 text-left transition flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 cursor-pointer disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[var(--app-text)] block">
              {isPreparingImage ? 'A abrir imagem...' : 'Escolher da galeria'}
            </span>
            <span className="text-[10px] text-[var(--app-text-muted)] block leading-tight mt-0.5">
              Seleccionar e ajustar enquadramento
            </span>
          </div>
        </button>

        {/* Opção C — Tirar Fotografia */}
        <button
          type="button"
          disabled={isPreparingImage}
          onClick={() => {
            playEnterSound();
            setErrorMsg(null);
            setIsCameraOpen(true);
          }}
          className="p-3 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:border-rose-400/60 text-left transition flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 cursor-pointer disabled:opacity-50"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[var(--app-text)] block">
              Tirar fotografia
            </span>
            <span className="text-[10px] text-[var(--app-text-muted)] block leading-tight mt-0.5">
              Abrir câmara e pré-visualizar
            </span>
          </div>
        </button>
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {infoNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{infoNotice}</span>
        </div>
      )}

      {/* Segregated Avatar Library */}
      {(showAvatarLibrary || !selectedPhotoDataUrl) && (
        <div className="space-y-3 pt-1">
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--app-border)] flex items-center justify-between text-xs">
            <div>
              <span className="text-[var(--app-text-muted)] font-medium block text-[10px] uppercase tracking-wider">
                Biblioteca de Avatares
              </span>
              <span className="font-bold text-[var(--app-text)] text-xs">
                {gender} — {ageGroup}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {availableLibrary.length} opções
            </span>
          </div>

          <div
            className={
              mode === 'profile'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
                : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
            }
          >
            {availableLibrary.map((av) => {
              const isSelected = !selectedPhotoDataUrl && resolvedAvatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => handleSelectAvatarItem(av.id)}
                  className={`p-3.5 rounded-2xl border text-left transition flex ${
                    mode === 'profile'
                      ? 'flex-col items-center text-center gap-2'
                      : 'items-center gap-3.5'
                  } ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/5 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:opacity-85'
                  }`}
                >
                  <AvatarGraphic avatarId={av.id} size="lg" />
                  <div className="min-w-0 flex-1 w-full">
                    <div
                      className={`flex items-center gap-1 ${
                        mode === 'profile'
                          ? 'flex-col justify-center'
                          : 'justify-between'
                      }`}
                    >
                      <p className="text-xs font-bold text-[var(--app-text)] truncate max-w-full">
                        {av.name}
                      </p>
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                          av.isOfficialCharacter
                            ? 'bg-rose-600 text-white font-bold'
                            : av.isPrototype
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {av.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--app-text-muted)] mt-1 line-clamp-2">
                      {av.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {gender === 'Masculino' && ageGroup === 'Criança' && mode === 'wizard' && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-xs text-rose-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Referência Oficial Aprovada:</strong> O rapaz negro africano com hoodie vermelho é a personagem oficial do Sanguea, mantida como modelo principal para rapazes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Local-first privacy note */}
      <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-[var(--app-text-muted)] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          As fotografias nunca saem do dispositivo nem são enviadas para servidores externos.
        </span>
      </div>

      {/* Camera & Crop Modals */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={handleCameraPhotoCaptured}
      />

      <PhotoCropModal
        isOpen={isCropOpen}
        imageSource={cropSource}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
};
