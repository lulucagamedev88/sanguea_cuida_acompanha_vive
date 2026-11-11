/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useRef } from 'react';
import { useSettings } from './SettingsContext';

interface InterfaceAudioContextType {
  playEnterSound: () => void;
  playExitSound: () => void;
}

const InterfaceAudioContext = createContext<InterfaceAudioContextType | undefined>(undefined);

export const InterfaceAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { buttonSoundEnabled, buttonSoundVolume } = useSettings();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  };

  const playEnterSound = () => {
    if (!buttonSoundEnabled || buttonSoundVolume <= 0) return;
    try {
      const ctx = initAudioCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Tom suave ascendente (440Hz -> 880Hz)
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

      // Volume modulado pelo buttonSoundVolume configurado (0.0 a 1.0)
      const baseGain = 0.08 * buttonSoundVolume;
      gain.gain.setValueAtTime(baseGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, baseGain * 0.15), ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Falha silenciosa sem interromper a interface
    }
  };

  const playExitSound = () => {
    if (!buttonSoundEnabled || buttonSoundVolume <= 0) return;
    try {
      const ctx = initAudioCtx();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Tom suave descendente (660Hz -> 330Hz)
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.15);

      // Volume modulado pelo buttonSoundVolume configurado (0.0 a 1.0)
      const baseGain = 0.07 * buttonSoundVolume;
      gain.gain.setValueAtTime(baseGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, baseGain * 0.15), ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Falha silenciosa sem interromper a interface
    }
  };

  return (
    <InterfaceAudioContext.Provider value={{ playEnterSound, playExitSound }}>
      {children}
    </InterfaceAudioContext.Provider>
  );
};

export function useInterfaceAudio() {
  const context = useContext(InterfaceAudioContext);
  if (!context) {
    throw new Error('useInterfaceAudio deve ser utilizado dentro de um InterfaceAudioProvider');
  }
  return context;
}
