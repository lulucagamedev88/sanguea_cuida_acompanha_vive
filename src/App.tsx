/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NavigationModule, UserProfile } from './types';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { HealthProvider } from './context/HealthContext';
import { SettingsProvider } from './context/SettingsContext';
import { InterfaceAudioProvider } from './context/InterfaceAudioContext';
import { AppLayout } from './components/layout/AppLayout';
import { EntryFlow } from './components/auth/EntryFlow';
import { WelcomeSequence } from './components/auth/WelcomeSequence';
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
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { CreatorView } from './views/CreatorView';
import { ThanksView } from './views/ThanksView';
import { backgroundMusicService } from './services/audio';

function SangueaApp() {
  const { activeProfile, isLocked, isLoading } = useProfile();
  const [currentModule, setCurrentModule] = useState<NavigationModule>('dashboard');
  const currentModuleRef = useRef<NavigationModule>('dashboard');
  const previousModuleRef = useRef<NavigationModule>('dashboard');
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState<boolean>(false);
  const [welcomeProfile, setWelcomeProfile] = useState<UserProfile | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    currentModuleRef.current = currentModule;
  }, [currentModule]);

  // Mantém a música ambiente global contínua em toda a aplicação
  useEffect(() => {
    backgroundMusicService.setMode('app');
  }, [currentModule]);

  // Scroll to top when switching navigation modules
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentModule]);

  // Gestão do botão Voltar do Android (gestos de recuo e navegação nativa)
  const handleNavigate = (module: NavigationModule) => {
    if (module === currentModule) return;
    if (module === 'game' && currentModule !== 'game') {
      previousModuleRef.current = currentModule;
    }
    try {
      window.history.pushState({ module }, '', `#${module}`);
    } catch {
      // Ignora falha de pushState
    }
    setCurrentModule(module);
  };

  const handleExitGame = () => {
    const target = previousModuleRef.current && previousModuleRef.current !== 'game'
      ? previousModuleRef.current
      : 'dashboard';
    try {
      window.history.pushState({ module: target }, '', `#${target}`);
    } catch {
      // Ignora falha de pushState
    }
    setCurrentModule(target);
  };

  const handleExitThanks = () => {
    try {
      window.history.replaceState({ module: 'dashboard' }, '', '#dashboard');
    } catch {
      // Ignora falha de replaceState
    }
    setCurrentModule('dashboard');
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
      // Não interromper a sequência de boas-vindas de 10 segundos
      if (welcomeProfile) {
        return;
      }

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

      // 3. Se estiver nos créditos de Agradecimentos, regressa sempre ao Início
      if (currentModuleRef.current === 'thanks') {
        try {
          window.history.replaceState({ module: 'dashboard' }, '', '#dashboard');
        } catch {
          // Ignora
        }
        setCurrentModule('dashboard');
        return;
      }

      // 4. Navegação entre módulos ou regresso ao Início
      const stateModule = (event.state as { module?: NavigationModule })?.module;
      if (stateModule) {
        setCurrentModule(stateModule);
      } else {
        setCurrentModule('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSwitcherOpen, isCreatingProfile, welcomeProfile]);

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
        onSuccess={(created) => {
          setIsCreatingProfile(false);
          setCurrentModule('dashboard');
          setWelcomeProfile(created);
        }}
      />
    );
  }

  // 10-second welcome experience exclusively after new profile registration
  if (welcomeProfile) {
    return (
      <WelcomeSequence
        profile={welcomeProfile}
        onComplete={() => setWelcomeProfile(null)}
      />
    );
  }

  // If session is locked or no active profile unlocked
  if (isLocked || !activeProfile) {
    return (
      <EntryFlow onStartCreate={() => setIsCreatingProfile(true)} />
    );
  }

  // Independent full-screen entertainment area for Mossangue
  if (currentModule === 'game') {
    return <GameView onExit={handleExitGame} />;
  }

  // Full-screen cinematic credits for Agradecimentos
  if (currentModule === 'thanks') {
    return <ThanksView onExit={handleExitThanks} />;
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
        photoUrl={activeProfile.photoDataUrl}
        onOpenSwitcher={openSwitcher}
      >
        <motion.div
          key={currentModule}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
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

          {currentModule === 'settings' && <SettingsView />}

          {currentModule === 'about' && <AboutView />}

          {currentModule === 'creator' && <CreatorView />}
        </motion.div>
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
