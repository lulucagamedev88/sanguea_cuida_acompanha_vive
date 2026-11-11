/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, CheckCircle2, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
    }
  };

  if (isInstalled || justInstalled) {
    if (variant === 'full') {
      return (
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/40 ${className}`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>App instalada no dispositivo Android</span>
        </div>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Instalada</span>
      </span>
    );
  }

  // Android installation trigger
  if (isInstallable) {
    if (variant === 'full') {
      return (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--app-accent)] text-white hover:opacity-90 text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[48px] ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar no Android</span>
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--app-accent)] text-white hover:opacity-90 text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer min-h-[36px] ${className}`}
        title="Instalar no ecrã principal do smartphone Android"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden xs:inline">Instalar</span>
      </button>
    );
  }

  // Discreto se já estiver em modo standalone ou a aguardar evento
  return null;
};
