/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogOut } from 'lucide-react';
import mossangueClearingBg from '../assets/images/mossangue_clearing_bg_1794576257975.jpg';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';

interface GameViewProps {
  onExit: () => void;
}

/**
 * Área de entretenimento oficial do jogo Mossangue.
 * Ecrã completo e independente com ilustração natural em pintura digital.
 */
export const GameView: React.FC<GameViewProps> = ({ onExit }) => {
  const { playExitSound } = useInterfaceAudio();

  const handleExit = () => {
    playExitSound();
    onExit();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-950 via-green-950 to-slate-950 select-none"
      role="region"
      aria-label="Mossangue — O Jogo"
    >
      {/* Digital Painting natural clearing background */}
      <img
        src={mossangueClearingBg}
        alt="Clareira natural de Mossangue"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        draggable={false}
      />

      {/* Subtle scrim for crisp typographic legibility without hiding vegetation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(6, 28, 16, 0.36) 0%, rgba(4, 20, 12, 0.62) 72%, rgba(2, 12, 8, 0.78) 100%)',
        }}
      />

      {/* Centered Editorial Game Title Block */}
      <div className="relative z-10 max-w-xl w-full px-6 sm:px-10 text-center flex flex-col items-center">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.34em] text-amber-200/95 mb-3 drop-shadow">
          Brevemente
        </span>

        <h1 className="text-4xl sm:text-6xl font-black tracking-[0.14em] text-white uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
          MOSSANGUE
        </h1>

        <p className="mt-4 sm:mt-5 text-sm sm:text-base font-medium leading-relaxed text-emerald-50/95 max-w-md drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
          O seu amigo diário está a chegar. Prepare-se para descobrir o mundo de Mossangue!
        </p>

        <button
          type="button"
          onClick={handleExit}
          className="mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-black/55 hover:bg-black/75 active:scale-95 text-white border border-white/25 backdrop-blur-md text-xs sm:text-sm font-bold tracking-wide shadow-lg transition-all cursor-pointer min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};
