/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, User, Users, Lock } from 'lucide-react';
import { NavigationModule } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface HeaderProps {
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
  patientName: string;
  avatarId?: string;
  onOpenSwitcher?: () => void;
  onLock?: () => void;
}

const MODULE_TITLES: Record<NavigationModule, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Acompanhamento diário e rotinas de bem-estar' },
  profile: { title: 'Perfil da Pessoa', subtitle: 'Dados identificativos e ficha clínica local' },
  care: { title: 'Cuidados e Prevenção', subtitle: 'Hidratação, terapêutica, dor e rotinas de protecção' },
  calendar: { title: 'Calendário de Saúde', subtitle: 'Consultas, exames de rotina e lembretes' },
  history: { title: 'Histórico Médico', subtitle: 'Registos passados, transfusões e internamentos' },
  sos: { title: 'SOS & Contactos de Emergência', subtitle: 'Apoio imediato, contactos e resumo para equipa médica' },
  ai: { title: 'Sanguea IA', subtitle: 'Visão de inteligência assistencial e princípios éticos' },
  game: { title: 'Jogo', subtitle: 'Espaço lúdico e educativo em desenvolvimento (Brevemente)' },
  about: { title: 'Sobre o Sanguea', subtitle: 'Missão, a quem se destina e acompanhamento local' },
  creator: { title: 'O Criador', subtitle: 'Rodrigo Luluca — Motivação e propósito do projecto' },
  thanks: { title: 'Agradecimentos', subtitle: 'Reconhecimento à comunidade, famílias e cuidadores' },
};

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onNavigate,
  patientName,
  avatarId,
  onOpenSwitcher,
  onLock,
}) => {
  const currentInfo = MODULE_TITLES[currentModule] || { title: 'Sanguea', subtitle: 'Cuida. Acompanha. Vive.' };
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  return (
    <header className="sticky top-0 z-30 bg-[var(--app-surface)]/95 backdrop-blur-md border-b border-[var(--app-border)]/90 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 pt-safe">
      {/* Left Slot: Mobile Brand / Active Module Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile Brand Mark */}
        <div className="lg:hidden flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[var(--app-accent)] flex items-center justify-center text-white shadow-xs">
            <span className="font-extrabold text-xs sm:text-sm tracking-tighter">S</span>
          </div>
          <span className="font-bold text-[var(--app-text)] text-xs sm:text-sm tracking-tight hidden xs:inline">Sanguéa</span>
        </div>

        {/* Separator on mobile */}
        <span className="lg:hidden text-[var(--app-border)]">/</span>

        {/* Active Title */}
        <div className="min-w-0 truncate">
          <h1 className="text-sm lg:text-base font-bold text-[var(--app-text)] truncate">
            {currentInfo.title}
          </h1>
          <p className="hidden md:block text-xs text-slate-500 truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Slot: Install Button, Profile Switcher & SOS */}
      <div className="flex items-center gap-2 shrink-0">
        <PWAInstallButton variant="compact" />

        {/* Profile Switcher Trigger */}
        {onOpenSwitcher && (
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onOpenSwitcher();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--app-border)] hover:bg-slate-50 text-xs font-medium text-[var(--app-text)] transition"
            title="Trocar perfil ou gerir utilizadores"
          >
            {avatarId ? (
              <AvatarGraphic avatarId={avatarId} size="sm" className="w-5 h-5 rounded-md" />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="hidden sm:inline max-w-[90px] truncate">{patientName.split(' ')[0]}</span>
            <Users className="w-3 h-3 text-slate-400 hidden sm:inline" />
          </button>
        )}

        {/* Quick Lock Button */}
        {onLock && (
          <button
            type="button"
            onClick={() => {
              playExitSound();
              onLock?.();
            }}
            className="p-1.5 rounded-lg border border-[var(--app-border)] hover:bg-slate-100 text-slate-600 transition"
            title="Bloquear sessão local agora"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Primary SOS Action Button */}
        {currentModule !== 'sos' && (
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('sos');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            title="Aceder imediatamente aos contactos e resumo SOS"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>
        )}
      </div>
    </header>
  );
};
