/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Play, RefreshCcw, Home } from 'lucide-react';
import Bubble from './Bubble';
import Canteen from './Canteen';
import { LEVELS, IMAGES, GameState } from '../constants';
import { audioSystem } from '../utils/audio';

interface GameProps {
  onBackToMenu: () => void;
}

interface ActiveBubble {
  id: number;
  x: number;
  isContaminated: boolean;
}

export default function Game({ onBackToMenu }: GameProps) {
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].duration);
  const [fillAmount, setFillAmount] = useState(0);
  const [contamination, setContamination] = useState(0);
  const [bubbles, setBubbles] = useState<ActiveBubble[]>([]);

  const currentLevel = LEVELS[levelIndex];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bubbleIdCounter = useRef(0);

  const gameOver = useCallback(() => {
    setGameState('GAMEOVER');
    if (timerRef.current) clearInterval(timerRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
  }, []);

  const nextLevel = useCallback(() => {
    if (levelIndex < LEVELS.length - 1) {
      setGameState('LEVEL_COMPLETE');
      audioSystem.playLevelUp();
      if (timerRef.current) clearInterval(timerRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    } else {
      setGameState('LEVEL_COMPLETE');
    }
  }, [levelIndex]);

  const startLevel = useCallback((index: number) => {
    const level = LEVELS[index];
    setLevelIndex(index);
    setTimeLeft(level.duration);
    setFillAmount(0);
    setScore(0);
    setContamination(0);
    setBubbles([]);
    setGameState('PLAYING');
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft((previous) => {
          if (previous <= 1) {
            gameOver();
            return 0;
          }
          return previous - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, gameOver]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      spawnRef.current = setInterval(() => {
        const isContaminated = Math.random() < currentLevel.contaminationChance;
        const newBubble: ActiveBubble = {
          id: ++bubbleIdCounter.current,
          x: 10 + Math.random() * 80,
          isContaminated,
        };
        setBubbles((previous) => [...previous, newBubble]);
      }, currentLevel.frequency);
    }
    return () => {
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [gameState, currentLevel]);

  const handlePop = (id: number, wasPoppedByUser: boolean) => {
    if (gameState !== 'PLAYING') return;

    setBubbles((previous) => {
      const bubble = previous.find((item) => item.id === id);
      if (!bubble) return previous;

      if (wasPoppedByUser) {
        audioSystem.playPop();
        if (bubble.isContaminated) {
          setScore((value) => value + 25);
        } else {
          setScore((value) => value + 10);
          setFillAmount((value) => {
            const next = value + (100 / (currentLevel.goal / 10));
            if (next >= 100) {
              setTimeout(nextLevel, 100);
              return 100;
            }
            return next;
          });
        }
      } else if (bubble.isContaminated) {
        audioSystem.playContamination();
        setContamination((value) => {
          const next = value + 1;
          if (next >= 5) setTimeout(gameOver, 100);
          return next;
        });
      }
      return previous.filter((item) => item.id !== id);
    });
  };

  const togglePause = () => {
    if (gameState === 'PLAYING') setGameState('PAUSED');
    else if (gameState === 'PAUSED') setGameState('PLAYING');
  };

  return (
    <div className="relative h-screen w-full select-none touch-none overflow-hidden bg-slate-900 font-sans">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMAGES.background})` }} />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 flex h-full w-full flex-col md:flex-row">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 p-4 backdrop-blur-md md:w-64 md:flex-col md:items-start md:border-b-0 md:border-r md:p-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Nível {currentLevel.number}</p>
              <h2 className="whitespace-nowrap text-xl font-bold text-white">{currentLevel.name}</h2>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold uppercase text-white/50">Pontos</p>
              <p className="font-mono text-3xl tabular-nums text-white">{score}</p>
            </div>
          </div>

          <Canteen fillPercentage={fillAmount} contaminationLevel={contamination} />

          <div className="flex items-center gap-4 md:flex-col md:items-start">
            <div className="text-right md:text-left">
              <p className="text-xs font-bold uppercase text-white/50">Tempo</p>
              <p className={`font-mono text-3xl tabular-nums ${timeLeft <= 10 ? 'animate-pulse text-red-400' : 'text-white'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <button
              type="button"
              aria-label={gameState === 'PLAYING' ? 'Pausar jogo' : 'Retomar jogo'}
              onClick={togglePause}
              className="rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              {gameState === 'PLAYING' ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        </div>

        <div className="relative flex-1">
          <AnimatePresence>
            {bubbles.map((bubble) => (
              <Bubble
                key={bubble.id}
                id={bubble.id}
                x={bubble.x}
                isContaminated={bubble.isContaminated}
                speed={currentLevel.speed}
                isPaused={gameState === 'PAUSED'}
                onPop={handlePop}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {gameState !== 'PLAYING' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl"
            >
              {gameState === 'PAUSED' && (
                <>
                  <h2 className="mb-2 text-4xl font-bold text-white">Pausa</h2>
                  <p className="mb-8 text-slate-400">O jogo está em espera.</p>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => setGameState('PLAYING')} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500 active:scale-95">
                      <Play size={20} /> Continuar
                    </button>
                    <button onClick={() => startLevel(levelIndex)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 py-4 font-bold text-white transition-all hover:bg-slate-700">
                      <RefreshCcw size={20} /> Reiniciar Nível
                    </button>
                    <button onClick={onBackToMenu} className="flex w-full items-center justify-center gap-2 py-4 text-slate-400 transition-colors hover:text-white">
                      <Home size={20} /> Menu Principal
                    </button>
                  </div>
                </>
              )}

              {gameState === 'LEVEL_COMPLETE' && (
                <>
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <Play size={48} className="fill-current" />
                  </div>
                  <h2 className="mb-2 text-4xl font-bold text-white">Nível Concluído!</h2>
                  <p className="mb-8 text-slate-400">Cantil cheio e pronto para a próxima aventura.</p>
                  <div className="mb-8 rounded-2xl bg-slate-800/50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase text-slate-500">Pontuação Final</p>
                    <p className="font-mono text-3xl text-white">{score}</p>
                  </div>
                  {levelIndex < LEVELS.length - 1 ? (
                    <button onClick={() => startLevel(levelIndex + 1)} className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500">
                      Próximo Nível
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="font-bold text-emerald-400">Parabéns! Completou todos os níveis!</p>
                      <button onClick={onBackToMenu} className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500">
                        Voltar ao Menu
                      </button>
                    </div>
                  )}
                </>
              )}

              {gameState === 'GAMEOVER' && (
                <>
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/20 text-4xl text-red-500">⚠️</div>
                  <h2 className="mb-2 text-4xl font-bold text-white">Tenta Novamente</h2>
                  <p className="mb-8 text-slate-400">
                    {contamination >= 5 ? 'A água ficou demasiado contaminada.' : 'O tempo terminou antes de encher o cantil.'}
                  </p>
                  <div className="mb-8 rounded-2xl bg-slate-800/50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase text-slate-500">Pontos Acumulados</p>
                    <p className="font-mono text-3xl text-white">{score}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => startLevel(levelIndex)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white transition-all hover:bg-blue-500">
                      <RefreshCcw size={20} /> Tentar Novamente
                    </button>
                    <button onClick={onBackToMenu} className="flex w-full items-center justify-center gap-2 py-4 text-slate-400 transition-colors hover:text-white">
                      <Home size={20} /> Menu Principal
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
