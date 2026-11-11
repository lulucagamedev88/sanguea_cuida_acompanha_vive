/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Pill,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  X,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { Medication, MedicationDoseStatus, MedicationFrequency } from '../../types/health';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

export const MedicationSection: React.FC = () => {
  const {
    healthRecord,
    todayDateStr,
    todayMedicationSchedule,
    addMedication,
    updateMedication,
    deleteMedication,
    logMedicationDose,
  } = useHealth();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [feedback, setFeedback] = useState<string | null>(null);

  // Add / Edit Medication Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [unit, setUnit] = useState('mg (1 comp.)');
  const [schedulesText, setSchedulesText] = useState('08:30');
  const [frequency, setFrequency] = useState<MedicationFrequency>('daily');
  const [startDate, setStartDate] = useState(todayDateStr);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // Delete confirmation
  const [deleteMedId, setDeleteMedId] = useState<string | null>(null);

  // Postpone modal
  const [postponeDose, setPostponeDose] = useState<{
    medicationId: string;
    scheduledTime: string;
  } | null>(null);
  const [postponeMinutes, setPostponeMinutes] = useState<number>(30);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const openAddModal = () => {
    setEditingMed(null);
    setName('');
    setDosage('');
    setUnit('mg');
    setSchedulesText('08:30');
    setFrequency('daily');
    setStartDate(todayDateStr);
    setEndDate('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (med: Medication) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setUnit(med.unit);
    setSchedulesText(med.schedules.join(', '));
    setFrequency(med.frequency);
    setStartDate(med.startDate);
    setEndDate(med.endDate || '');
    setNotes(med.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const schedules = schedulesText
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(s));

    const finalSchedules = schedules.length > 0 ? schedules : ['08:00'];

    if (editingMed) {
      await updateMedication(editingMed.id, {
        name: name.trim(),
        dosage: dosage.trim() || '1',
        unit: unit.trim(),
        schedules: finalSchedules,
        frequency,
        startDate,
        endDate: endDate ? endDate : undefined,
        notes: notes.trim() || undefined,
      });
      showFeedback(`Medicamento ${name} actualizado.`);
    } else {
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim() || '1',
        unit: unit.trim(),
        schedules: finalSchedules,
        frequency,
        startDate,
        endDate: endDate ? endDate : undefined,
        notes: notes.trim() || undefined,
        status: 'active',
      });
      showFeedback(`Medicamento ${name} adicionado.`);
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmDose = async (medicationId: string, scheduledTime: string) => {
    await logMedicationDose(medicationId, scheduledTime, todayDateStr, 'taken', 'Confirmado');
    showFeedback('Toma registada.');
  };

  const handleSkipDose = async (medicationId: string, scheduledTime: string) => {
    await logMedicationDose(medicationId, scheduledTime, todayDateStr, 'skipped', 'Pulado');
    showFeedback('Registo de não toma anotado.');
  };

  const handleRevertDose = async (medicationId: string, scheduledTime: string) => {
    await logMedicationDose(medicationId, scheduledTime, todayDateStr, 'pending', undefined);
    showFeedback('Toma revertida para pendente.');
  };

  const handleConfirmPostpone = async () => {
    if (!postponeDose) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + postponeMinutes);
    const newTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    await logMedicationDose(
      postponeDose.medicationId,
      postponeDose.scheduledTime,
      todayDateStr,
      'postponed',
      `Adiada para ${newTime}`,
      newTime
    );
    setPostponeDose(null);
    showFeedback(`Adiado em ${postponeMinutes} min.`);
  };

  const handleToggleStatus = async (med: Medication) => {
    const nextStatus = med.status === 'active' ? 'suspended' : 'active';
    await updateMedication(med.id, { status: nextStatus });
    showFeedback(nextStatus === 'active' ? `${med.name} activo.` : `${med.name} suspenso.`);
  };

  const handleDeleteMedication = async (id: string) => {
    await deleteMedication(id);
    setDeleteMedId(null);
    showFeedback('Medicamento removido.');
  };

  const medications = healthRecord?.medications || [];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-500 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Header / Plan Control */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--app-text)]">
                Plano de Medicação
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Hoje: <span className="font-bold text-[var(--app-text)] font-mono">{todayDateStr}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playEnterSound();
              openAddModal();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold transition shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Medicamento</span>
          </button>
        </div>

        {/* Ethical Medical Notice */}
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-[var(--app-text)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Compromisso Ético e Salvaguarda:</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            A aplicação Sanguea não recomenda doses nem substitui a prescrição médica. As informações devem reflectir estritamente a orientação do seu hematologista ou pediatra.
          </p>
        </div>
      </div>

      {/* TODAY'S DOSES LIST */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
          <div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">
              Tomas de Hoje ({todayMedicationSchedule.length})
            </h4>
          </div>
        </div>

        {todayMedicationSchedule.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-[var(--app-border)] space-y-2">
            <Pill className="w-8 h-8 text-rose-500 mx-auto opacity-30" />
            <p className="text-xs font-semibold text-[var(--app-text-muted)]">Sem medicamentos programados para hoje.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayMedicationSchedule.map((item, idx) => {
              const isTaken = item.status === 'taken';
              const isSkipped = item.status === 'skipped';
              const isPostponed = item.status === 'postponed';
              const isPending = item.status === 'pending';

              return (
                <div
                  key={`${item.medication.id}-${item.scheduledTime}-${idx}`}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTaken
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : isSkipped
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : isPostponed
                      ? 'border-purple-500/30 bg-purple-500/5'
                      : 'border-[var(--app-border)] bg-black/5 dark:bg-white/5 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                        isTaken
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : isSkipped
                          ? 'bg-amber-500/10 text-amber-500'
                          : isPostponed
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {isTaken ? '✓' : isSkipped ? '—' : isPostponed ? '⏳' : <Clock className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[var(--app-text)]">
                          {item.medication.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-[var(--app-text-muted)] bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-lg border border-[var(--app-border)]">
                          {item.medication.dosage} {item.medication.unit}
                        </span>
                        <span className="text-xs font-mono font-bold text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded-lg border border-rose-500/10">
                          {item.scheduledTime}
                        </span>
                      </div>

                      {item.medication.notes && (
                        <p className="text-[11px] text-[var(--app-text-muted)] italic">
                          {item.medication.notes}
                        </p>
                      )}

                      <div className="pt-0.5">
                        {isTaken && (
                          <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Tomado {item.log?.loggedAt ? `às ${item.log.loggedAt.split('T')[1].substring(0, 5)}` : 'hoje'}
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Não tomado
                          </span>
                        )}
                        {isPostponed && (
                          <span className="text-[11px] font-semibold text-purple-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Adiado {item.log?.postponedUntil ? `para ${item.log.postponedUntil}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            playEnterSound();
                            handleConfirmDose(item.medication.id, item.scheduledTime);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
                        >
                          Tomar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playEnterSound();
                            handleSkipDose(item.medication.id, item.scheduledTime);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-xs font-semibold transition"
                        >
                          Pular
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playEnterSound();
                            setPostponeDose({
                              medicationId: item.medication.id,
                              scheduledTime: item.scheduledTime,
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl border border-purple-500/30 text-purple-500 hover:bg-purple-500/5 text-xs font-semibold transition"
                        >
                          Adiar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          playEnterSound();
                          handleRevertDose(item.medication.id, item.scheduledTime);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Corrigir</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MEDICATION CATALOG / MANAGEMENT */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
          <h4 className="text-sm font-bold text-[var(--app-text)]">
            Medicamentos Registados ({medications.length})
          </h4>
        </div>

        {medications.length === 0 ? (
          <p className="text-xs text-[var(--app-text-muted)] py-4 text-center italic">Nenhum medicamento cadastrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {medications.map((med) => (
              <div
                key={med.id}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                  med.status === 'suspended'
                    ? 'bg-black/10 dark:bg-white/5 border-[var(--app-border)] opacity-60'
                    : 'bg-black/5 dark:bg-white/5 border-[var(--app-border)] hover:opacity-80'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-[var(--app-text)]">{med.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        med.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-[var(--app-text-muted)]/10 text-[var(--app-text-muted)]'
                      }`}
                    >
                      {med.status === 'active' ? 'Activo' : 'Suspenso'}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[var(--app-text-muted)] font-mono">
                    {med.dosage} {med.unit} · {med.schedules.join(', ')}
                  </p>

                  <p className="text-[10px] text-[var(--app-text-muted)] opacity-60">
                    Início: {med.startDate} {med.endDate ? `· Fim: ${med.endDate}` : ''}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      handleToggleStatus(med);
                    }}
                    className="text-xs font-semibold text-[var(--app-text-muted)] hover:text-[var(--app-text)] flex items-center gap-1"
                  >
                    {med.status === 'active' ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Suspender</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Reactivar</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        openEditModal(med);
                      }}
                      className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        setDeleteMedId(med.id);
                      }}
                      className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT MEDICATION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveMedication}
            className="w-full max-w-lg rounded-3xl bg-[var(--app-surface)] p-6 shadow-2xl border border-[var(--app-border)] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h4 className="text-sm font-bold text-[var(--app-text)]">
                {editingMed ? 'Editar Medicamento' : 'Novo Medicamento'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsAddModalOpen(false);
                }}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Nome: *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Hidroxiureia"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Dosagem: *
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Unidade:
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="mg">mg</option>
                  <option value="mg (1 comp.)">mg (1 comp.)</option>
                  <option value="comprimido(s)">comprimido(s)</option>
                  <option value="cápsula(s)">cápsula(s)</option>
                  <option value="ml">ml</option>
                  <option value="gotas">gotas</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Horário(s): *
                </label>
                <input
                  type="text"
                  value={schedulesText}
                  onChange={(e) => setSchedulesText(e.target.value)}
                  placeholder="08:30, 20:30"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Frequência:
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as MedicationFrequency)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-black/5 dark:bg-white/5 text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="daily">Diário</option>
                  <option value="sos">SOS (Se necessário)</option>
                  <option value="interval">Intervalo regular</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--app-border)]">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setIsAddModalOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => playEnterSound()}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: POSTPONE DOSE */}
      {postponeDose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-2xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-[var(--app-text)]">Adiar Toma</h4>
            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setPostponeMinutes(mins)}
                  className={`py-2 rounded-xl border text-xs font-semibold ${
                    postponeMinutes === mins
                      ? 'border-purple-500 bg-purple-500/10 text-purple-500 font-bold'
                      : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  +{mins} min
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setPostponeDose(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  handleConfirmPostpone();
                }}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteMedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-2xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-[var(--app-text)]">Eliminar medicamento?</h4>
            </div>
            <p className="text-xs text-[var(--app-text-muted)]">O histórico de tomas anteriores será preservado no diário.</p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setDeleteMedId(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-text-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  handleDeleteMedication(deleteMedId);
                }}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-sm active:scale-[0.98]"
              >
                Sim, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
