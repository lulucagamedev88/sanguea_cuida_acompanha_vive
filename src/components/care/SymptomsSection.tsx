/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HeartPulse,
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Info,
  ShieldAlert,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { SymptomEntry } from '../../types/health';
import { PAIN_SCALE_ITEMS } from '../../constants/demoData';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

const COMMON_SYMPTOM_TYPES = [
  'Dor articular / óssea (ossos longos)',
  'Dactilite (inchaço doloroso de mãos ou pés)',
  'Dor torácica / peito (atenção médica prioritária)',
  'Dor abdominal / barriga',
  'Febre / Temperatura elevada',
  'Cansaço acentuado / Fadiga extrema / Palidez',
  'Falta de ar / Dificuldade respiratória',
  'Icterícia (olhos ou pele amarelados)',
  'Cefaleia / Dor de cabeça intensa',
  'Outro sintoma pessoal',
];

const COMMON_LOCATIONS = [
  'Pernas / Joelhos (Ossos longos)',
  'Braços / Cotovelos / Ombros',
  'Costas / Coluna lombar',
  'Peito / Tórax (Atenção prioritária)',
  'Abdómen / Barriga',
  'Mãos / Pés (Extremidades)',
  'Cabeça / Pescoço',
  'Generalizada / Múltiplos locais',
  'Outro local',
];

const COMMON_TRIGGERS = [
  'Frio intenso / Mudança de temperatura brusca',
  'Desidratação / Baixa ingestão de líquidos',
  'Esforço físico ou desporto excessivo',
  'Infecção respiratória ou constipação recente',
  'Stress emocional ou noites mal dormidas',
  'Nenhum factor evidente / Espontâneo',
];

const DURATION_OPTIONS = [
  'Menos de 1 hora',
  '1 a 3 horas',
  '3 a 6 horas',
  'Intermitente ao longo do dia',
  'Constante durante todo o dia',
];

interface SymptomsSectionProps {
  onNavigateToSos?: () => void;
}

