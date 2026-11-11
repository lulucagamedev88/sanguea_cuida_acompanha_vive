/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DemoNotice: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 py-1">
        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
        <span>Fase 1: Protótipo e fundação PWA. Dados demonstrativos.</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-amber-50/80 border border-amber-200/60 p-3 sm:p-3.5 flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-semibold text-amber-950">FASE 1: Fundação PWA e Validação de Interface</p>
        <p className="text-amber-800/90 leading-relaxed text-[11px]">
          Esta versão contém apenas dados fictícios para validação da experiência de navegação e design responsivo. Não recolhe, armazena nem transmite quaisquer dados clínicos reais.
        </p>
      </div>
    </div>
  );
};
