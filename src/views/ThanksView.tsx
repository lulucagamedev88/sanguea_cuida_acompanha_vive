/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Heart, HeartHandshake, Users, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';

interface ThanksViewProps {
  onExit: () => void;
}

const SCROLL_SPEED_PX_PER_SEC = 36;
const FINAL_HOLD_DURATION_MS = 4500;

export const ThanksView: React.FC<ThanksViewProps> = ({ onExit }) => {
  const prefersReducedMotion = useReducedMotion();
  const { playExitSound } = useInterfaceAudio();

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const finalBlockRef = useRef<HTMLDivElement | null>(null);

  const rafIdRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const exitedRef = useRef<boolean>(false);
  const onExitRef = useRef(onExit);

  const [translateY, setTranslateY] = useState<number>(0);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  const stopAllTimersAndAnimations = useCallback(() => {
    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (holdTimerRef.current !== null) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const triggerExit = useCallback(
    (withSound: boolean) => {
      if (exitedRef.current) return;
      exitedRef.current = true;
      stopAllTimersAndAnimations();
      if (withSound) {
        playExitSound();
      }
      onExitRef.current();
    },
    [playExitSound, stopAllTimersAndAnimations]
  );

  // Suporte à tecla Escape para sair manualmente
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerExit(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerExit]);

  // Motor de rolagem cinematográfica constante de baixo para cima
  useEffect(() => {
    exitedRef.current = false;

    if (prefersReducedMotion) {
      setIsReady(true);
      return () => {
        stopAllTimersAndAnimations();
      };
    }

    const viewport = viewportRef.current;
    const track = trackRef.current;
    const finalBlock = finalBlockRef.current;
    if (!viewport || !track || !finalBlock) return;

    const computeBounds = () => {
      const vpHeight = viewport.clientHeight;
      const startY = Math.round(vpHeight * 0.78);
      const finalCenterInTrack = finalBlock.offsetTop + finalBlock.offsetHeight / 2;
      const endY = Math.round(vpHeight * 0.5 - finalCenterInTrack);
      return { startY, endY: Math.min(startY - 120, endY) };
    };

    let { startY, endY } = computeBounds();
    let currentY = startY;
    let lastTimestamp: number | null = null;
    let holding = false;

    setTranslateY(startY);
    setIsReady(true);

    const handleResize = () => {
      const updated = computeBounds();
      startY = updated.startY;
      endY = updated.endY;
      if (holding) {
        currentY = endY;
        setTranslateY(endY);
      }
    };

    window.addEventListener('resize', handleResize);

    const tick = (timestamp: number) => {
      if (exitedRef.current) return;

      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }

      const dtSec = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      currentY -= SCROLL_SPEED_PX_PER_SEC * dtSec;

      if (currentY <= endY) {
        currentY = endY;
        setTranslateY(endY);
        holding = true;
        rafIdRef.current = null;

        if (holdTimerRef.current === null) {
          holdTimerRef.current = window.setTimeout(() => {
            holdTimerRef.current = null;
            triggerExit(false);
          }, FINAL_HOLD_DURATION_MS);
        }
        return;
      }

      setTranslateY(currentY);
      rafIdRef.current = window.requestAnimationFrame(tick);
    };

    rafIdRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      stopAllTimersAndAnimations();
    };
  }, [prefersReducedMotion, stopAllTimersAndAnimations, triggerExit]);

  const creditsContent = (
    <div className="max-w-2xl mx-auto px-6 sm:px-10 text-center space-y-12 sm:space-y-14">
      {/* Cabeçalho dos Créditos */}
      <header className="space-y-4 pt-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-300/90">
          <HeartHandshake className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Reconhecimento & Gratidão</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Agradecimentos
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
          Um tributo de profundo carinho, respeito e gratidão às pessoas fundamentais nesta caminhada e a toda a comunidade que vive com doença falciforme.
        </p>
      </header>

      <div className="w-16 h-px bg-gradient-to-r from-transparent via-rose-400/50 to-transparent mx-auto" />

      {/* 1. Isabel António (Mamã Kimbangui) — Homenagem Especial à Mãe */}
      <section className="space-y-4 py-4 px-4 sm:px-6 rounded-3xl bg-white/[0.03] border border-rose-500/20">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-900/40">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-300">
            Agradecimento Especial à Minha Mãe
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Isabel António (Mamã Kimbangui)
          </h2>
        </div>

        <div className="space-y-3.5 text-sm sm:text-base text-slate-200 leading-relaxed">
          <p>
            À minha querida mãe, expresso a mais profunda gratidão, amor e respeito. Mesmo nos momentos mais difíceis e desafiantes, nunca soltou a minha mão, manteve-se firme ao meu lado com uma força serena, oração, presença constante e um coração generoso que sempre soube cuidar e proteger.
          </p>
          <p>
            Cada noite dedicada a construir o Sanguea carregou consigo o exemplo de coragem, entrega e dignidade que aprendi consigo. Obrigado pelo apoio incondicional e pela confiança silenciosa e inabalável no meu propósito.
          </p>
          <p className="pt-1 font-bold text-rose-300 text-base sm:text-lg">
            Mãe, esta conquista também é tua. Obrigado por nunca deixares de acreditar em mim.
          </p>
        </div>
      </section>

      {/* 2. Wilson Domingos */}
      <section className="space-y-3">
        <div className="flex flex-col items-center gap-2">
          <Award className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Wilson Domingos</h2>
          <p className="text-xs sm:text-sm font-medium text-sky-300/90">
            Amizade verdadeira e confiança
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Ao meu grande amigo Wilson Domingos, o meu sincero agradecimento pelo apoio constante, pela amizade leal que se manteve firme mesmo nos momentos mais exigentes e pela confiança e credibilidade infinita que sempre depositou em mim e neste projecto desde a primeira hora.
        </p>
      </section>

      {/* 3. Cecília */}
      <section className="space-y-3">
        <div className="flex flex-col items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Cecília</h2>
          <p className="text-xs sm:text-sm font-medium text-rose-300/90">
            Resiliência, carinho e presença
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          À minha namorada Cecília, obrigado pela sua resiliência admirável, carinho diário, paciência e presença constante ao longo de todo este percurso. Um projecto desta dimensão exige tempo, entrega e muitos sacrifícios, e o seu apoio e compreensão foram essenciais para tornar cada etapa possível.
        </p>
      </section>

      {/* 4. Vicente Garcia */}
      <section className="space-y-3">
        <div className="flex flex-col items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Vicente Garcia</h2>
          <p className="text-xs sm:text-sm font-medium text-emerald-300/90">
            Força, apoio e incentivo
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Ao meu irmão Vicente Garcia, obrigado pela força, pelo apoio fraternal e pelo incentivo genuíno ao longo de todo o desenvolvimento do Sanguea. A sua energia e palavras de encorajamento foram um suporte importante em cada desafio superado.
        </p>
      </section>

      <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent mx-auto" />

      {/* 5. Às Pessoas e Famílias */}
      <section className="space-y-3">
        <div className="flex flex-col items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Às Pessoas e Famílias</h2>
          <p className="text-xs sm:text-sm font-medium text-sky-300/90">
            A inspiração central do projecto
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          O nosso mais profundo agradecimento a todas as crianças, jovens, adultos e famílias que enfrentam diariamente os desafios da doença falciforme com coragem, resiliência e esperança. A vossa determinação é a força motriz do desenvolvimento do Sanguea.
        </p>
      </section>

      {/* 6. Aos Cuidadores e Profissionais */}
      <section className="space-y-3">
        <div className="flex flex-col items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-rose-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">Aos Cuidadores e Profissionais</h2>
          <p className="text-xs sm:text-sm font-medium text-rose-300/90">
            Dedicação incondicional
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Expressamos a nossa admiração aos pais, familiares, cuidadores e profissionais de saúde que prestam apoio constante, garantindo que o cuidado médico, o carinho e a atenção preventiva estejam sempre presentes no quotidiano de quem necessita.
        </p>
      </section>

      {/* 7. À Comunidade de Apoio */}
      <section className="space-y-3">
        <div className="flex flex-col items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg sm:text-xl font-bold text-white">À Comunidade de Apoio</h2>
          <p className="text-xs sm:text-sm font-medium text-emerald-300/90">
            União e sensibilização
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          A todos os que sensibilizam a sociedade, promovem a doação de sangue e apoiam iniciativas comunitárias de consciencialização sobre a hemoglobinopatia falciforme. A solidariedade de todos torna a jornada mais leve e esperançosa.
        </p>
      </section>

      {/* Encerramento Oficial dos Créditos */}
      <div
        ref={finalBlockRef}
        className="pt-12 pb-10 space-y-5 flex flex-col items-center"
      >
        <div className="w-10 h-10 rounded-2xl bg-[var(--app-accent)] text-white flex items-center justify-center shadow-lg shadow-rose-900/40">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-semibold text-slate-200">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Sanguea — Cuida. Acompanha. Vive.</span>
        </div>

        <p className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white pt-1">
          Por Rodrigo Vando Luluca - LulucaGameDev
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#07090f] text-slate-100 overflow-hidden select-none"
      role="region"
      aria-label="Créditos de Agradecimentos do Sanguea"
    >
      {/* Fundo visual discreto e coerente com a identidade Sanguea */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 28%, rgba(225, 29, 72, 0.14) 0%, rgba(15, 23, 42, 0.65) 48%, rgba(7, 9, 15, 1) 100%)',
        }}
      />

      {/* Barra superior discreta com Botão Voltar funcional */}
      <div className="relative z-30 flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 pt-safe">
        <button
          type="button"
          onClick={() => triggerExit(true)}
          className="inline-flex items-center gap-2 min-h-[48px] px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 border border-white/15 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          aria-label="Voltar ao Início"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Voltar</span>
        </button>
      </div>

      {/* Área Principal dos Créditos */}
      <div
        ref={viewportRef}
        className={`relative z-10 flex-1 w-full ${
          prefersReducedMotion ? 'overflow-y-auto py-8 pb-20' : 'overflow-hidden'
        }`}
      >
        {prefersReducedMotion ? (
          <div className="space-y-8">
            {creditsContent}
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => triggerExit(true)}
                className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-2xl bg-[var(--app-accent)] text-white text-sm font-bold shadow-lg cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar ao Início</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            ref={trackRef}
            className="w-full will-change-transform"
            style={{
              transform: `translate3d(0, ${translateY}px, 0)`,
              opacity: isReady ? 1 : 0,
              transition: 'opacity 300ms ease-out',
            }}
          >
            {creditsContent}
          </div>
        )}

        {/* Máscaras graduais superior e inferior para entrada/saída suave do texto */}
        {!prefersReducedMotion && (
          <>
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 sm:h-24 bg-gradient-to-b from-[#07090f] via-[#07090f]/75 to-transparent z-20" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 sm:h-28 bg-gradient-to-t from-[#07090f] via-[#07090f]/80 to-transparent z-20 pb-safe" />
          </>
        )}
      </div>
    </div>
  );
};
