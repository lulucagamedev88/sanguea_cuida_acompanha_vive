/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  X,
  Heart,
  Droplets,
  Pill,
  Moon,
  Sun,
  Activity,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { PersonalRoutine, RoutineCategory, RoutineFrequency } from '../../types/health';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

const CATEGORY_MAP: Record<RoutineCategory, { label: string; icon: any; color: string }> = {
  hydration: { label: 'Hidratação', icon: Droplets, color: 'bg-sky-500/10 text-sky-500' },
  medication: { label: 'Medicação', icon: Pill, color: 'bg-rose-500/10 text-rose-500' },
  rest: { label: 'Descanso e Repouso', icon: Moon, color: 'bg-purple-500/10 text-purple-500' },
  consultation: { label: 'Consulta / Exame', icon: Activity, color: 'bg-amber-500/10 text-amber-500' },
  care: { label: 'Cuidado Pessoal', icon: Heart, color: 'bg-emerald-500/10 text-emerald-500' },
  other: { label: 'Outra Rotina', icon: Sparkles, color: 'bg-[var(--app-accent)]/10 text-[var(--app-accent)]' },
};

export const RoutinesSection: React.FC = () => {
  const {
    healthRecord,
    todayDateStr,
    todayRoutinesStatus,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    toggleRoutineCompletion,
  } = useHealth();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<PersonalRoutine | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('15:00');
  const [category, setCategory] = useState<RoutineCategory>('care');
  const [frequency, setFrequency] = useState<RoutineFrequency>('daily');
  const [startDate, setStartDate] = useState(todayDateStr);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const openAddModal = () => {
    setEditingRoutine(null);
    setTitle('');
    setDescription('');
    setTime('15:00');
    setCategory('care');
    setFrequency('daily');
    setStartDate(todayDateStr);
    setIsModalOpen(true);
  };

  const openEditModal = (rout: PersonalRoutine) => {
    setEditingRoutine(rout);
    setTitle(rout.title);
    setDescription(rout.description || '');
    setTime(rout.time);
    setCategory(rout.category);
    setFrequency(rout.frequency);
    setStartDate(rout.startDate);
    setIsModalOpen(true);
  };

  const handleSaveRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingRoutine) {
      await updateRoutine(editingRoutine.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        time,
        category,
        frequency,
        startDate,
      });
      showFeedback(`Rotina «${title}» actualizada.`);
    } else {
      await addRoutine({
        title: title.trim(),
        description: description.trim() || undefined,
        time,
        category,
        frequency,
        startDate,
        isActive: true,
      });
      showFeedback(`Rotina «${title}» criada com sucesso.`);
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = async (rout: PersonalRoutine) => {
    await updateRoutine(rout.id, { isActive: !rout.isActive });
    showFeedback(rout.isActive ? `Rotina «${rout.title}» pausada.` : `Rotina «${rout.title}» reactivada.`);
  };

  const handleDelete = async (id: string) => {
    await deleteRoutine(id);
    setDeleteConfirmId(null);
    showFeedback('Rotina eliminada. O histórico de conclusões passadas foi preservado.');
  };

  const routines = healthRecord?.routines || [];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--app-accent)]/10 text-[var(--app-accent)] flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--app-text)]">
              Rotinas e Cuidados Diários
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
              Hábitos de descanso, agasalho e proteção sem pressões nem penalizações
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            openAddModal();
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Rotina</span>
        </button>
      </div>

      {/* TODAY'S ROUTINES CHECKLIST */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
          <div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">
              Cuidados Programados para Hoje ({todayRoutinesStatus.length})
            </h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Marque quando concluído. O descanso e o autocuidado são essenciais.
            </p>
          </div>
        </div>

        {todayRoutinesStatus.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--app-bg)] border border-dashed border-[var(--app-border)] space-y-2">
            <Sparkles className="w-7 h-7 text-[var(--app-accent)]/35 mx-auto" />
            <p className="text-xs font-semibold text-[var(--app-text)]">Nenhuma rotina activa para o dia de hoje.</p>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Adicione hábitos como «Repouso pós-almoço», «Agasalho nocturno» ou «Lanche hidratante».
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayRoutinesStatus.map(({ routine, isCompleted }) => {
              const catInfo = CATEGORY_MAP[routine.category] || CATEGORY_MAP.other;
              const IconComp = catInfo.icon;

              return (
                <div
                  key={routine.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 shadow-2xs'
                      : 'border-stone-200/80 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        toggleRoutineCompletion(routine.id, todayDateStr);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-[var(--app-border)] hover:border-[var(--app-accent)] text-transparent'
                      }`}
                      title={isCompleted ? 'Desmarcar conclusão' : 'Marcar como concluído'}
                    >
                      ✓
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isCompleted ? 'text-[var(--app-text)] line-through opacity-50' : 'text-[var(--app-text)]'
                          }`}
                        >
                          {routine.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--app-text-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[var(--app-text-muted)] opacity-70" />
                          {routine.time}
                        </span>
                      </div>

                      {routine.description && (
                        <p className="text-[11px] text-[var(--app-text-muted)]">
                          {routine.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        toggleRoutineCompletion(routine.id, todayDateStr);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          : 'bg-[var(--app-bg)] text-[var(--app-text)] border border-[var(--app-border)] hover:bg-[var(--app-surface)]'
                      }`}
                    >
                      {isCompleted ? 'Concluído ✓' : 'Concluir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ALL ROUTINES LIST */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
          <div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">
              Todas as Rotinas Cadastradas ({routines.length})
            </h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Active, pause ou ajuste as configurações de rotina
            </p>
          </div>
        </div>

        {routines.length === 0 ? (
          <p className="text-xs text-[var(--app-text-muted)] py-3 text-center">Nenhuma rotina cadastrada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {routines.map((rout) => {
              const catInfo = CATEGORY_MAP[rout.category] || CATEGORY_MAP.other;

              return (
                <div
                  key={rout.id}
                  className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                    !rout.isActive ? 'bg-[var(--app-bg)] opacity-60 border-[var(--app-border)]' : 'bg-[var(--app-surface)] border-[var(--app-border)] shadow-2xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs sm:text-sm text-[var(--app-text)]">{rout.title}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          rout.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[var(--app-bg)] text-[var(--app-text-muted)] border border-[var(--app-border)]'
                        }`}
                      >
                        {rout.isActive ? 'Activa' : 'Pausada'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                      <span className="font-mono font-semibold text-[var(--app-text)]">{rout.time}</span>
                      <span>·</span>
                      <span>
                        {rout.frequency === 'daily'
                          ? 'Todos os dias'
                          : rout.frequency === 'weekdays'
                          ? 'Dias úteis'
                          : rout.frequency === 'weekends'
                          ? 'Fins de semana'
                          : 'Semanal'}
                      </span>
                    </div>

                    {rout.description && (
                      <p className="text-[11px] text-[var(--app-text-muted)] line-clamp-2">{rout.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        handleToggleActive(rout);
                      }}
                      className="text-xs font-semibold text-[var(--app-text)] hover:opacity-70 flex items-center gap-1"
                    >
                      {rout.isActive ? (
                        <>
                          <PauseCircle className="w-3.5 h-3.5 text-[var(--app-text-muted)]" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Activar</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          playEnterSound();
                          openEditModal(rout);
                        }}
                        className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)]"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playEnterSound();
                          setDeleteConfirmId(rout.id);
                        }}
                        className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-rose-600 hover:bg-rose-500/10"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT ROUTINE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveRoutine}
            className="w-full max-w-md rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h4 className="text-sm font-bold text-[var(--app-text)]">
                {editingRoutine ? 'Editar Rotina de Cuidados' : 'Nova Rotina de Cuidados'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsModalOpen(false);
                }}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Nome da Actividade: *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Repouso pós-almoço, Verificar agasalho, Lanche hidratante"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Descrição ou recomendação:
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: 30 minutos de repouso sem esforço físico"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Horário: *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Categoria:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RoutineCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none"
                >
                  <option value="care">Cuidado Pessoal</option>
                  <option value="rest">Descanso / Repouso</option>
                  <option value="hydration">Hidratação</option>
                  <option value="medication">Medicação</option>
                  <option value="consultation">Consulta / Exame</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Frequência:
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RoutineFrequency)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none"
                >
                  <option value="daily">Todos os dias</option>
                  <option value="weekdays">Apenas dias úteis (Seg–Sex)</option>
                  <option value="weekends">Apenas fins de semana</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Data de Início:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--app-border)]">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsModalOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => playEnterSound()}
                className="px-4 py-2 rounded-xl bg-[var(--app-accent)] hover:opacity-90 text-white text-xs font-semibold"
              >
                Guardar Rotina
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-[var(--app-text)]">Eliminar esta rotina?</h4>
            <p className="text-xs text-[var(--app-text-muted)]">
              A rotina será removida do catálogo. As conclusões anteriores nos dias passados serão preservadas no histórico.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  handleDelete(deleteConfirmId);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
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
