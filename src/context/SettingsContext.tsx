/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { backgroundMusicService } from '../services/audio';

export type AppTheme = 'white' | 'black' | 'turquoise';
export type FontSize = 'normal' | 'large' | 'extra-large';

interface SettingsContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  buttonSoundEnabled: boolean;
  setButtonSoundEnabled: (enabled: boolean) => void;
  buttonSoundVolume: number;
  setButtonSoundVolume: (volume: number) => void;
  ambientSoundEnabled: boolean;
  setAmbientSoundEnabled: (enabled: boolean) => void;
  ambientVolume: number;
  setAmbientVolume: (volume: number) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  notifications: {
    hydration: boolean;
    medication: boolean;
  };
  setNotificationPreference: (type: 'hydration' | 'medication', enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY_THEME = 'sanguea_theme';
const STORAGE_KEY_SOUND = 'sanguea_button_sound';
const STORAGE_KEY_BUTTON_VOLUME = 'sanguea_button_volume';
const STORAGE_KEY_AMBIENT_ENABLED = 'sanguea_sound_enabled';
const STORAGE_KEY_AMBIENT_VOLUME = 'sanguea_sound_volume';
const STORAGE_KEY_FONT_SIZE = 'sanguea_font_size';
const STORAGE_KEY_NOTIF_HYDRATION = 'sanguea_notif_hydration';
const STORAGE_KEY_NOTIF_MEDICATION = 'sanguea_notif_medication';
const THEME_MIGRATION_VERSION = 'v2_red_default';
const STORAGE_KEY_MIGRATION = 'sanguea_theme_migration';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    const migrationDone = localStorage.getItem(STORAGE_KEY_MIGRATION);

    if (saved === 'turquoise' && migrationDone !== THEME_MIGRATION_VERSION) {
      localStorage.setItem(STORAGE_KEY_THEME, 'white');
      localStorage.setItem(STORAGE_KEY_MIGRATION, THEME_MIGRATION_VERSION);
      return 'white';
    }

    if (!migrationDone) {
      localStorage.setItem(STORAGE_KEY_MIGRATION, THEME_MIGRATION_VERSION);
    }

    return (saved as AppTheme) || 'white';
  });

  const [buttonSoundEnabled, setButtonSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SOUND);
    return saved !== null ? saved === 'true' : true;
  });

  const [buttonSoundVolume, setButtonSoundVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BUTTON_VOLUME);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
    return 0.5; // Padrão 50%
  });

  const [ambientSoundEnabled, setAmbientSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AMBIENT_ENABLED);
    return saved !== null ? saved === 'true' : true;
  });

  const [ambientVolume, setAmbientVolumeState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AMBIENT_VOLUME);
    if (saved !== null) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
    }
    return 0.3; // Padrão 30%
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    return (saved as FontSize) || 'normal';
  });

  const [notifications, setNotifications] = useState({
    hydration: localStorage.getItem(STORAGE_KEY_NOTIF_HYDRATION) !== 'false',
    medication: localStorage.getItem(STORAGE_KEY_NOTIF_MEDICATION) !== 'false',
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SOUND, String(buttonSoundEnabled));
  }, [buttonSoundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BUTTON_VOLUME, String(buttonSoundVolume));
  }, [buttonSoundVolume]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AMBIENT_ENABLED, String(ambientSoundEnabled));
    backgroundMusicService.setMusicEnabled(ambientSoundEnabled);
  }, [ambientSoundEnabled]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AMBIENT_VOLUME, String(ambientVolume));
    backgroundMusicService.setVolume(ambientVolume);
  }, [ambientVolume]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, fontSize);
  }, [fontSize]);

  const setTheme = (newTheme: AppTheme) => setThemeState(newTheme);
  const setButtonSoundEnabled = (enabled: boolean) => setButtonSoundEnabledState(enabled);
  const setButtonSoundVolume = (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setButtonSoundVolumeState(clamped);
  };
  
  const setAmbientSoundEnabled = (enabled: boolean) => {
    setAmbientSoundEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY_AMBIENT_ENABLED, String(enabled));
    backgroundMusicService.setMusicEnabled(enabled);
  };

  const setAmbientVolume = (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setAmbientVolumeState(clamped);
    localStorage.setItem(STORAGE_KEY_AMBIENT_VOLUME, String(clamped));
    backgroundMusicService.setVolume(clamped);
  };

  const setFontSize = (size: FontSize) => setFontSizeState(size);

  const setNotificationPreference = (type: 'hydration' | 'medication', enabled: boolean) => {
    setNotifications(prev => ({ ...prev, [type]: enabled }));
    localStorage.setItem(
      type === 'hydration' ? STORAGE_KEY_NOTIF_HYDRATION : STORAGE_KEY_NOTIF_MEDICATION,
      String(enabled)
    );
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        buttonSoundEnabled,
        setButtonSoundEnabled,
        buttonSoundVolume,
        setButtonSoundVolume,
        ambientSoundEnabled,
        setAmbientSoundEnabled,
        ambientVolume,
        setAmbientVolume,
        fontSize,
        setFontSize,
        notifications,
        setNotificationPreference,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings deve ser utilizado dentro de um SettingsProvider');
  }
  return context;
}
