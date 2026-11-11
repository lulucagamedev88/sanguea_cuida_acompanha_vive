/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import AquaQuestApp from '../features/aqua-quest/App';
import { backgroundMusicService } from '../services/audio';

interface GameViewProps {
  onExit: () => void;
}

/**
 * Monta o Aqua Quest como módulo imersivo sobre o workspace do Sanguéa.
 * Garante que a faixa do jogo seja iniciada e devidamente terminada ao sair.
 */
export const GameView: React.FC<GameViewProps> = ({ onExit }) => {
  useEffect(() => {
    // Ativa a faixa exclusiva do jogo Aqua Quest ao montar
    backgroundMusicService.setMode('game');

    return () => {
      // Ao sair ou desmontar o jogo, restaura a faixa da aplicação sem sobreposições
      backgroundMusicService.setMode('app');
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950">
      <AquaQuestApp onExit={onExit} />
    </div>
  );
};
