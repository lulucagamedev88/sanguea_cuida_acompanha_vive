/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavigationModule } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { OfflineIndicator } from '../common/OfflineIndicator';

interface AppLayoutProps {
  currentModule: NavigationModule;
  onNavigate: (module: NavigationModule) => void;
  patientName: string;
  sickleCellType: string;
  avatarId?: string;
  photoUrl?: string;
  onOpenSwitcher?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentModule,
  onNavigate,
  patientName,
  sickleCellType,
  avatarId,
  photoUrl,
  onOpenSwitcher,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col md:flex-row font-sans transition-colors duration-300">
      <OfflineIndicator />

      {/* Adaptive Navigation for Android Tablets and Large Screens */}
      <Sidebar
        currentModule={currentModule}
        onNavigate={onNavigate}
        patientName={patientName}
        sickleCellType={sickleCellType}
        avatarId={avatarId}
        photoUrl={photoUrl}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          currentModule={currentModule}
          onNavigate={onNavigate}
          patientName={patientName}
          avatarId={avatarId}
          photoUrl={photoUrl}
          onOpenSwitcher={onOpenSwitcher}
        />

        <main className="flex-1 px-3.5 py-4 sm:px-6 sm:py-6 md:px-6 md:py-6 lg:px-8 lg:py-7 max-w-7xl w-full mx-auto pb-28 sm:pb-32 md:pb-10 lg:pb-12 pt-safe">
          {children}
        </main>
      </div>

      {/* Android Smartphone Bottom Navigation (Hidden on Tablets >= 768px) */}
      <div className="md:hidden">
        <MobileNav
          currentModule={currentModule}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
};
