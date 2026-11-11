/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  HeartPulse,
  Calendar,
  ShieldAlert,
  Menu,
  X,
  FileClock,
  Sparkles,
  ChevronRight,
  Download,
  Smartphone,
  Users,
  Lock,
  Gamepad2,
  Info,
  UserCheck,
  Heart,
} from 'lucide-react';
import { NavigationModule } from '../../types';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { useSettings } from '../../context/SettingsContext';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface MobileNavProps {
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
  patientName: string;
  avatarId?: string;
  sickleCellType?: string;
  onOpenSwitcher?: () => void;
  onLock?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentModule,
  onNavigate,
  patientName,
  avatarId,
  sickleCellType,
  onOpenSwitcher,
  onLock,
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
    if (open) playEnterSound(); else playExitSound();
    setDrawerOpen(open);
  };

  const isMoreActive = ['profile', 'history', 'ai', 'game', 'about', 'creator', 'thanks'].includes(currentModule);

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
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <div>
                <p className="text-sm font-bold text-[var(--app-text)]">Menu & Opções</p>
                <p className="text-[11px] text-slate-500">Sanguea — Cuida. Acompanha. Vive.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleDrawer(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="px-1 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Módulos
              </p>

              {/* Profile Item */}
              <button
                type="button"
                onClick={() => handleSelect('profile')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left ${
                  currentModule === 'profile' ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AvatarGraphic avatarId={avatarId || 'child-boy-hoodie'} size="md" />
                  <div>
                    <p className="text-xs font-semibold">Perfil da Pessoa</p>
                    <p className="text-[10px] text-slate-500">{patientName} · {sickleCellType || 'HbSS'}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('history')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left ${
                  currentModule === 'history' ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <FileClock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Histórico Médico</p>
                    <p className="text-[10px] text-slate-500">Consultas, exames, transfusões</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('game')}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition text-left min-h-[48px] cursor-pointer ${
                  currentModule === 'game' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-[var(--app-text)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold">Aqua Quest</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500 text-white font-bold">Jogo</span>
                    </div>
                    <p className="text-[10px] text-[var(--app-text-muted)]">Hidratação lúdica e saudável</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('ai')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left ${
                  currentModule === 'ai' ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold">Sanguea IA</p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-100 text-sky-800 font-bold">Brevemente</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Visão assistencial e ética médica</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <p className="px-1 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Institucional
              </p>

              <button
                type="button"
                onClick={() => handleSelect('about')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left ${
                  currentModule === 'about' ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Sobre o Sanguea</p>
                    <p className="text-[10px] text-slate-500">Missão e acompanhamento local</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('creator')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left ${
                  currentModule === 'creator' ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">O Criador</p>
                    <p className="text-[10px] text-slate-500">Rodrigo Luluca</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSelect('thanks')}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition text-left ${
                  currentModule === 'thanks' ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Agradecimentos</p>
                    <p className="text-[10px] text-slate-500">Às famílias e comunidade</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Profile Switcher & Lock Quick Actions on Mobile */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              {onOpenSwitcher && (
                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setDrawerOpen(false);
                    onOpenSwitcher();
                  }}
                  className="p-2.5 rounded-xl border border-[var(--app-border)] bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                  <span>Trocar Perfil</span>
                </button>
              )}

              {onLock && (
                <button
                  type="button"
                  onClick={() => {
                    playExitSound();
                    setDrawerOpen(false);
                    onLock();
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Bloquear</span>
                </button>
              )}
            </div>

            {isInstallable && (
              <div className="mt-3 pt-3 border-t border-[var(--app-border)]/60">
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
                  <span>Instalar Sanguéa no Android</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed Bottom Tab Bar on Mobile Android */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--app-surface)]/95 backdrop-blur-md border-t border-[var(--app-border)]/90 shadow-lg px-2 pb-safe">
        <div className="grid grid-cols-5 items-center h-16">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('dashboard');
            }}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
              currentModule === 'dashboard' ? 'text-[var(--app-accent)] font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
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
              currentModule === 'care' ? 'text-[var(--app-accent)] font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HeartPulse className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Cuidados</span>
          </button>

          {/* 3. SOS (Central Quick Trigger) */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('sos');
            }}
            className="min-h-[48px] flex flex-col items-center justify-center cursor-pointer"
          >
            <div className={`w-11 h-11 -mt-4 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
              currentModule === 'sos' ? 'bg-[var(--app-accent)] opacity-85 text-white ring-2 ring-white/30' : 'bg-[var(--app-accent)] text-white shadow-rose-600/30'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold text-[var(--app-accent)] tracking-tight mt-0.5">SOS</span>
          </button>

          {/* 4. Calendário */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('calendar');
            }}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
              currentModule === 'calendar' ? 'text-[var(--app-accent)] font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Agenda</span>
          </button>

          {/* 5. Menu / Mais */}
          <button
            type="button"
            onClick={() => toggleDrawer(!drawerOpen)}
            className={`min-h-[48px] flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
              isMoreActive || drawerOpen ? 'text-[var(--app-accent)] font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">
              {isMoreActive ? 'Mais' : 'Menu'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
