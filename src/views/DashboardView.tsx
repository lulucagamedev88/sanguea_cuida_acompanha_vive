/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Droplets,
  Pill,
  CalendarDays,
  ArrowRight,
  Plus,
  ListChecks,
  ChevronRight,
  CheckCircle2,
  HeartPulse,
  Stethoscope,
  Smile,
  Gamepad2,
  User,
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
    await addHydration(amount, undefined, undefined, 'Copo de água (Início)');
    showToast(`Adicionado +${amount} ml de água com sucesso!`);
  };

  const currentTargetMl = healthRecord?.hydrationConfig.dailyTargetMl || 2000;
  const nextAppointment = upcomingAppointments[0];
  const pendingMeds = todayMedicationSchedule.filter((m) => m.status === 'pending');
  const takenMedsCount = todayMedicationSchedule.filter((m) => m.status === 'taken').length;
  const completedRoutinesCount = todayRoutinesStatus.filter((r) => r.isCompleted).length;
  const formattedAge = `${patient.age} ${patient.age === 1 ? 'ano' : 'anos'}`;
  const hemoglobinGenotype = (() => {
    const raw = patient.sickleCellType?.trim();
    if (!raw || raw === 'Não sei / Ainda não confirmado') {
      return 'Não informado';
    }
    if (raw === 'Outro tipo confirmado') {
      return patient.customSickleCellType?.trim() || 'Não informado';
    }
    return raw;
  })();

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
              Modo Demonstração Ativo — Acompanhamento de {patient.name} ({patient.sickleCellType}).
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

      {/* User Identification Box — Exclusively Name, Age & Blood Group */}
      <button
        type="button"
        onClick={() => {
          playEnterSound();
          onNavigate('profile');
        }}
        className="w-full text-left bg-[var(--app-accent)] text-[var(--app-accent-foreground)] rounded-3xl p-4 sm:p-5 shadow-md relative overflow-hidden border border-white/15 transition-all duration-200 hover:brightness-105 active:scale-[0.995] cursor-pointer"
        title="Abrir perfil"
      >
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <AvatarGraphic
            avatarId={patient.avatarId}
            photoUrl={patient.photoDataUrl}
            alt={patient.name}
            size="lg"
            className="shadow-lg border-2 border-white/30 shrink-0"
          />

          <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-white/75">
                Nome
              </span>
              <span className="block text-base sm:text-lg font-extrabold tracking-tight text-white truncate">
                {patient.name}
              </span>
            </div>

            <div className="flex items-center gap-6 sm:contents">
              <div>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-white/75">
                  Idade
                </span>
                <span className="block text-sm sm:text-base font-bold text-white">
                  {formattedAge}
                </span>
              </div>

              <div>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-white/75">
                  Genótipo Hb
                </span>
                <span className="block text-sm sm:text-base font-bold text-white font-mono">
                  {hemoglobinGenotype}
                </span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-white/75 shrink-0" />
        </div>
      </button>

      {/* QUICK DAILY SUMMARY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. CARD HIDRATAÇÃO */}
        <div className="bg-[var(--app-surface)] rounded-2xl p-5 border border-[var(--app-border)] shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold shrink-0">
                <Droplets className="w-[18px] h-[18px]" />
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
        <div className="bg-[var(--app-surface)] rounded-2xl p-5 border border-[var(--app-border)] shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold shrink-0">
                <Pill className="w-[18px] h-[18px]" />
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
        <div className="bg-[var(--app-surface)] rounded-2xl p-5 border border-[var(--app-border)] shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                <ListChecks className="w-[18px] h-[18px]" />
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
        <div className="bg-[var(--app-surface)] rounded-2xl p-5 border border-[var(--app-border)] shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold shrink-0">
                <CalendarDays className="w-[18px] h-[18px]" />
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

      {/* ADAPTIVE TABLET 2-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
        {/* COLUNA ESQUERDA: RESUMO CLÍNICO E SINTOMAS */}
        <div className="md:col-span-5 space-y-5">
          {/* Card Resumo Clínico do Paciente */}
          <div className="bg-[var(--app-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
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
                <span className="font-bold font-mono bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded-md">
                  {patient.sickleCellType}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--app-border)]">
                <span className="text-[var(--app-text-muted)]">Faixa Etária:</span>
                <span className="font-bold text-[var(--app-text)]">
                  {patient.ageGroup} ({formattedAge})
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

          {/* Card Sintomas Recentes */}
          <div className="bg-[var(--app-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
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
        </div>

        {/* COLUNA DIREITA: MEDICAÇÃO, ROTINAS E MOSSANGUE */}
        <div className="md:col-span-7 space-y-5">
          {/* Card Tomas de Medicação do Dia */}
          <div className="bg-[var(--app-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
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
          <div className="bg-[var(--app-surface)] rounded-2xl p-5 sm:p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-600" />
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

          {/* Banner Mossangue — Área de Entretenimento */}
          <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-emerald-900 to-teal-950 text-white border border-emerald-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/25">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Mossangue — O Jogo</h4>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  O seu amigo diário está a chegar. Prepare-se para descobrir o mundo de Mossangue!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onNavigate('game');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-center shrink-0 active:scale-95 min-h-[44px] flex items-center gap-1.5"
            >
              <span>Entrar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
