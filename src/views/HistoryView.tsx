/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  FileClock,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  Clock,
  Droplets,
  Pill,
  HeartPulse,
  Sparkles,
  Stethoscope,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { useProfile } from '../context/ProfileContext';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';
import { HistoryCategory, UnifiedHistoryItem } from '../types/health';

export const HistoryView: React.FC = () => {
  const { isDemoActive } = useProfile();
  const { getUnifiedHistory, deleteHistoryItem } = useHealth();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [selectedCategory, setSelectedCategory] = useState<HistoryCategory>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Detail Modal & Delete confirmation
  const [viewingItem, setViewingItem] = useState<UnifiedHistoryItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<UnifiedHistoryItem | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const rawHistoryItems = useMemo(() => {
    return getUnifiedHistory(selectedCategory, selectedPeriod);
  }, [getUnifiedHistory, selectedCategory, selectedPeriod]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return rawHistoryItems;
    const q = searchQuery.toLowerCase();
    return rawHistoryItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.details && item.details.toLowerCase().includes(q)) ||
        item.date.includes(q)
    );
  }, [rawHistoryItems, searchQuery]);

  const handleDelete = async (item: UnifiedHistoryItem) => {
    await deleteHistoryItem(item.category, item.originalRefId);
    setDeleteConfirmItem(null);
    setViewingItem(null);
    showFeedback('Registo histórico eliminado com sucesso.');
  };

  const getCategoryIcon = (category: UnifiedHistoryItem['category']) => {
    switch (category) {
      case 'hydration':
        return { icon: Droplets, color: 'bg-sky-100 text-sky-700' };
      case 'medication':
        return { icon: Pill, color: 'bg-rose-100 text-rose-700' };
      case 'symptoms':
        return { icon: HeartPulse, color: 'bg-amber-100 text-amber-800' };
      case 'routines':
        return { icon: Sparkles, color: 'bg-emerald-100 text-emerald-700' };
      case 'appointments':
        return { icon: Stethoscope, color: 'bg-indigo-100 text-indigo-700' };
      default:
        return { icon: FileClock, color: 'bg-stone-100 text-stone-700' };
    }
  };

  // KPI calculations
  const totalHydrations = rawHistoryItems.filter((i) => i.category === 'hydration').length;
  const totalMeds = rawHistoryItems.filter((i) => i.category === 'medication').length;
  const totalSymptoms = rawHistoryItems.filter((i) => i.category === 'symptoms').length;
  const totalApps = rawHistoryItems.filter((i) => i.category === 'appointments').length;

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
              Modo Demonstração — A apresentar histórico demonstrativo completo de cuidados, medicação e sintomas.
            </span>
          </div>
        </div>
      )}

      {/* Header and KPI cards */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
            <FileClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--app-text)]">
              Histórico Cronológico Unificado
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Todos os registos do perfil activo preservados com integridade e rigor temporal
            </p>
          </div>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-sky-50/60 border border-sky-100 p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-sky-800 block">Hidratação</span>
            <span className="text-xl font-black text-[var(--app-text)] font-mono mt-0.5 block">{totalHydrations}</span>
            <span className="text-[10px] text-stone-500">registos de consumo</span>
          </div>

          <div className="bg-rose-50/60 border border-rose-100 p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-rose-800 block">Tomas de Medicação</span>
            <span className="text-xl font-black text-[var(--app-text)] font-mono mt-0.5 block">{totalMeds}</span>
            <span className="text-[10px] text-stone-500">tomas registadas</span>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-amber-900 block">Sintomas e Dor</span>
            <span className="text-xl font-black text-[var(--app-text)] font-mono mt-0.5 block">{totalSymptoms}</span>
            <span className="text-[10px] text-stone-500">episódios anotados</span>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-100 p-3.5 rounded-2xl">
            <span className="text-[11px] font-semibold text-indigo-800 block">Consultas e Exames</span>
            <span className="text-xl font-black text-[var(--app-text)] font-mono mt-0.5 block">{totalApps}</span>
            <span className="text-[10px] text-stone-500">compromissos médicos</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-5 border border-[var(--app-border)] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-stone-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs font-bold'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Todos ({rawHistoryItems.length})
            </button>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setSelectedCategory('hydration');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'hydration'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs font-bold'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Hidratação
            </button>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setSelectedCategory('medication');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'medication'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs font-bold'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Medicação
            </button>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setSelectedCategory('symptoms');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'symptoms'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs font-bold'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Sintomas e Dor
            </button>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setSelectedCategory('routines');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'routines'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs font-bold'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Rotinas
            </button>
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                setSelectedCategory('appointments');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === 'appointments'
                  ? 'bg-[var(--app-bg)] text-[var(--app-text)] shadow-xs font-bold'
                  : 'text-[var(--app-muted)] hover:text-[var(--app-text)]'
              }`}
            >
              Consultas
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 self-start md:self-auto text-xs">
            <span className="text-stone-400 font-semibold mr-1">Período:</span>
            {[
              { id: 'today', label: 'Hoje' },
              { id: '7days', label: '7 dias' },
              { id: '30days', label: '30 dias' },
              { id: 'all', label: 'Todos' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  playEnterSound();
                  setSelectedPeriod(p.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  selectedPeriod === p.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-[var(--app-surface)] text-[var(--app-muted)] hover:text-[var(--app-text)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por medicamento, sintoma, hospital ou anotação..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:bg-[var(--app-bg)] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>
      </div>

      {/* ITEMS STREAM */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-stone-50 border border-dashed border-stone-200 space-y-2">
            <FileClock className="w-7 h-7 text-stone-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Nenhum registo encontrado com os filtros actuais.</p>
            <p className="text-[11px] text-stone-500">
              Tente selecionar outro período ou limpar a barra de pesquisa.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const cat = getCategoryIcon(item.category);
            const Icon = cat.icon;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] hover:border-stone-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 ${cat.color}`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[var(--app-text)]">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badge.color}`}>
                          {item.badge.text}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600">
                      {item.subtitle}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
                      <span>Data: {item.date}</span>
                      <span>·</span>
                      <span>Hora: {item.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setViewingItem(item);
                    }}
                    className="p-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-surface)] text-[var(--app-text)] text-xs font-semibold flex items-center gap-1 transition"
                    title="Consultar detalhes"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setDeleteConfirmItem(item);
                    }}
                    className="p-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                    title="Eliminar este registo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: VIEW DETAILS */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95 transition-colors duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-sm font-bold text-slate-900">Detalhes do Registo Histórico</h4>
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setViewingItem(null);
                }}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-1">
                <span className="text-[10px] text-stone-400 font-semibold block uppercase">Título</span>
                <p className="font-bold text-sm text-[var(--app-text)]">{viewingItem.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Data Original</span>
                  <p className="font-bold font-mono text-[var(--app-text)] mt-0.5">{viewingItem.date}</p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)]">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Hora Registada</span>
                  <p className="font-bold font-mono text-[var(--app-text)] mt-0.5">{viewingItem.time}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                <span className="text-[10px] text-stone-400 font-semibold block uppercase">Descrição / Subtítulo</span>
                <p className="text-slate-800">{viewingItem.subtitle}</p>
              </div>

              {viewingItem.details && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 space-y-1">
                  <span className="text-[10px] text-stone-400 font-semibold block uppercase">Informação Detalhada</span>
                  <p className="text-slate-800 leading-relaxed">{viewingItem.details}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  setDeleteConfirmItem(viewingItem);
                  setViewingItem(null);
                }}
                className="text-xs text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Registo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setViewingItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--app-surface)] p-6 shadow-xl border border-[var(--app-border)] space-y-4 animate-in fade-in zoom-in-95 transition-colors duration-300">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center font-bold">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Eliminar registo histórico?</h4>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Deseja eliminar «<strong>{deleteConfirmItem.title}</strong>» datado de {deleteConfirmItem.date}? Esta acção não pode ser desfeita.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setDeleteConfirmItem(null);
                }}
                className="px-3.5 py-2 rounded-xl border border-[var(--app-border)] text-xs font-semibold text-[var(--app-muted)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  handleDelete(deleteConfirmItem);
                }}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
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
