/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Droplets,
  Pill,
  HeartPulse,
  Sparkles,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { HydrationSection } from '../components/care/HydrationSection';
import { MedicationSection } from '../components/care/MedicationSection';
import { SymptomsSection } from '../components/care/SymptomsSection';
import { RoutinesSection } from '../components/care/RoutinesSection';
import { RemindersSection } from '../components/care/RemindersSection';
import { useProfile } from '../context/ProfileContext';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';

type CareTabId = 'hydration' | 'medication' | 'symptoms' | 'routines' | 'reminders';

const CARE_TABS: {
  id: CareTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}[] = [
  { id: 'hydration', label: 'Hidratação', icon: Droplets, iconColor: 'text-sky-600' },
  { id: 'medication', label: 'Medicação', icon: Pill, iconColor: 'text-rose-600' },
  { id: 'symptoms', label: 'Sintomas', icon: HeartPulse, iconColor: 'text-rose-600' },
  { id: 'routines', label: 'Rotinas', icon: Sparkles, iconColor: 'text-emerald-600' },
  { id: 'reminders', label: 'Lembretes', icon: Bell, iconColor: 'text-indigo-600' },
];

const PANEL_TRANSITION_MS = 260;

export const CareView: React.FC = () => {
  const { isDemoActive } = useProfile();
  const { playEnterSound } = useInterfaceAudio();
  const prefersReducedMotion = useReducedMotion();

  const [navState, setNavState] = useState<{
    activeIndex: number;
    exitingIndex: number | null;
    direction: 1 | -1;
  }>({
    activeIndex: 0,
    exitingIndex: null,
    direction: 1,
  });

  const railRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const exitTimerRef = useRef<number | null>(null);

  // Estado para gestos tácteis horizontais sem interferir na rolagem vertical
  const touchGestureRef = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    decided: 'horizontal' | 'vertical' | null;
    ignore: boolean;
  } | null>(null);

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= CARE_TABS.length) return;

      setNavState((prev) => {
        if (nextIndex === prev.activeIndex) return prev;
        const direction: 1 | -1 = nextIndex > prev.activeIndex ? 1 : -1;

        if (exitTimerRef.current !== null) {
          window.clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
        }

        if (!prefersReducedMotion) {
          exitTimerRef.current = window.setTimeout(() => {
            exitTimerRef.current = null;
            setNavState((current) =>
              current.exitingIndex !== null
                ? { ...current, exitingIndex: null }
                : current
            );
          }, PANEL_TRANSITION_MS);
        }

        return {
          activeIndex: nextIndex,
          exitingIndex: prefersReducedMotion ? null : prev.activeIndex,
          direction,
        };
      });

      playEnterSound();
    },
    [playEnterSound, prefersReducedMotion]
  );

  // Limpeza de temporizador ao desmontar
  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  // Centra suavemente a aba activa na barra horizontal deslizante
  useEffect(() => {
    const rail = railRef.current;
    const activeBtn = tabButtonRefs.current[navState.activeIndex];
    if (!rail || !activeBtn) return;

    const targetLeft =
      activeBtn.offsetLeft - (rail.clientWidth - activeBtn.clientWidth) / 2;
    const clampedLeft = Math.max(
      0,
      Math.min(rail.scrollWidth - rail.clientWidth, targetLeft)
    );

    rail.scrollTo({
      left: clampedLeft,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [navState.activeIndex, prefersReducedMotion]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) {
      touchGestureRef.current = null;
      return;
    }

    const target = e.target as HTMLElement | null;
    const tag = target?.tagName?.toLowerCase();
    const isInteractiveInput =
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      Boolean(target?.closest('[data-no-swipe="true"]'));

    const touch = e.touches[0];
    touchGestureRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: performance.now(),
      decided: null,
      ignore: isInteractiveInput,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const gesture = touchGestureRef.current;
    if (!gesture || gesture.ignore || e.touches.length !== 1) return;
    if (gesture.decided === 'vertical') return;

    const touch = e.touches[0];
    const dx = touch.clientX - gesture.startX;
    const dy = touch.clientY - gesture.startY;

    if (!gesture.decided) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        gesture.decided = 'horizontal';
      } else {
        gesture.decided = 'vertical';
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const gesture = touchGestureRef.current;
    touchGestureRef.current = null;
    if (!gesture || gesture.ignore || gesture.decided !== 'horizontal') return;
    if (e.changedTouches.length === 0) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - gesture.startX;
    const elapsedMs = performance.now() - gesture.startTime;
    const isSwipe = Math.abs(dx) >= 48 || (Math.abs(dx) >= 28 && elapsedMs < 260);

    if (!isSwipe) return;

    // Deslizar para a esquerda (dx < 0) avança; deslizar para a direita (dx > 0) regressa
    if (dx < 0 && navState.activeIndex < CARE_TABS.length - 1) {
      navigateToIndex(navState.activeIndex + 1);
    } else if (dx > 0 && navState.activeIndex > 0) {
      navigateToIndex(navState.activeIndex - 1);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      navigateToIndex(navState.activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      navigateToIndex(navState.activeIndex - 1);
    }
  };

  const isFirstTab = navState.activeIndex === 0;
  const isLastTab = navState.activeIndex === CARE_TABS.length - 1;

  const renderPanelContent = (tabId: CareTabId) => {
    switch (tabId) {
      case 'hydration':
        return <HydrationSection />;
      case 'medication':
        return <MedicationSection />;
      case 'symptoms':
        return <SymptomsSection />;
      case 'routines':
        return <RoutinesSection />;
      case 'reminders':
        return <RemindersSection />;
    }
  };

  const slideOffsetPx = prefersReducedMotion ? 0 : 40;

  return (
    <div
      className="space-y-6 animate-in fade-in duration-150"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Demo Mode Notice if in demo */}
      {isDemoActive && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">
              Modo Demonstração Activo — Os dados apresentados são demonstrativos e podem ser testados livremente.
            </span>
          </div>
        </div>
      )}

      {/* Barra Horizontal Deslizante de Abas com Setas <-- e --> */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-stone-200/75 rounded-2xl"
        onKeyDown={handleTabKeyDown}
      >
        {/* Seta Esquerda <-- */}
        <button
          type="button"
          onClick={() => navigateToIndex(navState.activeIndex - 1)}
          disabled={isFirstTab}
          aria-label="Aba anterior"
          title="Aba anterior"
          className={`min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] shrink-0 rounded-xl flex items-center justify-center transition-all ${
            isFirstTab
              ? 'opacity-25 text-stone-400 cursor-not-allowed pointer-events-none'
              : 'bg-white/80 hover:bg-white text-slate-800 shadow-xs active:scale-95 cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Área Deslizante das Abas */}
        <div
          ref={railRef}
          role="tablist"
          aria-label="Secções de Cuidados"
          data-no-swipe="true"
          className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {CARE_TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = navState.activeIndex === index;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabButtonRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={tab.label}
                title={tab.label}
                onClick={() => navigateToIndex(index)}
                className={`shrink-0 min-h-[44px] sm:min-h-[48px] max-w-[165px] sm:max-w-[200px] flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-stone-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${tab.iconColor}`} />
                <span className="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Seta Direita --> */}
        <button
          type="button"
          onClick={() => navigateToIndex(navState.activeIndex + 1)}
          disabled={isLastTab}
          aria-label="Próxima aba"
          title="Próxima aba"
          className={`min-w-[44px] min-h-[44px] sm:min-w-[48px] sm:min-h-[48px] shrink-0 rounded-xl flex items-center justify-center transition-all ${
            isLastTab
              ? 'opacity-25 text-stone-400 cursor-not-allowed pointer-events-none'
              : 'bg-white/80 hover:bg-white text-slate-800 shadow-xs active:scale-95 cursor-pointer'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Painéis das Abas — Mantidos montados para preservar integralmente estados e dados */}
      <div className="relative overflow-hidden">
        {CARE_TABS.map((tab, index) => {
          const isActive = navState.activeIndex === index;
          const isExiting = navState.exitingIndex === index;
          const isVisible = isActive || isExiting;

          return (
            <div
              key={tab.id}
              role="tabpanel"
              aria-label={tab.label}
              aria-hidden={!isActive}
              className={
                isExiting
                  ? 'absolute inset-x-0 top-0 pointer-events-none'
                  : isActive
                  ? 'relative'
                  : 'hidden'
              }
            >
              <motion.div
                initial={
                  isActive && navState.exitingIndex !== null && !prefersReducedMotion
                    ? { opacity: 0, x: navState.direction * slideOffsetPx }
                    : false
                }
                animate={
                  isExiting
                    ? { opacity: 0, x: -navState.direction * slideOffsetPx }
                    : isVisible
                    ? { opacity: 1, x: 0 }
                    : undefined
                }
                transition={{
                  duration: prefersReducedMotion ? 0 : isExiting ? 0.22 : 0.26,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {renderPanelContent(tab.id)}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
