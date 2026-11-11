/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  User,
  HeartPulse,
  Calendar,
  FileClock,
  ShieldAlert,
  Sparkles,
  Gamepad2,
  Info,
  UserCheck,
  Heart,
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
  onOpenSwitcher?: () => void;
}

interface NavItem {
  id: NavigationModule;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isUrgent?: boolean;
}

const MAIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Início', icon: LayoutDashboard },
  { id: 'care', label: 'Cuidados', shortLabel: 'Cuidados', icon: HeartPulse },
  { id: 'sos', label: 'SOS Emergência', shortLabel: 'SOS', icon: ShieldAlert, isUrgent: true },
  { id: 'calendar', label: 'Calendário', shortLabel: 'Agenda', icon: Calendar },
  { id: 'history', label: 'Histórico', shortLabel: 'Histórico', icon: FileClock },
  { id: 'game', label: 'Aqua Quest', shortLabel: 'Jogo', icon: Gamepad2 },
  { id: 'profile', label: 'Perfil', shortLabel: 'Perfil', icon: User },
  { id: 'ai', label: 'Sanguea IA', shortLabel: 'IA', icon: Sparkles, badge: 'Brevemente' },
];

const INSTITUTIONAL_ITEMS: NavItem[] = [
  { id: 'about', label: 'Sobre o Sanguea', shortLabel: 'Sobre', icon: Info },
  { id: 'creator', label: 'O Criador', shortLabel: 'Criador', icon: UserCheck },
  { id: 'thanks', label: 'Agradecimentos', shortLabel: 'Créditos', icon: Heart },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onNavigate,
  patientName,
  sickleCellType,
  avatarId,
}) => {
  const { playEnterSound } = useInterfaceAudio();

  return (
    <aside className="hidden md:flex md:flex-col md:w-20 lg:w-64 bg-[var(--app-surface)] border-r border-[var(--app-border)] h-screen sticky top-0 shrink-0 select-none text-[var(--app-text)] transition-all duration-200 z-30">
      {/* Brand Header */}
      <div className="p-3 lg:p-4 border-b border-[var(--app-border)] flex items-center justify-center lg:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--app-accent)] flex items-center justify-center text-white shadow-md shadow-rose-600/20 shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="hidden lg:block min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-[var(--app-text)] tracking-tight">Sanguea</span>
              <span className="text-[9px] font-bold text-white bg-[var(--app-accent)] px-1.5 py-0.5 rounded border border-white/20">Android</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 truncate">Tablet & Smartphone</p>
          </div>
        </div>
      </div>

      {/* Navigation List — Tablet Navigation Rail (md) & Sidebar Drawer (lg) */}
      <nav className="flex-1 overflow-y-auto px-2 lg:px-3 py-3 lg:py-4 space-y-4">
        <div>
          <p className="hidden lg:block px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos Principais
          </p>

          <div className="space-y-1.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;

              if (item.isUrgent) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      onNavigate(item.id);
                    }}
                    className={`w-full min-h-[50px] flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-between p-2 lg:px-3 lg:py-2.5 rounded-2xl text-xs font-bold transition-all my-1.5 cursor-pointer active:scale-95 ${
                      isActive
                        ? 'bg-[var(--app-accent)] text-white shadow-md ring-2 ring-rose-500/30'
                        : 'bg-rose-500/10 text-[var(--app-accent)] hover:bg-rose-500/20 border border-rose-500/20'
                    }`}
                    title={item.label}
                  >
                    <div className="flex md:flex-col lg:flex-row items-center gap-1 lg:gap-2.5">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-[10px] lg:text-xs tracking-tight">{item.shortLabel || item.label}</span>
                    </div>
                    <span className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded font-bold bg-black/20 text-white">
                      SOS
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    onNavigate(item.id);
                  }}
                  className={`w-full min-h-[50px] flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-between p-2 lg:px-3 lg:py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[var(--app-accent)] text-white shadow-sm'
                      : 'text-[var(--app-text)] opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex md:flex-col lg:flex-row items-center gap-1 lg:gap-2.5">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-[10px] lg:text-xs tracking-tight text-center truncate max-w-[64px] lg:max-w-none">
                      {item.shortLabel || item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className={`hidden lg:inline text-[9px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
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
          <p className="hidden lg:block px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                  className={`w-full min-h-[46px] flex md:flex-col lg:flex-row items-center md:justify-center lg:justify-start p-2 lg:px-3 lg:py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-sky-600 text-white font-semibold shadow-xs'
                      : 'text-[var(--app-text)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  title={item.label}
                >
                  <div className="flex md:flex-col lg:flex-row items-center gap-1 lg:gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-[9px] lg:text-xs tracking-tight">{item.shortLabel || item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Active Profile Capsule & Tablet Indicator */}
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
          <AvatarGraphic avatarId={avatarId || 'child-boy-hoodie'} size="sm" className="w-8 h-8 rounded-xl shrink-0" />
          <div className="hidden lg:block min-w-0 flex-1">
            <p className="text-xs font-bold text-[var(--app-text)] truncate">{patientName}</p>
            <p className="text-[10px] text-slate-400 truncate">{sickleCellType}</p>
          </div>
        </button>

        {/* PWA / Android installation action */}
        <div className="hidden lg:block">
          <PWAInstallButton variant="full" />
        </div>
      </div>
    </aside>
  );
};
