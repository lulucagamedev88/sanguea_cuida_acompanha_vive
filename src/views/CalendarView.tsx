/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  FileText,
  Tag,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Pill,
  Sparkles,
  HeartPulse,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { useProfile } from '../context/ProfileContext';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';
import { AppointmentCategory, AppointmentEvent, AppointmentStatus } from '../types/health';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarView: React.FC = () => {
  const { isDemoActive } = useProfile();
  const {
    healthRecord,
    todayDateStr,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useHealth();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayDateStr);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Add / Edit Appointment Modal State
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppointmentEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Appointment Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AppointmentCategory>('consultation');
  const [date, setDate] = useState(selectedDateStr);
  const [time, setTime] = useState('10:00');
  const [facility, setFacility] = useState('Hospital Pediátrico David Bernardino (HPDB)');
  const [professional, setProfessional] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [notes, setNotes] = useState('');

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Helper date formatter: YYYY-MM-DD
  const formatDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar Navigation
  const handlePrev = () => {
    playEnterSound();
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'monthly') {
        d.setMonth(d.getMonth() - 1);
      } else if (viewMode === 'weekly') {
        d.setDate(d.getDate() - 7);
      } else {
        d.setDate(d.getDate() - 1);
      }
      return d;
    });
  };

  const handleNext = () => {
    playEnterSound();
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (viewMode === 'monthly') {
        d.setMonth(d.getMonth() + 1);
      } else if (viewMode === 'weekly') {
        d.setDate(d.getDate() + 7);
      } else {
        d.setDate(d.getDate() + 1);
      }
      return d;
    });
  };

  const handleGoToday = () => {
    playEnterSound();
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(formatDateKey(now));
  };

  // Aggregated Events for a specific date
  const getEventsForDate = (dateStr: string) => {
    if (!healthRecord) return [];

    const items: Array<{
      id: string;
      title: string;
      time: string;
      type: 'appointment' | 'medication' | 'hydration' | 'routine' | 'symptom';
      categoryLabel: string;
      badgeColor: string;
      isCompleted: boolean;
      details?: string;
      rawObj?: any;
    }> = [];

    // 1. Appointments on this date
    healthRecord.appointments.forEach((a) => {
      if (a.date === dateStr) {
        items.push({
          id: `app-${a.id}`,
          title: a.title,
          time: a.time,
          type: 'appointment',
          categoryLabel:
            a.category === 'consultation'
              ? 'Consulta Médica'
              : a.category === 'exam'
              ? 'Exame Clínico'
              : a.category === 'transfusion'
              ? 'Transfusão'
              : 'Compromisso',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
          isCompleted: a.status === 'completed',
          details: `${a.facility}${a.professional ? ` · ${a.professional}` : ''}`,
          rawObj: a,
        });
      }
    });

    // 2. Medication scheduled on this date
    healthRecord.medications
      .filter((m) => m.status === 'active')
      .forEach((med) => {
        med.schedules.forEach((time) => {
          const log = healthRecord.medicationLogs.find(
            (l) => l.medicationId === med.id && l.date === dateStr && l.scheduledTime === time
          );
          const isTaken = log?.status === 'taken';
          items.push({
            id: `med-${med.id}-${time}`,
            title: `${med.name} (${med.dosage} ${med.unit})`,
            time,
            type: 'medication',
            categoryLabel: 'Medicação',
            badgeColor: isTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700',
            isCompleted: isTaken,
            details: log?.notes || (isTaken ? 'Toma confirmada' : 'Ainda não registado'),
          });
        });
      });

    // 3. Hydration entries on this date
    const dayHydrations = healthRecord.hydrationEntries.filter((h) => h.date === dateStr);
    if (dayHydrations.length > 0) {
      const totalDayMl = dayHydrations.reduce((acc, h) => acc + h.amountMl, 0);
      items.push({
        id: `hydro-summary-${dateStr}`,
        title: `Hidratação: ${totalDayMl} ml consumidos (${dayHydrations.length} copos)`,
        time: dayHydrations[0].time,
        type: 'hydration',
        categoryLabel: 'Hidratação',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        isCompleted: true,
        details: `${dayHydrations.map((h) => `${h.time} (+${h.amountMl}ml)`).join(', ')}`,
      });
    }

    // 4. Routines on this date
    healthRecord.routines
      .filter((r) => r.isActive)
      .forEach((r) => {
        const comp = healthRecord.routineCompletions.find(
          (c) => c.routineId === r.id && c.date === dateStr
        );
        items.push({
          id: `rout-${r.id}`,
          title: r.title,
          time: r.time,
          type: 'routine',
          categoryLabel: 'Cuidado Pessoal',
          badgeColor: comp ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800',
          isCompleted: !!comp,
          details: r.description || (comp ? 'Concluído com sucesso' : 'Pendente de realização'),
        });
      });

    // 5. Symptoms on this date
    healthRecord.symptoms.forEach((s) => {
      if (s.date === dateStr) {
        items.push({
          id: `symp-${s.id}`,
          title: `Episódio de dor: ${s.symptomType} (${s.painScore}/10)`,
          time: s.time,
          type: 'symptom',
          categoryLabel: 'Sintoma / Dor',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
          isCompleted: true,
          details: `Local: ${s.locations.join(', ')} · ${s.duration}`,
        });
      }
    });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    const list = getEventsForDate(selectedDateStr);
    if (selectedFilter === 'all') return list;
    return list.filter((e) => e.type === selectedFilter);
  }, [selectedDateStr, selectedFilter, healthRecord]);

  // Monthly Grid Generation
  const monthMatrix = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      eventsCount: number;
      hasAppointments: boolean;
    }> = [];

    // Fill days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dStr = formatDateKey(d);
      const evs = getEventsForDate(dStr);
      days.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isToday: dStr === todayDateStr,
        eventsCount: evs.length,
        hasAppointments: evs.some((e) => e.type === 'appointment'),
      });
    }

    return {
      firstDay,
      days,
      title: `${MONTH_NAMES[month]} ${year}`,
    };
  }, [currentDate, healthRecord, todayDateStr]);

  // Weekly Grid Generation
  const weekDays = useMemo(() => {
    const base = new Date(currentDate);
    const dayOfWeek = base.getDay();
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dStr = formatDateKey(d);
      const evs = getEventsForDate(dStr);
      days.push({
        dateObj: d,
        dateStr: dStr,
        dayName: WEEKDAY_NAMES[i],
        dayNumber: d.getDate(),
        isToday: dStr === todayDateStr,
        events: evs,
      });
    }
    return days;
  }, [currentDate, healthRecord, todayDateStr]);

  const openAddAppModal = () => {
    setEditingApp(null);
    setTitle('');
    setCategory('consultation');
    setDate(selectedDateStr);
    setTime('10:00');
    setFacility('Hospital Pediátrico David Bernardino (HPDB)');
    setProfessional('Dr.ª Luísa Panzo');
    setDescription('');
    setStatus('scheduled');
    setNotes('');
    setIsAppModalOpen(true);
  };

  const openEditAppModal = (app: AppointmentEvent) => {
    setEditingApp(app);
    setTitle(app.title);
    setCategory(app.category);
    setDate(app.date);
    setTime(app.time);
    setFacility(app.facility);
    setProfessional(app.professional || '');
    setDescription(app.description || '');
    setStatus(app.status);
    setNotes(app.notes || '');
    setIsAppModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    if (editingApp) {
      await updateAppointment(editingApp.id, {
        title: title.trim(),
        category,
        date,
        time,
        facility: facility.trim(),
        professional: professional.trim() || undefined,
        description: description.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
      showFeedback(`Compromisso «${title}» actualizado.`);
    } else {
      await addAppointment({
        title: title.trim(),
        category,
        date,
        time,
        facility: facility.trim(),
        professional: professional.trim() || undefined,
        description: description.trim() || undefined,
        status,
        notes: notes.trim() || undefined,
      });
      showFeedback(`Compromisso «${title}» agendado no calendário.`);
    }

    setIsAppModalOpen(false);
  };

  const handleDeleteApp = async (id: string) => {
    await deleteAppointment(id);
    setDeleteConfirmId(null);
    showFeedback('Compromisso removido do calendário.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Demo Notice */}
      {isDemoActive && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold">
              Modo Demonstração — Agenda clínica com exemplos no Hospital Pediátrico David Bernardino (HPDB).
            </span>
          </div>
        </div>
      )}

      {/* Calendar Header Bar & Controls */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--app-text)] capitalize">
              {monthMatrix.title}
            </h2>
            <p className="text-xs text-stone-500">
              Visualização activa: {viewMode === 'monthly' ? 'Mensal' : viewMode === 'weekly' ? 'Semanal' : 'Diária'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-stone-600 hover:text-slate-900 hover:bg-white transition"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-white rounded-lg transition"
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-stone-600 hover:text-slate-900 hover:bg-white transition"
              title="Seguinte"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Switcher (Diário, Semanal, Mensal) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'daily'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Diário
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'weekly'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'monthly'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Mensal
            </button>
          </div>

          {/* Add Appointment Button */}
          <button
            type="button"
            onClick={() => {
              playEnterSound();
              openAddAppModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Consulta</span>
          </button>
        </div>
      </div>

      {/* 1. MONTHLY VIEW */}
      {viewMode === 'monthly' && (
        <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-stone-400 pb-2 border-b border-stone-100">
            {WEEKDAY_NAMES.map((name) => (
              <span key={name} className="py-1">
                {name}
              </span>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots before first day of month */}
            {Array.from({ length: monthMatrix.firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-14 sm:min-h-20 rounded-2xl bg-stone-50/40 p-1 opacity-40" />
            ))}

            {/* Days */}
            {monthMatrix.days.map((day) => {
              const isSelected = day.dateStr === selectedDateStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setSelectedDateStr(day.dateStr);
                  }}
                  className={`min-h-14 sm:min-h-20 p-1.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                      : day.isToday
                      ? 'border-rose-300 bg-rose-50/30 font-bold'
                      : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-bg)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                        day.isToday
                          ? 'bg-rose-700 text-white'
                          : isSelected
                          ? 'text-rose-900 font-extrabold'
                          : 'text-[var(--app-text)]'
                      }`}
                    >
                      {day.dayNumber}
                    </span>

                    {day.hasAppointments && (
                      <span className="w-2 h-2 rounded-full bg-rose-600" title="Possui consulta ou exame" />
                    )}
                  </div>

                  {day.eventsCount > 0 ? (
                    <div className="w-full text-right">
                      <span className="text-[9px] font-semibold text-stone-500 font-mono">
                        {day.eventsCount} item{day.eventsCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. WEEKLY VIEW */}
      {viewMode === 'weekly' && (
        <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const isSelected = day.dateStr === selectedDateStr;

              return (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setSelectedDateStr(day.dateStr);
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between min-h-28 ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                      : day.isToday
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-bg)]'
                  }`}
                >
                  <div>
                    <span className="text-[11px] font-semibold text-stone-400 uppercase block">
                      {day.dayName}
                    </span>
                    <span className="text-lg font-black text-[var(--app-text)] font-mono">
                      {day.dayNumber}
                    </span>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-stone-100">
                    <span className="text-[10px] font-bold text-slate-700 block">
                      {day.events.length} acontecimento{day.events.length !== 1 ? 's' : ''}
                    </span>
                    {day.events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[9px] truncate px-1.5 py-0.5 rounded bg-stone-100 text-slate-700"
                      >
                        {ev.time} {ev.title}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. DAILY VIEW / DETAIL OF SELECTED DATE */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--app-text)]">
                Acontecimentos de {selectedDateStr}
              </h3>
              {selectedDateStr === todayDateStr && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                  Hoje
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Medicamentos, hidratação, rotinas, consultas médicas e registos de sintomas
            </p>
          </div>

          {/* Filter by Category */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'appointment', 'medication', 'hydration', 'routine', 'symptom'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  playEnterSound();
                  setSelectedFilter(f);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedFilter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-[var(--app-bg)] text-[var(--app-muted)] hover:text-[var(--app-text)]'
                }`}
              >
                {f === 'all'
                  ? 'Todos'
                  : f === 'appointment'
                  ? 'Consultas'
                  : f === 'medication'
                  ? 'Medicação'
                  : f === 'hydration'
                  ? 'Hidratação'
                  : f === 'routine'
                  ? 'Rotinas'
                  : 'Sintomas'}
              </button>
            ))}
          </div>
        </div>

        {selectedDateEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-2">
            <CalendarIcon className="w-7 h-7 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Sem registos para esta data.</p>
            <p className="text-[11px] text-stone-500">
              Clique em «Agendar Consulta» ou registe cuidados para vê-los organizados no dia.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateEvents.map((item) => {
              const isApp = item.type === 'appointment';
              const rawApp = isApp ? (item.rawObj as AppointmentEvent) : null;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.isCompleted
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : isApp
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-[var(--app-border)] bg-[var(--app-bg)] hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 text-center shrink-0">
                      <span className="text-xs font-black text-[var(--app-text)] font-mono block">
                        {item.time}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          item.isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {item.isCompleted ? 'Realizado' : 'Previsto'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--app-text)]">
                          {item.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.categoryLabel}
                        </span>
                      </div>

                      {item.details && (
                        <p className="text-xs text-stone-600">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for appointments */}
                  {rawApp && (
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          playEnterSound();
                          openEditAppModal(rawApp);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-[var(--app-text)] hover:bg-[var(--app-bg)] transition"
                        title="Editar consulta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playEnterSound();
                          setDeleteConfirmId(rawApp.id);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="Eliminar consulta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT APPOINTMENT */}
      {isAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveAppointment}
            className="w-full max-w-lg rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 transition-colors duration-300"
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="text-sm font-bold text-slate-900">
                {editingApp ? 'Editar Consulta / Compromisso' : 'Agendar Consulta ou Exame'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsAppModalOpen(false);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Título do Compromisso: *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Consulta Trimestral de Hematologia, Ecodoppler Transcraniano (DTC)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:bg-white"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Categoria:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AppointmentCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                >
                  <option value="consultation">Consulta Médica</option>
                  <option value="exam">Exame (Imagiologia / Lab)</option>
                  <option value="transfusion">Transfusão / Hospital de Dia</option>
                  <option value="care">Apoio / Fisioterapia</option>
                  <option value="routine">Rotina</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Estado:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:bg-white"
                >
                  <option value="scheduled">Agendado</option>
                  <option value="completed">Realizado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Data: *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:bg-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Hora: *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:bg-white font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Unidade Hospitalar / Local em Angola: *
              </label>
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="Ex: Hospital Pediátrico David Bernardino (HPDB), Luanda"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Médico / Especialista (opcional):
              </label>
              <input
                type="text"
                value={professional}
                onChange={(e) => setProfessional(e.target.value)}
                placeholder="Ex: Dr.ª Luísa Panzo (Hematologista)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Instruções prévias ou notas (opcional):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Levar caderno de vacinas e resultados do hemograma anterior; jejum de 4h."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:bg-white h-16 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsAppModalOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
              >
                Guardar Compromisso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: DELETE APPOINTMENT */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95 transition-colors duration-300">
            <h4 className="text-sm font-bold text-slate-900">Eliminar este compromisso?</h4>
            <p className="text-xs text-stone-600">
              O compromisso agendado será removido do calendário e do histórico.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteApp(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