export const SymptomsSection: React.FC<SymptomsSectionProps> = ({ onNavigateToSos }) => {
  const { healthRecord, todayDateStr, addSymptom, updateSymptom, deleteSymptom } = useHealth();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<SymptomEntry | null>(null);

  // Detail Modal
  const [viewingSymptom, setViewingSymptom] = useState<SymptomEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form fields
  const [symptomType, setSymptomType] = useState(COMMON_SYMPTOM_TYPES[0]);
  const [painScore, setPainScore] = useState<number>(3);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([COMMON_LOCATIONS[0]]);
  const [date, setDate] = useState(todayDateStr);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(DURATION_OPTIONS[1]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [reliefMeasures, setReliefMeasures] = useState('');
  const [notes, setNotes] = useState('');

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const openAddModal = () => {
    const now = new Date();
    setEditingSymptom(null);
    setSymptomType(COMMON_SYMPTOM_TYPES[0]);
    setPainScore(3);
    setSelectedLocations([COMMON_LOCATIONS[0]]);
    setDate(todayDateStr);
    setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    setDuration(DURATION_OPTIONS[1]);
    setSelectedTriggers([]);
    setReliefMeasures('Repouso e hidratação oral reforçada');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (symptom: SymptomEntry) => {
    setEditingSymptom(symptom);
    setSymptomType(symptom.symptomType);
    setPainScore(symptom.painScore);
    setSelectedLocations(symptom.locations);
    setDate(symptom.date);
    setTime(symptom.time);
    setDuration(symptom.duration);
    setSelectedTriggers(symptom.triggers || []);
    setReliefMeasures(symptom.reliefMeasures || '');
    setNotes(symptom.notes || '');
    setIsModalOpen(true);
  };

  const toggleLocation = (loc: string) => {
    playEnterSound();
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const toggleTrigger = (trig: string) => {
    playEnterSound();
    setSelectedTriggers((prev) =>
      prev.includes(trig) ? prev.filter((t) => t !== trig) : [...prev, trig]
    );
  };

  const handleSaveSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocations.length === 0) {
      showFeedback('Por favor seleccione pelo menos uma localização da dor ou sintoma.');
      return;
    }

    if (editingSymptom) {
      await updateSymptom(editingSymptom.id, {
        symptomType,
        painScore,
        locations: selectedLocations,
        date,
        time,
        duration,
        triggers: selectedTriggers,
        reliefMeasures: reliefMeasures.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      showFeedback('Registo de sintoma actualizado com sucesso.');
    } else {
      await addSymptom({
        symptomType,
        painScore,
        locations: selectedLocations,
        date,
        time: time || '12:00',
        duration,
        triggers: selectedTriggers,
        reliefMeasures: reliefMeasures.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      showFeedback('Novo episódio de sintomas guardado no diário local.');
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSymptom(id);
    setDeleteConfirmId(null);
    setViewingSymptom(null);
    showFeedback('Registo de sintoma eliminado.');
  };

  const symptoms = healthRecord?.symptoms || [];

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Hospital / Emergency Alert Banner */}
      <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-5 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-600">
              Aviso de Rigor Clínico e Emergência Médica
            </h4>
            <p className="text-xs text-[var(--app-text)] opacity-80 leading-relaxed">
              Este diário é de uso pessoal e confidencial para partilha com a sua equipa médica. A aplicação <strong>não diagnostica a causa dos sintomas, não prevê crises nem sugere medicamentos</strong>. Sintomas severos como dor súbita no peito, febre (≥ 38°C), dificuldade em respirar ou aumento súbito do baço exigem <strong>assistência médica urgente imediata no hospital</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Header & New Entry Button */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--app-text)]">
              Diário Pessoal de Sintomas e Dor
            </h3>
            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
              Registe episódios dolorosos, intensidade (0–10) e factores para partilhar na próxima consulta
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            openAddModal();
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Novo Episódio</span>
        </button>
      </div>

      {/* CHRONOLOGICAL LIST OF SYMPTOMS */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
          <div>
            <h4 className="text-sm font-bold text-[var(--app-text)]">
              Histórico Cronológico de Sintomas ({symptoms.length})
            </h4>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Registos ordenados cronologicamente para acompanhamento clínico
            </p>
          </div>
        </div>

        {symptoms.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--app-bg)] border border-dashed border-[var(--app-border)] space-y-2">
            <HeartPulse className="w-8 h-8 text-rose-500/30 mx-auto" />
            <p className="text-xs font-semibold text-[var(--app-text)]">Sem episódios de dor registados recentemente.</p>
            <p className="text-[11px] text-[var(--app-text-muted)]">
              Caso surja desconforto ou dor, clique em «Registar Novo Episódio» para anotar a intensidade e local.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {symptoms.map((symptom) => {
              const isHighPain = symptom.painScore >= 6;
              const isMediumPain = symptom.painScore >= 4 && symptom.painScore < 6;

              return (
                <div
                  key={symptom.id}
                  className="p-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:border-[var(--app-accent)]/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                        isHighPain
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : isMediumPain
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      }`}
                    >
                      <span className="text-sm font-mono leading-none">{symptom.painScore}</span>
                      <span className="text-[8px] uppercase tracking-wider font-bold">/10</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--app-text)]">
                          {symptom.symptomType}
                        </span>
                        <span className="text-[10px] font-semibold text-[var(--app-text-muted)] font-mono">
                          {symptom.date} às {symptom.time}
                        </span>
                      </div>

                      <p className="text-xs text-[var(--app-text-muted)] font-medium">
                        Localização: <span className="font-semibold text-[var(--app-text)]">{symptom.locations.join(', ')}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--app-text-muted)] opacity-80">
                        <span>Duração: {symptom.duration}</span>
                        {symptom.triggers && symptom.triggers.length > 0 && (
                          <span>· Factor: {symptom.triggers[0]}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        setViewingSymptom(symptom);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-bg)] text-xs font-semibold text-[var(--app-text)] transition"
                    >
                      Ver Detalhes
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        openEditModal(symptom);
                      }}
                      className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)] transition"
                      title="Editar registo"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        setDeleteConfirmId(symptom.id);
                      }}
                      className="p-1.5 rounded-lg text-[var(--app-text-muted)] hover:text-rose-600 hover:bg-rose-500/10 transition"
                      title="Eliminar registo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT SYMPTOM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveSymptom}
            className="w-full max-w-lg rounded-3xl bg-[var(--app-surface)] p-6 shadow-2xl border border-[var(--app-border)] space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--app-border)]">
              <h4 className="text-sm font-bold text-[var(--app-text)]">
                {editingSymptom ? 'Editar Registo de Sintoma' : 'Registar Novo Episódio de Sintoma ou Dor'}
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
                Tipo de Sintoma: *
              </label>
              <select
                value={symptomType}
                onChange={(e) => setSymptomType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none"
              >
                {COMMON_SYMPTOM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* PAIN INTENSITY SLIDER (0 TO 10) */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--app-text)]">
                  Intensidade da Dor (Escala 0 a 10):
                </span>
                <span className="text-base font-black font-mono text-rose-600 bg-[var(--app-surface)] px-3 py-0.5 rounded-xl border border-rose-500/20 shadow-2xs">
                  {painScore} / 10
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={painScore}
                onChange={(e) => setPainScore(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />

              <div className="flex items-center justify-between text-[10px] text-[var(--app-text-muted)] font-semibold px-1">
                <span>0 (Sem dor)</span>
                <span>5 (Moderada)</span>
                <span>10 (Severa)</span>
              </div>
            </div>

            {/* LOCATIONS MULTI-SELECT */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--app-text)] block">
                Localização da dor: *
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1">
                {COMMON_LOCATIONS.map((loc) => {
                  const isChecked = selectedLocations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`p-2 rounded-xl border text-left text-xs transition ${
                        isChecked
                          ? 'border-rose-500 bg-rose-500/10 font-bold text-rose-600'
                          : 'border-[var(--app-border)] hover:bg-[var(--app-bg)] text-[var(--app-text-muted)]'
                      }`}
                    >
                      <span>{loc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Data:
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Hora:
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Duração aproximada:
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* TRIGGERS */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--app-text)] block">
                Factores associados / desencadeantes:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {COMMON_TRIGGERS.map((trig) => {
                  const isChecked = selectedTriggers.includes(trig);
                  return (
                    <button
                      key={trig}
                      type="button"
                      onClick={() => toggleTrigger(trig)}
                      className={`p-1.5 rounded-xl border text-left text-[11px] transition ${
                        isChecked
                          ? 'border-amber-500 bg-amber-500/10 font-bold text-amber-600'
                          : 'border-[var(--app-border)] hover:bg-[var(--app-bg)] text-[var(--app-text-muted)]'
                      }`}
                    >
                      <span>{trig}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Medidas de alívio tomadas (opcional):
              </label>
              <input
                type="text"
                value={reliefMeasures}
                onChange={(e) => setReliefMeasures(e.target.value)}
                placeholder="Ex: Repouso deitado, hidratação oral com água tépida, agasalho quente"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                Observações pessoais:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas para partilhar com o hematologista na próxima consulta..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none h-16 resize-none"
              />
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
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Guardar no Diário
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: VIEW DETAILS */}
      {viewingSymptom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--app-surface)] p-6 shadow-2xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                  {viewingSymptom.painScore}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--app-text)]">{viewingSymptom.symptomType}</h4>
                  <p className="text-[10px] text-[var(--app-text-muted)] font-mono">
                    {viewingSymptom.date} às {viewingSymptom.time}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setViewingSymptom(null);
                }}
                className="p-1 rounded-lg text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                <span className="text-[10px] text-[var(--app-text-muted)] font-semibold block">Localização(ões)</span>
                <span className="font-bold text-[var(--app-text)] mt-0.5 block">
                  {viewingSymptom.locations.join(', ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-[var(--app-text-muted)] font-semibold block">Intensidade</span>
                  <span className="font-bold text-rose-600 mt-0.5 block">{viewingSymptom.painScore} / 10</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-[var(--app-text-muted)] font-semibold block">Duração</span>
                  <span className="font-semibold text-[var(--app-text)] mt-0.5 block">{viewingSymptom.duration}</span>
                </div>
              </div>

              {viewingSymptom.triggers && viewingSymptom.triggers.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-[var(--app-text-muted)] font-semibold block">Factores desencadeantes</span>
                  <span className="text-[var(--app-text)] mt-0.5 block">{viewingSymptom.triggers.join(', ')}</span>
                </div>
              )}

              {viewingSymptom.reliefMeasures && (
                <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-[var(--app-text-muted)] font-semibold block">Medidas de alívio tomadas</span>
                  <span className="text-[var(--app-text)] mt-0.5 block">{viewingSymptom.reliefMeasures}</span>
                </div>
              )}

              {viewingSymptom.notes && (
                <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-[var(--app-text-muted)] font-semibold block">Observações</span>
                  <p className="text-[var(--app-text)] mt-0.5 leading-relaxed opacity-80">{viewingSymptom.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[var(--app-border)]">
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  setDeleteConfirmId(viewingSymptom.id);
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setViewingSymptom(null);
                }}
                className="px-4 py-2 rounded-xl bg-[var(--app-accent)] text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-2xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-[var(--app-text)]">Eliminar este registo de sintoma?</h4>
            <p className="text-xs text-[var(--app-text-muted)]">
              O episódio será removido do diário local. Esta acção é irreversível.
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
