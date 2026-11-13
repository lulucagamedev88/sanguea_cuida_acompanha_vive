/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  UserRound,
  HeartPulse,
  CalendarDays,
  FileClock,
  ShieldAlert,
  Sparkles,
  Gamepad2,
  Info,
  UserCheck,
  HeartHandshake,
  SlidersHorizontal,
} from 'lucide-react';
import { NavigationModule } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface SidebarProps {
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
  patientName: string;
  sickleCellType: string;
  avatarId?: string;
  photoUrl?: string;
}

interface NavItem {
  id: NavigationModule;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Início', shortLabel: 'Início', icon: Home },
  { id: 'care', label: 'Cuidados', shortLabel: 'Cuidados', icon: HeartPulse },
  { id: 'sos', label: 'SOS', shortLabel: 'SOS', icon: ShieldAlert },
  { id: 'calendar', label: 'Agenda', shortLabel: 'Agenda', icon: CalendarDays },
  { id: 'history', label: 'Histórico', shortLabel: 'Histórico', icon: FileClock },
  { id: 'game', label: 'Mossangue', shortLabel: 'Mossangue', icon: Gamepad2, badge: 'Jogo' },
  { id: 'profile', label: 'Perfil', shortLabel: 'Perfil', icon: UserRound },
  { id: 'settings', label: 'Opções e Definições', shortLabel: 'Opções', icon: SlidersHorizontal },
  { id: 'ai', label: 'Sanguea IA', shortLabel: 'IA', icon: Sparkles, badge: 'Brevemente' },
];

const INSTITUTIONAL_ITEMS: NavItem[] = [
  { id: 'about', label: 'Sobre o Sanguea', shortLabel: 'Sobre', icon: Info },
  { id: 'creator', label: 'O Criador', shortLabel: 'Criador', icon: UserCheck },
  { id: 'thanks', label: 'Agradecimentos', shortLabel: 'Gratidão', icon: HeartHandshake },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  patientName,
  sickleCellType,
  avatarId,
  photoUrl,
}) => {
  const { playEnterSound } = useInterfaceAudio();

  return (
    <aside className="hidden md:flex md:flex-col md:w-20 lg:w-64 bg-[var(--app-surface)] border-r border-[var(--app-border)] h-screen sticky top-0 shrink-0 select-none text-[var(--app-text)] transition-all duration-200 z-30">
      {/* Brand Header */}
      <div className="p-3 lg:p-4 border-b border-[var(--app-border)] flex items-center justify-center lg:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--app-accent)] flex items-center justify-center text-white shadow-sm shadow-rose-600/20 shrink-0">
            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="hidden lg:block min-w-0">
            <span className="font-extrabold text-base text-[var(--app-text)] tracking-tight block">Sanguea</span>
            <p className="text-[10px] font-medium text-[var(--app-text-muted)] truncate">Cuida. Acompanha. Vive.</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 lg:px-3 py-3 lg:py-4 space-y-4">
        <div>
          <p className="hidden lg:block px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Módulos Principais
          </p>

          <div className="space-y-1.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    onNavigate(item.id);
                  }}
                  className={`w-full min-h-[46px] flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-between p-2 lg:px-3 lg:py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-[var(--app-accent)] text-white shadow-xs'
                      : 'text-[var(--app-text)] opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex md:flex-col lg:flex-row items-center gap-1 lg:gap-2.5">
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'text-[var(--app-text-muted)]'}`} />
                    <span className="text-[10px] lg:text-xs tracking-tight text-center truncate max-w-[64px] lg:max-w-none">
                      {item.shortLabel || item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className={`hidden lg:inline text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        isActive
                          ? 'bg-black/20 text-white'
                          : 'bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Institutional Section */}
        <div>
          <p className="hidden lg:block px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-text-muted)]">
            Apoio
          </p>
          <div className="space-y-1">
            {INSTITUTIONAL_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    onNavigate(item.id);
                  }}
                  className={`w-full min-h-[44px] flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-start p-2 lg:px-3 lg:py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer active:scale-[0.98] ${
                    isActive
                      ? 'bg-[var(--app-accent)] text-white font-semibold shadow-xs'
                      : 'text-[var(--app-text)] opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex md:flex-col lg:flex-row items-center gap-1 lg:gap-2.5">
                    <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-white' : 'text-[var(--app-text-muted)]'}`} />
                    <span className="text-[9px] lg:text-xs tracking-tight">{item.shortLabel || item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Active Profile Capsule */}
      <div className="p-2 lg:p-3 border-t border-[var(--app-border)] space-y-2">
        <button
          type="button"
          onClick={() => {
            playEnterSound();
            onNavigate('profile');
          }}
          className="w-full text-left p-1.5 lg:p-2 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] hover:border-[var(--app-accent)] transition-colors group flex items-center justify-center lg:justify-start gap-2.5 min-h-[48px] cursor-pointer"
          title={`Ver perfil de ${patientName}`}
        >
          <AvatarGraphic avatarId={avatarId || 'child-boy-hoodie'} photoUrl={photoUrl} alt={patientName} size="sm" className="w-8 h-8 rounded-xl shrink-0" />
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--app-text)] truncate">{patientName}</p>
            <p className="text-[10px] text-[var(--app-text-muted)] truncate">{sickleCellType}</p>
          </div>
        </button>

        {/* PWA installation action */}
        <div className="hidden lg:block">
          <PWAInstallButton variant="full" />
        </div>
      </div>
    </aside>
  );
};
