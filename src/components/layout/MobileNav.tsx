/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Home,
  HeartPulse,
  CalendarDays,
  ShieldAlert,
  Menu,
  X,
  FileClock,
  Sparkles,
  ChevronRight,
  Smartphone,
  Gamepad2,
  Info,
  UserCheck,
  HeartHandshake,
  SlidersHorizontal,
} from 'lucide-react';
import { NavigationModule } from '../../types';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface MobileNavProps {
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentModule,
  onNavigate,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isInstallable, install } = usePWAInstall();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const handleSelect = (module: NavigationModule) => {
    playEnterSound();
    onNavigate(module);
    setDrawerOpen(false);
  };

  const toggleDrawer = (open: boolean) => {
    if (open) playEnterSound();
    else playExitSound();
    setDrawerOpen(open);
  };

  const isMenuActive = ['history', 'ai', 'game', 'settings', 'about', 'creator', 'thanks'].includes(currentModule);

  return (
    <>
      {/* Bottom Sheet Drawer for Extra Modules on Mobile */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => toggleDrawer(false)}
          />

          {/* Drawer Body */}
          <div className="relative z-10 w-full bg-[var(--app-surface)] rounded-t-3xl border-t border-[var(--app-border)] p-5 shadow-2xl max-h-[85vh] overflow-y-auto pb-safe">
            {/* Grab Handle */}
            <div className="w-10 h-1.5 bg-[var(--app-border)] rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--app-border)]">
              <div>
                <p className="text-sm font-bold text-[var(--app-text)]">Menu</p>
                <p className="text-[11px] text-[var(--app-text-muted)]">Sanguea — Cuida. Acompanha. Vive.</p>
              </div>
              <button
                type="button"
                onClick={() => toggleDrawer(false)}
                className="w-8 h-8 rounded-full bg-[var(--app-bg)] border border-[var(--app-border)] flex items-center justify-center text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="px-1 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Módulos
              </p>

              <button
                type="button"
                onClick={() => handleSelect('history')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left cursor-pointer ${
                  currentModule === 'history'
                    ? 'bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center shrink-0">
                    <FileClock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Histórico Médico</p>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Consultas, exames, transfusões</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('game')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left min-h-[48px] cursor-pointer ${
                  currentModule === 'game'
                    ? 'bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold">Mossangue</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">Jogo</span>
                    </div>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Área de entretenimento</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('ai')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left cursor-pointer ${
                  currentModule === 'ai'
                    ? 'bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold">Sanguea IA</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold">Brevemente</span>
                    </div>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Visão assistencial e ética médica</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('settings')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left cursor-pointer ${
                  currentModule === 'settings'
                    ? 'bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Opções e Definições</p>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Tema visual, volume do som e preferências</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
              </button>

              <p className="px-1 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
                Institucional
              </p>

              <button
                type="button"
                onClick={() => handleSelect('about')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left cursor-pointer ${
                  currentModule === 'about'
                    ? 'bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Sobre o Sanguea</p>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Missão e acompanhamento local</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('creator')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left cursor-pointer ${
                  currentModule === 'creator'
                    ? 'bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">O Criador</p>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Rodrigo Luluca</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('thanks')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left cursor-pointer ${
                  currentModule === 'thanks'
                    ? 'bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-semibold'
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[var(--app-text)] flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Agradecimentos</p>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Às famílias e comunidade</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--app-text-muted)]" />
              </button>
            </div>

            {isInstallable && (
              <div className="mt-4 pt-3 border-t border-[var(--app-border)]/60">
                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    install();
                    setDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[var(--app-accent)] text-white text-xs font-bold active:scale-[0.98] transition cursor-pointer min-h-[48px] shadow-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Instalar Sanguea no Android</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar — Exclusively 5 Options in Exact Order */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--app-surface)]/95 backdrop-blur-md border-t border-[var(--app-border)]/90 shadow-lg px-2 pb-safe">
        <div className="grid grid-cols-5 items-center h-16">
          {/* 1. Início */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('dashboard');
            }}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
              currentModule === 'dashboard' ? 'text-[var(--app-accent)] font-bold' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Início</span>
          </button>

          {/* 2. Cuidados */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('care');
            }}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
              currentModule === 'care' ? 'text-[var(--app-accent)] font-bold' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Cuidados</span>
          </button>

          {/* 3. SOS (Central Single Access) */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('sos');
            }}
            className="min-h-[48px] flex flex-col items-center justify-center cursor-pointer"
          >
            <div
              className={`w-11 h-11 -mt-4 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                currentModule === 'sos' ? 'bg-[var(--app-accent)] opacity-90 text-white ring-2 ring-white/30' : 'bg-[var(--app-accent)] text-white shadow-rose-600/30'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-[var(--app-accent)] tracking-tight mt-0.5">SOS</span>
          </button>

          {/* 4. Agenda */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('calendar');
            }}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
              currentModule === 'calendar' ? 'text-[var(--app-accent)] font-bold' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Agenda</span>
          </button>

          {/* 5. Menu */}
          <button
            type="button"
            onClick={() => toggleDrawer(!drawerOpen)}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
              isMenuActive || drawerOpen ? 'text-[var(--app-accent)] font-bold' : 'text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
