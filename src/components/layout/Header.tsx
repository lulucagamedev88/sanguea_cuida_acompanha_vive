/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Users } from 'lucide-react';
import { NavigationModule } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface HeaderProps {
  currentModule: NavigationModule;
  onNavigate?: (module: NavigationModule) => void;
  patientName: string;
  avatarId?: string;
  photoUrl?: string;
  onOpenSwitcher?: () => void;
}

const MODULE_TITLES: Record<NavigationModule, { title: string; subtitle: string }> = {
  dashboard: { title: 'Início', subtitle: 'Acompanhamento diário e rotinas de bem-estar' },
  profile: { title: 'Perfil da Pessoa', subtitle: 'Dados identificativos e ficha clínica local' },
  care: { title: 'Cuidados e Prevenção', subtitle: 'Hidratação, terapêutica, dor e rotinas de protecção' },
  calendar: { title: 'Calendário de Saúde', subtitle: 'Consultas, exames de rotina e lembretes' },
  history: { title: 'Histórico Médico', subtitle: 'Registos passados, transfusões e internamentos' },
  sos: { title: 'SOS & Contactos de Emergência', subtitle: 'Apoio imediato, contactos e resumo para equipa médica' },
  ai: { title: 'Sanguea IA', subtitle: 'Visão de inteligência assistencial e princípios éticos' },
  game: { title: 'Mossangue', subtitle: 'Área de entretenimento' },
  settings: { title: 'Opções e Definições', subtitle: 'Tema visual, volume do som, acessibilidade e preferências' },
  about: { title: 'Sobre o Sanguea', subtitle: 'Missão, a quem se destina e acompanhamento local' },
  creator: { title: 'O Criador', subtitle: 'Rodrigo Luluca — Motivação e propósito do projecto' },
  thanks: { title: 'Agradecimentos', subtitle: 'Reconhecimento à comunidade, famílias e cuidadores' },
};

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onNavigate,
  patientName,
  avatarId,
  photoUrl,
  onOpenSwitcher,
}) => {
  const currentInfo = MODULE_TITLES[currentModule] || { title: 'Sanguea', subtitle: 'Cuida. Acompanha. Vive.' };
  const { playEnterSound } = useInterfaceAudio();

  const handleGoHome = () => {
    playEnterSound();
    onNavigate?.('dashboard');
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--app-surface)]/95 backdrop-blur-md border-b border-[var(--app-border)]/90 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 pt-safe">
      {/* Left Slot: Mobile Brand / Active Module Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile Brand Mark — Interactive S button to return to Início */}
        <div className="lg:hidden flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleGoHome}
            aria-label="Voltar ao Início"
            title="Voltar ao Início"
            className="min-w-[44px] min-h-[44px] -my-2 -ml-1.5 flex items-center justify-center rounded-xl cursor-pointer active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-accent)]"
          >
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[var(--app-accent)] flex items-center justify-center text-white shadow-xs">
              <span className="font-extrabold text-xs sm:text-sm tracking-tighter">S</span>
            </span>
          </button>
          <span className="font-bold text-[var(--app-text)] text-xs sm:text-sm tracking-tight hidden xs:inline">Sanguea</span>
        </div>

        {/* Separator on mobile */}
        <span className="lg:hidden text-[var(--app-border)]">/</span>

        {/* Active Title */}
        <div className="min-w-0 truncate">
          <h1 className="text-sm lg:text-base font-bold text-[var(--app-text)] truncate">
            {currentInfo.title}
          </h1>
          <p className="hidden md:block text-xs text-[var(--app-text-muted)] truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Slot: Install Button & Profile Switcher */}
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium text-[var(--app-text)] transition-all duration-150 cursor-pointer"
            title="Trocar perfil ou gerir utilizadores"
          >
            {avatarId || photoUrl ? (
              <AvatarGraphic avatarId={avatarId || 'child-boy-hoodie'} photoUrl={photoUrl} alt={patientName} size="sm" className="w-5 h-5 rounded-md" />
            ) : (
              <User className="w-3.5 h-3.5 text-[var(--app-text-muted)]" />
            )}
            <span className="hidden sm:inline max-w-[90px] truncate">{patientName.split(' ')[0]}</span>
            <Users className="w-3 h-3 text-[var(--app-text-muted)] hidden sm:inline" />
          </button>
        )}
      </div>
    </header>
  );
};
