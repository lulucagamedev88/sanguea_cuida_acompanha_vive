/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Settings, Info, Droplets, Apple, ArrowLeft } from 'lucide-react';
import Game from './components/Game';
import { IMAGES } from './constants';

type AppView = 'MENU' | 'SETTINGS' | 'ABOUT' | 'MODE_SELECTION' | 'PLAYING';

interface AquaQuestAppProps {
  onExit: () => void;
}

export default function App({ onExit }: AquaQuestAppProps) {
  const [view, setView] = useState<AppView>('MENU');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
        {view === 'MENU' && (
          <motion.div
            key="menu"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex min-h-screen items-center justify-center overflow-hidden p-6"
          >
            <div
              className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 blur-sm"
              style={{ backgroundImage: `url(${IMAGES.background})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
            <div className="relative z-10 w-full max-w-lg space-y-12 text-center">
              <div className="space-y-4">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="rounded-3xl border border-blue-500/30 bg-blue-500/20 p-4 backdrop-blur-md">
                    <Droplets size={64} className="animate-pulse text-blue-400" />
                  </div>
                </motion.div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-6xl font-bold tracking-tighter md:text-7xl"
                >
                  AQUA<br /><span className="text-blue-500">QUEST</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-slate-400"
                >
                  Cuida. Acompanha. Vive.
                </motion.p>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid gap-4"
              >
                <button
                  onClick={() => setView('MODE_SELECTION')}
                  className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 py-5 font-bold text-white shadow-xl transition-all hover:bg-blue-500 active:scale-95"
                >
                  <Play size={24} className="fill-current" />
                  <span className="text-xl">Iniciar Jogo</span>
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setView('SETTINGS')}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-slate-900/50 py-4 text-slate-300 transition-all hover:bg-slate-800/50"
                  >
                    <Settings size={20} /> Definições
                  </button>
                  <button
                    onClick={() => setView('ABOUT')}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/5 bg-slate-900/50 py-4 text-slate-300 transition-all hover:bg-slate-800/50"
                  >
                    <Info size={20} /> Sobre
                  </button>
                </div>
                <button
                  onClick={onExit}
                  className="mx-auto flex items-center gap-2 py-2 text-sm text-slate-400 transition-colors hover:text-white"
                >
                  <ArrowLeft size={18} /> Voltar ao Sanguéa
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {view === 'MODE_SELECTION' && (
          <motion.div
            key="mode-selection"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex min-h-screen items-center justify-center bg-slate-950 p-6"
          >
            <div className="w-full max-w-4xl">
              <div className="mb-12 flex items-center justify-between gap-4">
                <h2 className="text-3xl font-bold">Escolhe o Modo</h2>
                <button
                  onClick={() => setView('MENU')}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Voltar
                </button>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                <button
                  onClick={() => setView('PLAYING')}
                  className="group rounded-3xl bg-blue-600 p-8 text-left shadow-xl ring-4 ring-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white">
                    <Droplets size={32} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">Rebenta Bolhas de Água</h3>
                  <p className="mb-6 text-blue-100">Recolhe água limpa para encher o teu cantil e evita a contaminação.</p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
                    Jogar Agora <Play size={14} className="fill-current" />
                  </span>
                </button>

                <div className="relative rounded-3xl border-2 border-white/5 bg-slate-900/50 p-8 opacity-60">
                  <div className="absolute right-4 top-4 rounded border border-white/10 bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">
                    EM BREVE
                  </div>
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
                    <Apple size={32} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-300">Colheita de Frutas</h3>
                  <p className="mb-6 text-slate-500">Modo reservado para desenvolvimento futuro.</p>
                  <span className="text-sm font-bold text-slate-600">Brevemente disponível</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'SETTINGS' && (
          <motion.div
            key="settings"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex min-h-screen items-center justify-center bg-slate-950 p-6"
          >
            <div className="w-full max-w-md rounded-3xl border border-white/5 bg-slate-900 p-8">
              <h2 className="mb-8 text-3xl font-bold">Definições</h2>
              <div className="space-y-6">
                {['Efeitos Sonoros', 'Música'].map((setting) => (
                  <div key={setting} className="flex items-center justify-between">
                    <span className="font-medium text-slate-300">{setting}</span>
                    <div className="relative h-6 w-12 rounded-full bg-blue-600">
                      <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white" />
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/5 pt-8">
                  <button onClick={() => setView('MENU')} className="w-full rounded-2xl bg-slate-800 py-4 font-bold text-white transition-all hover:bg-slate-700">
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'ABOUT' && (
          <motion.div
            key="about"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex min-h-screen items-center justify-center bg-slate-950 p-6"
          >
            <div className="w-full max-w-md rounded-3xl border border-white/5 bg-slate-900 p-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <Droplets size={40} />
              </div>
              <h2 className="mb-4 text-3xl font-bold">Aqua Quest</h2>
              <p className="mb-8 leading-relaxed text-slate-400">
                Um projeto "Sanguea — Cuida. Acompanha. Vive." focado na promoção de hábitos saudáveis e hidratação através do jogo.
              </p>
              <div className="mb-8 space-y-2 text-sm text-slate-500">
                <p>Versão 1.0.0</p>
                <p>© 2026 Aqua Quest Team</p>
              </div>
              <button onClick={() => setView('MENU')} className="w-full rounded-2xl bg-slate-800 py-4 font-bold text-white transition-all hover:bg-slate-700">
                Voltar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'PLAYING' && (
        <div className="fixed inset-0 z-[60]">
          <Game onBackToMenu={() => setView('MODE_SELECTION')} />
        </div>
      )}
    </div>
  );
}
