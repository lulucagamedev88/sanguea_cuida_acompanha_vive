/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Clock,
  RotateCcw,
  Info,
  CheckCircle2,
  Edit2,
  Trash2,
  Sliders,
  X,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { DailyHydrationEntry } from '../../types/health';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

export const HydrationSection: React.FC = () => {
  const {
    healthRecord,
    todayHydrationEntries,
    todayHydrationTotalMl,
    todayHydrationPercent,
    addHydration,
    updateHydrationConfig,
    updateHydrationEntry,
    deleteHydrationEntry,
    resetTodayHydration,
  } = useHealth();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  // Quick feedback toast
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Manual entry modal / state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualAmount, setManualAmount] = useState<number>(250);
  const [manualTime, setManualTime] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  // Target config modal
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const currentTarget = healthRecord?.hydrationConfig.dailyTargetMl || 2000;
  const [tempTarget, setTempTarget] = useState<number>(currentTarget);
  const [tempNotes, setTempNotes] = useState<string>(healthRecord?.hydrationConfig.customNotes || '');

  // Edit entry modal
  const [editingEntry, setEditingEntry] = useState<DailyHydrationEntry | null>(null);
  const [editAmount, setEditAmount] = useState<number>(250);
  const [editTime, setEditTime] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleQuickAdd = async (amount: number, label: string) => {
    await addHydration(amount, undefined, undefined, label);
    showFeedback(`Adicionados +${amount} ml (${label}) com sucesso!`);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAmount <= 0) return;
    await addHydration(manualAmount, manualTime || undefined, undefined, manualNotes || undefined);
    setIsManualModalOpen(false);
    setManualNotes('');
    setManualTime('');
    showFeedback(`Registo manual de ${manualAmount} ml adicionado.`);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHydrationConfig(tempTarget, undefined, tempNotes);
    setIsConfigModalOpen(false);
    showFeedback(`Meta individual actualizada para ${tempTarget} ml/dia.`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    await updateHydrationEntry(editingEntry.id, editAmount, editTime, editNotes);
    setEditingEntry(null);
    showFeedback('Registo de hidratação corrigido com sucesso.');
  };

  const handleDelete = async (id: string) => {
    await deleteHydrationEntry(id);
    setDeleteConfirmId(null);
    showFeedback('Registo eliminado.');
  };

  // Last drink calculation
  const lastEntry = todayHydrationEntries[0];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-500 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Hydration Progress Card */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[var(--app-text)]">
                  Hidratação Diária
                </h3>
              </div>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Meta: <span className="font-bold text-[var(--app-text)] font-mono">{currentTarget} ml</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setTempTarget(currentTarget);
                setTempNotes(healthRecord?.hydrationConfig.customNotes || '');
                setIsConfigModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 hover:opacity-80 text-xs font-semibold text-[var(--app-text)] transition"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              <span>Ajustar Meta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playEnterSound();
                const now = new Date();
                setManualTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                setManualAmount(250);
                setIsManualModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition shadow-xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registo Manual</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Numerical KPIs */}
        <div className="p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-border)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-3xl sm:text-4xl font-black text-[var(--app-text)] font-mono tracking-tight">
                {todayHydrationTotalMl}
              </span>
              <span className="text-sm font-semibold text-[var(--app-text-muted)] ml-1.5">
                / {currentTarget} ml hoje
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-500 border border-sky-500/10">
                {todayHydrationPercent}% alcançado
              </span>
              {lastEntry && (
                <span className="text-[11px] text-[var(--app-text-muted)] flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 opacity-60" />
                  {lastEntry.time} (+{lastEntry.amountMl}ml)
                </span>
              )}
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full bg-sky-500/10 rounded-full h-3.5 overflow-hidden p-0.5">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${todayHydrationPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
            {todayHydrationPercent >= 100
              ? 'Meta atingida! Continue a beber água de forma natural ao longo do dia.'
              : `Faltam ${Math.max(0, currentTarget - todayHydrationTotalMl)} ml para cumprir a meta do dia.`}
          </p>
        </div>

        {/* Quick Add Volume Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[var(--app-text)] block">
            Adicionar rapidamente:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { amount: 150, label: 'Copo pequeno', desc: '150 ml' },
              { amount: 250, label: 'Copo padrão', desc: '250 ml' },
              { amount: 330, label: 'Garrafa pequena', desc: '330 ml' },
              { amount: 500, label: 'Garrafa média', desc: '500 ml' },
            ].map((opt) => (
              <button
                key={opt.amount}
                type="button"
                onClick={() => {
                  playEnterSound();
                  handleQuickAdd(opt.amount, opt.label);
                }}
                className="p-3 rounded-2xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 hover:opacity-80 active:scale-95 transition text-left flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[var(--app-text)] block">+{opt.amount} ml</span>
                  <span className="text-[10px] text-[var(--app-text-muted)]">{opt.label}</span>
                </div>
                <Plus className="w-4 h-4 text-sky-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Ethical Medical Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-[11px]">Orientações sobre Hidratação:</p>
            <p className="text-[11px] leading-relaxed opacity-90">
              A hidratação constante mantém o sangue menos viscoso. A meta reflecte a orientação personalizada definida com o seu médico, não constituindo prescrição universal.
            </p>
          </div>
        </div>
      </div>

      {/* Today's Hydration Entries List */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--app-border)] gap-2">
          <div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">
              Registos de Hoje ({todayHydrationEntries.length})
            </h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Reiniciado automaticamente a cada novo dia
            </p>
          </div>

          {todayHydrationEntries.length > 0 && (
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setIsResetConfirmOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-rose-500 transition self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">Reiniciar Dia</span>
            </button>
          )}
        </div>

        {todayHydrationEntries.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-[var(--app-border)] space-y-2">
            <Droplets className="w-7 h-7 text-sky-500 mx-auto opacity-35" />
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">Ainda não registou água hoje.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayHydrationEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-2xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 hover:opacity-80 flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs shrink-0">
                    💧
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--app-text)]">
                        +{entry.amountMl} ml
                      </span>
                      <span className="text-[10px] text-[var(--app-text-muted)] font-mono">
                        {entry.time}
                      </span>
                    </div>
                    {entry.notes && (
                      <span className="text-[11px] text-[var(--app-text-muted)] block">
                        {entry.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setEditingEntry(entry);
                      setEditAmount(entry.amountMl);
                      setEditTime(entry.time);
                      setEditNotes(entry.notes || '');
                    }}
                    className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setDeleteConfirmId(entry.id);
                    }}
                    className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: MANUAL ENTRY */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleManualSubmit}
            className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h4 className="text-sm font-bold text-[var(--app-text)]">Consumo de Água</h4>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsManualModalOpen(false);
                }}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Quantidade (ml):
              </label>
              <input
                type="number"
                min="10"
                max="3000"
                step="10"
                value={manualAmount}
                onChange={(e) => setManualAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono font-bold"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Hora:
              </label>
              <input
                type="time"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Anotação (opcional):
              </label>
              <input
                type="text"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Ex: Garrafa de desporto"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsManualModalOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CONFIG TARGET */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveConfig}
            className="w-full max-w-md rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h4 className="text-sm font-bold text-[var(--app-text)]">Ajustar Meta Individual</h4>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsConfigModalOpen(false);
                }}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Meta Diária (ml):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="500"
                  max="6000"
                  step="50"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold font-mono rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
                <span className="text-xs font-bold text-[var(--app-text-muted)]">ml / dia</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Anotação pessoal:
              </label>
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Ex: Orientação dada na consulta..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500 h-20 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsConfigModalOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => playEnterSound()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Guardar Meta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT ENTRY */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h4 className="text-sm font-bold text-[var(--app-text)]">Corrigir Registo</h4>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setEditingEntry(null);
                }}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Quantidade (ml):
              </label>
              <input
                type="number"
                min="10"
                max="3000"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Hora:
              </label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Anotação:
              </label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setEditingEntry(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => playEnterSound()}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Guardar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--app-text)]">Eliminar registo?</h4>
            </div>

            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              Esta acção não pode ser desfeita e removerá o registo do seu histórico local.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Manter
              </button>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  handleDelete(deleteConfirmId);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Sim, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET TODAY CONFIRMATION */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-500">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--app-text)]">Reiniciar hoje?</h4>
            </div>

            <p className="text-xs text-[var(--app-text-muted)] leading-relaxed">
              Esta acção limpa apenas os registos de hoje. O histórico de dias anteriores continuará preservado.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsResetConfirmOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  playEnterSound();
                  await resetTodayHydration();
                  setIsResetConfirmOpen(false);
                  showFeedback('Acompanhamento de hoje reiniciado.');
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Sim, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
