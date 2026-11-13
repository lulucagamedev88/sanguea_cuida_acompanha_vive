/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IMAGES } from './constants';

interface AquaQuestAppProps {
  onExit: () => void;
}

export default function App({ onExit: _onExit }: AquaQuestAppProps) {
  return (
    <div className="relative flex min-h-full w-full flex-1 items-center justify-center overflow-hidden bg-slate-950 p-6 font-sans text-white">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 blur-sm"
        style={{ backgroundImage: `url(${IMAGES.background})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
      <div className="relative z-10 w-full max-w-lg space-y-3 text-center select-none">
        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          MOSSANGUE
        </h2>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 sm:text-sm">
          O JOGO — BREVEMENTE
        </p>
      </div>
    </div>
  );
}

