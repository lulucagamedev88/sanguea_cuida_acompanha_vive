/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Droplets,
  Pill,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  Heart,
  ChevronRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  Stethoscope,
  Smile,
  Gamepad2,
  User,
  Phone,
} from 'lucide-react';
import { NavigationModule, PatientProfile } from '../types';
import { useHealth } from '../context/HealthContext';
import { useProfile } from '../context/ProfileContext';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';
import { AvatarGraphic } from '../components/avatar/AvatarGraphic';

interface DashboardViewProps {
  onNavigate: (module: NavigationModule) => void;
  patient: PatientProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  patient,
}) => {
  const { isDemoActive } = useProfile();
  const { playEnterSound, playExitSound } = useInterfaceAudio();
  const {
    healthRecord,
    todayDateStr,
    todayHydrationTotalMl,
    todayHydrationPercent,
    todayMedicationSchedule,
    todayRoutinesStatus,
    upcomingAppointments,
    recentSymptoms,
    addHydration,
    logMedicationDose,
    toggleRoutineCompletion,
  } = useHealth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleQuickAddGlass = async (amount: number = 250) => {
    await addHydration(amount, undefined, undefined, 'Copo de água (Dashboard)');
    showToast(`Adicionado +${amount} ml de água com sucesso!`);
  };

  const currentTargetMl = healthRecord?.hydrationConfig.dailyTargetMl || 2000;
  const nextAppointment = upcomingAppointments[0];
  const pendingMeds = todayMedicationSchedule.filter((m) => m.status === 'pending');
  const takenMedsCount = todayMedicationSchedule.filter((m) => m.status === 'taken').length;
  const completedRoutinesCount = todayRoutinesStatus.filter((r) => r.isCompleted).length;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-150">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Demo Notice */}
      {isDemoActive && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-semibold truncate">
              Modo Demonstração Ativo — Acompanhamento de Mariana Costa Silva (HbSS).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              onNavigate('profile');
            }}
            className="text-xs font-bold underline hover:opacity-80 shrink-0 cursor-pointer"
          >
            Ver Perfil
          </button>
        </div>
      )}

      {/* Welcome & Patient Header Banner */}
      <div className="bg-[var(--app-accent)] text-[var(--app-accent-foreground)] rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden border border-white/10 transition-colors duration-300">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              onClick={() => {
                playEnterSound();
                onNavigate('profile');
              }}
              className="cursor-pointer hover:scale-105 transition-transform shrink-0"
              title="Ver perfil completo e definições"
            >
              <AvatarGraphic avatarId={patient.avatarId} size="xl" className="shadow-lg border-2 border-white/30" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold opacity-80 text-white">
                  Sanguéa Android
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-white border border-white/20">
                  {patient.gender} · {patient.ageGroup} · {patient.sickleCellType}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight mt-0.5 text-white">
                Olá, {patient.name.split(' ')[0]}!
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/90 mt-1 truncate">
                Acompanhamento clínico local e confidencial para Angola (🇦🇴).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('profile');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition border border-white/20 cursor-pointer min-h-[44px]"
            >
              Definições
            </button>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('sos');
              }}
              className="px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-white font-bold text-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer shadow-md min-h-[44px] active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>SOS Emergência</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK DAILY SUMMARY CARDS GRID (1 col smartphone, 2 cols tablet portrait, 4 cols tablet landscape) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CARD HIDRATAÇÃO */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider block">
                  Hidratação
                </span>
                <span className="text-lg font-black text-[var(--app-text)] font-mono">
                  {todayHydrationTotalMl} <span className="text-xs font-semibold opacity-50">/ {currentTargetMl} ml</span>
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 font-mono">
              {todayHydrationPercent}%
            </span>
          </div>

          <div className="w-full bg-sky-500/10 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, todayHydrationPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                handleQuickAddGlass(250);
              }}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 font-semibold text-xs flex items-center gap-1 transition border border-sky-500/15 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+250 ml</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('care');
              }}
              className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. CARD MEDICAÇÃO */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider block">
                  Medicação
                </span>
                <span className="text-lg font-black text-[var(--app-text)] font-mono">
                  {takenMedsCount} / {todayMedicationSchedule.length}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                pendingMeds.length === 0
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}
            >
              {pendingMeds.length === 0 ? 'Em dia ✓' : `${pendingMeds.length} pendente(s)`}
            </span>
          </div>

          <div className="text-xs text-[var(--app-text-muted)]">
            {pendingMeds.length > 0 ? (
              <p className="truncate">
                Próxima: <strong className="text-[var(--app-text)]">{pendingMeds[0].medication.name}</strong> ({pendingMeds[0].scheduledTime})
              </p>
            ) : (
              <p className="opacity-60 italic">
                {todayMedicationSchedule.length > 0
                  ? 'Todas as tomas concluídas hoje.'
                  : 'Sem medicamentos agendados.'}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('care');
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold text-xs flex items-center gap-1 transition border border-rose-500/15 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Gerir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('care');
              }}
              className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver plano</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. CARD ROTINAS E CUIDADOS */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider block">
                  Autocuidado
                </span>
                <span className="text-lg font-black text-[var(--app-text)] font-mono">
                  {completedRoutinesCount} / {todayRoutinesStatus.length}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-mono">
              {todayRoutinesStatus.length > 0
                ? `${Math.round((completedRoutinesCount / todayRoutinesStatus.length) * 100)}%`
                : '100%'}
            </span>
          </div>

          <div className="text-xs text-[var(--app-text-muted)]">
            {todayRoutinesStatus.length > 0 ? (
              <p className="truncate">
                {todayRoutinesStatus.find((r) => !r.isCompleted)?.routine.title || 'Rotinas diárias concluídas!'}
              </p>
            ) : (
              <p className="opacity-60 italic">Sem rotinas configuradas.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('care');
              }}
              className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Abrir rotinas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. CARD PRÓXIMA CONSULTA / AGENDA */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-[var(--app-text-muted)] uppercase tracking-wider block">
                  Próxima Consulta
                </span>
                <span className="text-sm font-bold text-[var(--app-text)] block truncate">
                  {nextAppointment ? nextAppointment.title : 'Sem consultas'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-[var(--app-text-muted)]">
            {nextAppointment ? (
              <p className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-semibold truncate">
                {nextAppointment.date} às {nextAppointment.time}
              </p>
            ) : (
              <p className="opacity-60 italic">Nenhum exame agendado.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('calendar');
              }}
              className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Ver agenda</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ADAPTIVE TABLET 2-COLUMN WORKSPACE (Single column on smartphone, balanced 2-column on tablets) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
        {/* COLUNA ESQUERDA: RESUMO CLÍNICO, PERFIL, SINTOMAS E SOS (md:col-span-5) */}
        <div className="md:col-span-5 space-y-5">
          {/* Card Resumo Clínico do Paciente */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-700" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">
                  Ficha Clínica de Referência
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  onNavigate('profile');
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-0.5 cursor-pointer"
              >
                <span>Ficha</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--app-border)]">
                <span className="text-[var(--app-text-muted)]">Diagnóstico:</span>
                <span className="font-bold text-[var(--app-text)] font-mono bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-md">
                  {patient.sickleCellType}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--app-border)]">
                <span className="text-[var(--app-text-muted)]">Faixa Etária:</span>
                <span className="font-bold text-[var(--app-text)]">
                  {patient.ageGroup} ({patient.age} anos)
                </span>
              </div>

              {patient.caregiver && (
                <div className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-300">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-rose-600" />
                      {patient.caregiver.name}
                    </span>
                    <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                      {patient.caregiver.relationship}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--app-text-muted)] font-mono">
                    {patient.caregiver.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card Sintomas Recentes & Alertas */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-700" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">
                  Diário de Sintomas e Dor
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  onNavigate('care');
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Novo</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentSymptoms.length === 0 ? (
              <div className="p-5 text-center rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                <Smile className="w-6 h-6 mx-auto opacity-80" />
                <p className="font-bold">Sem episódios de dor registados recentemente.</p>
                <p className="text-[11px] opacity-75">
                  Mantenha a hidratação e agasalho constantes.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentSymptoms.slice(0, 3).map((symp) => (
                  <div
                    key={symp.id}
                    className="p-3 rounded-2xl border border-[var(--app-border)] bg-transparent flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          symp.painScore >= 6
                            ? 'bg-rose-500/15 text-rose-600 font-mono'
                            : 'bg-amber-500/15 text-amber-600 font-mono'
                        }`}
                      >
                        {symp.painScore}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-[var(--app-text)] block truncate">{symp.symptomType}</span>
                        <span className="text-[10px] text-[var(--app-text-muted)] font-mono truncate block">
                          {symp.date} · {symp.locations[0]}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-[var(--app-text-muted)] font-mono shrink-0">{symp.duration}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick SOS Card for Tablet and Mobile */}
          <div className="bg-gradient-to-br from-rose-900 to-rose-950 text-white rounded-3xl p-5 border border-rose-800 shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-200">
                  Apoio de Emergência Angola
                </h4>
                <p className="text-xs text-rose-100">
                  INEMA 112 · CISP 111 · Protocolo de Triagem
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('sos');
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer active:scale-95 shadow-xs min-h-[44px]"
            >
              <Phone className="w-4 h-4" />
              <span>Abrir Central SOS</span>
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: HIDRATAÇÃO, MEDICAÇÃO, ROTINAS E AQUA QUEST (md:col-span-7) */}
        <div className="md:col-span-7 space-y-5">
          {/* Card Tomas de Medicação do Dia */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-rose-700" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">
                  Tomas de Medicação para Hoje ({todayMedicationSchedule.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  onNavigate('care');
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Plano completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayMedicationSchedule.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-dashed border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
                Não existem medicamentos programados para hoje.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayMedicationSchedule.map((item, i) => {
                  const isTaken = item.status === 'taken';

                  return (
                    <div
                      key={`${item.medication.id}-${item.scheduledTime}-${i}`}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                        isTaken ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-transparent border-[var(--app-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono font-bold text-[var(--app-text)] bg-[var(--app-bg)] px-2.5 py-1 rounded-xl border border-[var(--app-border)] shrink-0">
                          {item.scheduledTime}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[var(--app-text)] block truncate">
                            {item.medication.name}
                          </span>
                          <span className="text-[10px] text-[var(--app-text-muted)] block truncate">
                            {item.medication.dosage} {item.medication.unit} {item.medication.notes ? `· ${item.medication.notes}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isTaken ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                            Tomado ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              playEnterSound();
                              logMedicationDose(item.medication.id, item.scheduledTime, todayDateStr, 'taken');
                              showToast(`Toma de ${item.medication.name} registada com sucesso!`);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer min-h-[36px]"
                          >
                            Tomar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card Rotinas Diárias de Autocuidado */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-[var(--app-text)]">
                  Rotinas Diárias de Autocuidado
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  onNavigate('care');
                }}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Todas</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayRoutinesStatus.slice(0, 4).map(({ routine, isCompleted }) => (
                <div
                  key={routine.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[var(--app-border)] bg-transparent text-xs hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (isCompleted) playExitSound(); else playEnterSound();
                        toggleRoutineCompletion(routine.id, todayDateStr);
                        showToast(isCompleted ? 'Rotina desmarcada.' : 'Rotina cumprida com sucesso!');
                      }}
                      className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold transition cursor-pointer shrink-0 ${
                        isCompleted ? 'bg-emerald-600 text-white' : 'border border-[var(--app-border)] text-transparent hover:border-emerald-500'
                      }`}
                    >
                      {isCompleted ? '✓' : ''}
                    </button>
                    <span className={`truncate ${isCompleted ? 'line-through opacity-50' : 'text-[var(--app-text)] font-semibold'}`}>
                      {routine.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--app-text-muted)] font-mono shrink-0">{routine.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banner Imersivo Aqua Quest no Dashboard */}
          <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-sky-900 to-blue-950 text-white border border-sky-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/30">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Aqua Quest: Jogo de Hidratação</h4>
                <p className="text-xs text-sky-200 mt-0.5">
                  Treine o hábito de beber água apanhando bolhas limpas!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('game');
              }}
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-center shrink-0 active:scale-95 min-h-[44px] flex items-center gap-1.5"
            >
              <span>Jogar Agora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
