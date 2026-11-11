/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, SlidersHorizontal, Music } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const AudioControl: React.FC = () => {
  const { 
    ambientSoundEnabled, 
    setAmbientSoundEnabled, 
    ambientVolume, 
    setAmbientVolume 
  } = useSettings();
  
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSlider(false);
      }
    };

    if (showSlider) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSlider]);

  const handleToggle = () => {
    setAmbientSoundEnabled(!ambientSoundEnabled);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setAmbientVolume(newVol);
  };

  return (
    <div className="relative flex items-center gap-1 shrink-0" ref={dropdownRef}>
      {/* Botão de Ativação / Pausa da Música de Fundo */}
      <button
        type="button"
        onClick={handleToggle}
        className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
          ambientSoundEnabled
            ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
            : 'bg-transparent border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
        }`}
        title={ambientSoundEnabled ? 'Música ativa (Clique para silenciar)' : 'Ativar música de fundo'}
        aria-label="Ativar ou desativar música de fundo"
      >
        {ambientSoundEnabled ? (
          <Music className="w-3.5 h-3.5 text-sky-500 animate-pulse shrink-0" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-[var(--app-text-muted)] shrink-0" />
        )}
        <span className="hidden md:inline text-[11px]">
          {ambientSoundEnabled ? 'Música On' : 'Música Off'}
        </span>
      </button>

      {/* Botão de Ajuste Rápido de Volume */}
      <button
        type="button"
        onClick={() => setShowSlider(!showSlider)}
        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
          showSlider
            ? 'bg-sky-100 dark:bg-sky-900/50 border-sky-400 text-sky-700 dark:text-sky-200'
            : 'border-[var(--app-border)] bg-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
        }`}
        title="Ajustar volume da música"
        aria-label="Ajustar volume da música de fundo"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </button>

      {/* Popover de Volume Flutuante com Alto Contraste */}
      {showSlider && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--app-surface)] p-3 rounded-2xl border border-[var(--app-border)] shadow-2xl w-48 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--app-text)] mb-2">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-sky-500" />
              Volume
            </span>
            <span className="text-xs font-mono text-sky-500">
              {Math.round(ambientVolume * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <VolumeX className="w-3 h-3 text-[var(--app-text-muted)] shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={ambientVolume}
              onChange={handleVolumeChange}
              className="w-full h-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 accent-sky-500 cursor-pointer"
              aria-label="Nível do volume"
            />
            <Volume2 className="w-3 h-3 text-sky-500 shrink-0" />
          </div>

          {!ambientSoundEnabled && (
            <p className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center">
              Música pausada. Toque no ícone para tocar.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
