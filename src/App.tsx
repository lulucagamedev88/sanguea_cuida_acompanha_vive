/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavigationModule } from './types';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { HealthProvider } from './context/HealthContext';
import { SettingsProvider } from './context/SettingsContext';
import { InterfaceAudioProvider } from './context/InterfaceAudioContext';
import { AppLayout } from './components/layout/AppLayout';
import { EntryFlow } from './components/auth/EntryFlow';
import { ProfileCreationWizard } from './components/profile/ProfileCreationWizard';
import { ProfileSwitcherModal } from './components/profile/ProfileSwitcherModal';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { CareView } from './views/CareView';
import { CalendarView } from './views/CalendarView';
import { HistoryView } from './views/HistoryView';
import { SosView } from './views/SosView';
import { SangueaAiView } from './views/SangueaAiView';
import { GameView } from './views/GameView';
import { AboutView } from './views/AboutView';
import { CreatorView } from './views/CreatorView';
import { ThanksView } from './views/ThanksView';
import { backgroundMusicService } from './services/audio';

function SangueaApp() {
  const { activeProfile, isLocked, isLoading, lockSession } = useProfile();
  const [currentModule, setCurrentModule] = useState<NavigationModule>('dashboard');
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);

  // Sincronizar faixa musical: 'game' no Aqua Quest, 'app' no restante da aplicação
  useEffect(() => {
    backgroundMusicService.setMode(currentModule === 'game' ? 'game' : 'app');
  }, [currentModule]);

  // Scroll to top when switching navigation modules
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentModule]);

  // Gestão do botão Voltar do Android (gestos de recuo e navegação nativa)
  const handleNavigate = (module: NavigationModule) => {
    if (module === currentModule) return;
    try {
      window.history.pushState({ module }, '', `#${module}`);
    } catch {
      // Ignora falha de pushState
    }
    setCurrentModule(module);
  };

  const openSwitcher = () => {
    try {
      window.history.pushState({ modal: 'switcher' }, '', '#switcher');
    } catch {
      // Ignora
    }
    setIsSwitcherOpen(true);
  };

  useEffect(() => {
    try {
      if (!window.history.state) {
        window.history.replaceState({ module: 'dashboard' }, '', '#dashboard');
      }
    } catch {
      // Ignora
    }

    const handlePopState = (event: PopStateEvent) => {
      // 1. Se modal de troca de perfil estiver aberto, fecha-o
      if (isSwitcherOpen) {
        setIsSwitcherOpen(false);
        return;
      }

      // 2. Se wizard de criação estiver ativo, cancela-o
      if (isCreatingProfile) {
        setIsCreatingProfile(false);
        return;
      }

      // 3. Navegação entre módulos ou regresso ao Dashboard
      const stateModule = (event.state as { module?: NavigationModule })?.module;
      if (stateModule) {
        setCurrentModule(stateModule);
      } else {
        setCurrentModule('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSwitcherOpen, isCreatingProfile]);

  // Loading screen while IndexedDB metadata initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="w-12 h-12 rounded-2xl bg-[var(--app-accent)] text-white flex items-center justify-center animate-pulse mb-3 shadow-lg shadow-rose-600/20">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-500">A inicializar armazenamento seguro local...</p>
      </div>
    );
  }

  // If in Profile Creation Wizard flow
  if (isCreatingProfile) {
    return (
      <ProfileCreationWizard
        onCancel={() => setIsCreatingProfile(false)}
        onSuccess={() => {
          setIsCreatingProfile(false);
          setCurrentModule('dashboard');
        }}
      />
    );
  }

  // If session is locked or no active profile unlocked
  if (isLocked || !activeProfile) {
    return (
      <EntryFlow onStartCreate={() => setIsCreatingProfile(true)} />
    );
  }

  // Main Unlocked Application Workspace
  return (
    <>
      <AppLayout
        currentModule={currentModule}
        onNavigate={handleNavigate}
        patientName={activeProfile.name}
        sickleCellType={activeProfile.sickleCellType}
        avatarId={activeProfile.avatarId}
        onOpenSwitcher={openSwitcher}
        onLock={lockSession}
      >
        {currentModule === 'dashboard' && (
          <DashboardView onNavigate={handleNavigate} patient={activeProfile} />
        )}

        {currentModule === 'profile' && (
          <ProfileView
            patient={activeProfile}
            onOpenSwitcher={openSwitcher}
          />
        )}

        {currentModule === 'care' && <CareView />}

        {currentModule === 'calendar' && <CalendarView />}

        {currentModule === 'history' && <HistoryView />}

        {currentModule === 'sos' && <SosView patient={activeProfile} />}

        {currentModule === 'ai' && <SangueaAiView />}

        {currentModule === 'game' && (<GameView onExit={() => handleNavigate('dashboard')} />)}

        {currentModule === 'about' && <AboutView />}

        {currentModule === 'creator' && <CreatorView />}

        {currentModule === 'thanks' && <ThanksView />}
      </AppLayout>

      {/* Profile Switcher & Multi-Profile Manager Modal */}
      <ProfileSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        onOpenCreateNew={() => setIsCreatingProfile(true)}
      />
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <InterfaceAudioProvider>
        <ProfileProvider>
          <HealthProvider>
            <SangueaApp />
          </HealthProvider>
        </ProfileProvider>
      </InterfaceAudioProvider>
    </SettingsProvider>
  );
}
