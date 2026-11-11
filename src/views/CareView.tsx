/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Droplets,
  Pill,
  HeartPulse,
  Sparkles,
  Bell,
} from 'lucide-react';
import { HydrationSection } from '../components/care/HydrationSection';
import { MedicationSection } from '../components/care/MedicationSection';
import { SymptomsSection } from '../components/care/SymptomsSection';
import { RoutinesSection } from '../components/care/RoutinesSection';
import { RemindersSection } from '../components/care/RemindersSection';
import { useProfile } from '../context/ProfileContext';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';

export const CareView: React.FC = () => {
  const { isDemoActive } = useProfile();
  const { playEnterSound } = useInterfaceAudio();
  const [activeTab, setActiveTab] = useState<'hydration' | 'medication' | 'symptoms' | 'routines' | 'reminders'>('hydration');

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
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

      {/* Tab Navigation Controls (Interactive Filter Segment) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/70 rounded-2xl overflow-x-auto no-scrollbar md:gap-2 md:p-2">
        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('hydration');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all touch-target ${
            activeTab === 'hydration'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-600" />
          <span>Hidratação</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('medication');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all touch-target ${
            activeTab === 'medication'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-600" />
          <span>Medicação</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('symptoms');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all touch-target ${
            activeTab === 'symptoms'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5 md:w-4 md:h-4 text-rose-600" />
          <span>Sintomas e Dor</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('routines');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all touch-target ${
            activeTab === 'routines'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
          <span>Rotinas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('reminders');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-all touch-target ${
            activeTab === 'reminders'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600" />
          <span>Lembretes</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'hydration' && <HydrationSection />}
      {activeTab === 'medication' && <MedicationSection />}
      {activeTab === 'symptoms' && <SymptomsSection />}
      {activeTab === 'routines' && <RoutinesSection />}
      {activeTab === 'reminders' && <RemindersSection />}
    </div>
  );
};
