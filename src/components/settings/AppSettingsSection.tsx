/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Palette,
  Volume2,
  Type,
  Bell,
  ShieldCheck,
  Info as InfoIcon,
  AppWindow,
  Speaker,
  CheckCircle2,
  VolumeX,
  Music,
} from 'lucide-react';
import { useSettings, AppTheme } from '../../context/SettingsContext';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

const APP_VERSION = '1.2.0-beta';

interface AppSettingsSectionProps {
  showTopDivider?: boolean;
}

export const AppSettingsSection: React.FC<AppSettingsSectionProps> = ({
  showTopDivider = false,
}) => {
  const {
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
  } = useSettings();
  const { playEnterSound } = useInterfaceAudio();

  return (
    <div className={showTopDivider ? 'pt-6 border-t border-[var(--app-border)] mt-2' : ''}>
      <h2 className="text-lg font-bold text-[var(--app-text)] flex items-center gap-2 mb-6 px-1">
        <AppWindow className="w-5 h-5 text-rose-700" />
        Definições e Preferências
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. TEMA */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
            <Palette className="w-4 h-4 text-rose-700" />
            <h3 className="text-sm font-bold text-[var(--app-text)]">Tema Visual</h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(['white', 'black', 'turquoise'] as AppTheme[]).map((t) => {
              const isSelected = theme === t;
              const themeNames = {
                white: 'Branco (Padrão)',
                black: 'Preto Profundo',
                turquoise: 'Branco + Azul-Turquesa',
              };

              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setTheme(t);
                  }}
                  className={`p-4 rounded-2xl border text-left transition relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5'
                      : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                          t === 'white'
                            ? 'bg-white border-stone-200'
                            : t === 'black'
                            ? 'bg-black border-white/20'
                            : 'bg-white border-stone-200'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            t === 'white' || t === 'black' ? 'bg-rose-600' : 'bg-sky-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-[var(--app-text)]">{themeNames[t]}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SOM */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
            <Speaker className="w-4 h-4 text-rose-700" />
            <h3 className="text-sm font-bold text-[var(--app-text)]">Áudio e Sons</h3>
          </div>

          <div className="space-y-5">
            {/* Música de Fundo */}
            <div className="p-4 rounded-2xl border border-[var(--app-border)] bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      ambientSoundEnabled ? 'bg-sky-500/15 text-sky-500' : 'bg-slate-500/10 text-[var(--app-text-muted)]'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--app-text)] block">Música de Fundo</span>
                    <span className="text-[10px] text-[var(--app-text-muted)]">
                      Música ambiente suave e contínua em todo o Sanguea
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ambientSoundEnabled}
                  onClick={() => {
                    if (!ambientSoundEnabled) playEnterSound();
                    setAmbientSoundEnabled(!ambientSoundEnabled);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    ambientSoundEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={ambientSoundEnabled ? 'Desativar música de fundo' : 'Ativar música de fundo'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      ambientSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Controlo de Volume da Música de Fundo */}
              <div className="pt-1 border-t border-[var(--app-border)]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Volume da Música
                  </span>
                  <span className="text-xs font-bold text-sky-500 font-mono">
                    {Math.round(ambientVolume * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={ambientVolume}
                    onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-sky-500 cursor-pointer"
                    aria-label="Volume da música de fundo"
                  />
                  <Volume2 className="w-4 h-4 text-sky-500 shrink-0" />
                </div>
              </div>
            </div>

            {/* Sons dos Botões */}
            <div className="p-4 rounded-2xl border border-[var(--app-border)] bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      buttonSoundEnabled ? 'bg-rose-500/15 text-rose-600' : 'bg-slate-500/10 text-[var(--app-text-muted)]'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[var(--app-text)] block">Sons dos Botões</span>
                    <span className="text-[10px] text-[var(--app-text-muted)]">Efeitos sonoros nas interações e ações</span>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={buttonSoundEnabled}
                  onClick={() => {
                    if (!buttonSoundEnabled) playEnterSound();
                    setButtonSoundEnabled(!buttonSoundEnabled);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                    buttonSoundEnabled ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  title={buttonSoundEnabled ? 'Desativar sons dos botões' : 'Ativar sons dos botões'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      buttonSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Controlo de Volume dos Sons dos Botões */}
              <div className="pt-1 border-t border-[var(--app-border)]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                    Volume dos Botões
                  </span>
                  <span className="text-xs font-bold text-rose-600 font-mono">
                    {Math.round(buttonSoundVolume * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={buttonSoundVolume}
                    onChange={(e) => setButtonSoundVolume(parseFloat(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-rose-600 cursor-pointer"
                    aria-label="Volume dos sons dos botões"
                  />
                  <Volume2 className="w-4 h-4 text-rose-600 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ACESSIBILIDADE */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
            <Type className="w-4 h-4 text-rose-700" />
            <h3 className="text-sm font-bold text-[var(--app-text)]">Acessibilidade</h3>
          </div>

          <div>
            <p className="text-[11px] text-[var(--app-text-muted)] mb-3">
              Ajuste o tamanho do texto para uma leitura mais confortável.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'extra-large'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setFontSize(size);
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                    fontSize === size
                      ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                      : 'bg-transparent text-[var(--app-text)] border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {size === 'normal' && 'Normal'}
                  {size === 'large' && 'Grande'}
                  {size === 'extra-large' && 'Extra'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. NOTIFICAÇÕES */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
            <Bell className="w-4 h-4 text-rose-700" />
            <h3 className="text-sm font-bold text-[var(--app-text)]">Lembretes Locais</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--app-text)]">Lembretes de Hidratação</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.hydration}
                onClick={() => {
                  playEnterSound();
                  setNotificationPreference('hydration', !notifications.hydration);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  notifications.hydration ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    notifications.hydration ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--app-text)]">Lembretes de Medicação</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifications.medication}
                onClick={() => {
                  playEnterSound();
                  setNotificationPreference('medication', !notifications.medication);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  notifications.medication ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    notifications.medication ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-[var(--app-text-muted)] leading-tight pt-1 italic">
              * Os lembretes são executados localmente pela aplicação e dependem da permissão do navegador/sistema.
            </p>
          </div>
        </div>

        {/* 5. PRIVACIDADE */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[var(--app-text)]">Privacidade e Dados</h3>
          </div>
          <div className="space-y-3 text-[11px] text-[var(--app-text-muted)]">
            <p>
              Os seus dados são cifrados com <strong>AES-GCM 256-bit</strong> e guardados apenas neste dispositivo (IndexedDB).
            </p>
            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 font-medium text-center">
              🛡️ O Sanguea não envia as suas informações clínicas para a nuvem. A privacidade é total e local.
            </div>
          </div>
        </div>

        {/* 6. SOBRE */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
            <InfoIcon className="w-4 h-4 text-[var(--app-text-muted)]" />
            <h3 className="text-sm font-bold text-[var(--app-text)]">Sobre o Sanguea</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-xs">
                <span className="font-extrabold text-lg">S</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--app-text)] tracking-tight">Sanguea</p>
                <p className="text-[10px] text-[var(--app-text-muted)] font-medium">Versão {APP_VERSION}</p>
              </div>
            </div>
            <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed pt-1">
              Uma iniciativa dedicada ao apoio e acompanhamento proactivo de pessoas com anemia falciforme.
              <br />
              <strong>Autor:</strong> Rodrigo Luluca
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
