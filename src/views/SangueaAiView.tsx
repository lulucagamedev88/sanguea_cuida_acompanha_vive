/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Lock,
  CloudSun,
  FileSearch,
  MessageSquareHeart,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const SangueaAiView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-8 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-400/30">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Brevemente (Em Planeamento Futuro)</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Sanguea IA: Inteligência Assistencial com Rigor Clínico e Ético
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Na visão a longo prazo do Sanguea, a inteligência artificial será uma aliada atenta para quem convive com a doença falciforme — antecipando riscos ambientais, apoiando na adesão aos cuidados e traduzindo termos médicos complexos para as famílias.
          </p>
        </div>
      </div>

      {/* Inactivity & Strict Boundary Statement */}
      <div className="rounded-2xl bg-sky-50/80 border border-sky-200 p-4 flex items-start gap-3 text-xs text-sky-950">
        <AlertCircle className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            Espaço Reservado para Desenvolvimento Futuro
          </p>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            De acordo com a arquitectura local-first e os princípios de privacidade e segurança do Sanguea, nenhum modelo externo de inteligência artificial ou API de nuvem está ligado nesta fase. Todos os dados clínicos permanecem no seu dispositivo.
          </p>
        </div>
      </div>

      {/* Future Capabilities Pillars */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">
          Áreas de Apoio Previstas para Fases Posteriores
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Alertas Meteorológicos Preventivos
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cruzamento de previsões meteorológicas locais (quedas bruscas de temperatura, picos de calor ou aridez extrema) com lembretes proactivos de agasalho e hidratação reforçada.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Descodificação Amigável de Relatórios
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apoio aos cuidadores na compreensão de termos hematológicos habituais (reticulócitos, ferritina, LDH, doppler transcraniano) em linguagem clara e acessível, sem emitir diagnósticos.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Deteção Precoce de Padrões de Fadiga e Dor
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Identificação de quebras silenciosas no consumo de água ou aumentos graduais na queixa de dor óssea antes de culminarem numa crise aguda de vaso-oclusão.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Diálogo Guiado para Apoio aos Cuidadores
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Árvores de decisão validadas clinicamente para orientar o cuidador nos momentos de dúvida: medir temperatura, verificar palidez labial, hidratação de socorro ou ida imediata à urgência.
            </p>
          </div>
        </div>
      </div>

      {/* Ethical and Privacy Commitments */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Compromissos Éticos Fundamentais do Sanguea
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <p className="font-bold text-slate-900">1. Primazia Médica Humana</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              A inteligência artificial nunca substitui o médico especialista. Funciona como suporte ao autocuidado informado e à segurança do doente.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <p className="font-bold text-slate-900">2. Protecção Local de Dados</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Privacidade por desenho (Privacy by Design): os dados sensíveis de saúde nunca serão partilhados para treino público de modelos.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <p className="font-bold text-slate-900">3. Transparência Algorítmica</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cada sugestão ou lembrete será sempre justificado de forma inteligível para os doentes e profissionais de saúde.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
