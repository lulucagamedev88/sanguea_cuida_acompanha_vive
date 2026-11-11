/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 text-white px-3.5 py-1.5 text-xs font-medium shadow-lg backdrop-blur-xs border border-amber-500 animate-in fade-in slide-in-from-top-2 duration-200">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Modo Offline activo — Os dados de demonstração do Sanguea estão salvaguardados em cache.</span>
    </div>
  );
};

export { DemoNotice } from './DemoNotice';
