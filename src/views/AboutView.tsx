/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, HeartPulse, Lock, Users, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sobre o Sanguea</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sanguea — Cuida. Acompanha. Vive.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Uma plataforma pessoal, humana e totalmente local concebida para apoiar o acompanhamento diário e a qualidade de vida das pessoas que vivem com doença falciforme e das suas famílias.
          </p>
        </div>
      </div>

      {/* Missão e A Quem se Destina */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">A Nossa Missão</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Oferecer ferramentas simples, dignas e acessíveis para ajudar na gestão preventiva da saúde, promover a adesão à hidratação e medicação, e registar os sinais corporais no dia a dia.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">A Quem se Destina</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            O Sanguea destina-se a crianças, adolescentes e adultos com doença falciforme (HbSS, HbSC, HbS-Talassemia), bem como a pais e cuidadores que coordenam a rotina de cuidados diários.
          </p>
        </div>
      </div>

      {/* Principais Funcionalidades */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow duration-200 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Principais Funcionalidades de Acompanhamento</h3>
            <p className="text-xs text-slate-500">Ferramentas desenhadas para a rotina prática</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-900">Gestão de Hidratação Diária</p>
              <p className="text-[11px] text-slate-600">Registo intuitivo da ingestão de líquidos ajustado por idade.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-900">Terapêutica e Medicação</p>
              <p className="text-[11px] text-slate-600">Organização discreta e lembretes da medicação prescrita.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-900">Monitorização de Sintomas e Dor</p>
              <p className="text-[11px] text-slate-600">Registo de episódios dolorosos, intensidade e localização corporal.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-900">Protocolo SOS & Emergência</p>
              <p className="text-[11px] text-slate-600">Acesso rápido a contactos de emergência e cartão clínico de apoio.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filosofia Local-First e Criptografia */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
          <Lock className="w-4 h-4 text-sky-700" />
          <span>Privacidade Absoluta e Armazenamento Local</span>
        </div>
        <p className="text-xs sm:text-sm text-sky-950 leading-relaxed">
          Os seus dados clínicos e pessoais <strong>nunca são enviados para a Internet</strong> nem armazenados em servidores na nuvem. Toda a informação é mantida no seu dispositivo Android e protegida com criptografia forte AES-GCM 256 bits com AAD e chaves derivadas via PBKDF2 (600.000 iterações). O seu histórico permanece 100% privado e sob o seu controlo exclusivo.
        </p>
      </div>

      {/* Aviso Responsável Clínico */}
      <div className="bg-slate-100 rounded-2xl p-5 border border-slate-200 text-slate-600 text-xs leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800 mb-0.5">Aviso de Orientação Médica</p>
          <p>
            O Sanguea é uma ferramenta de apoio e acompanhamento pessoal. Não substitui o diagnóstico, as decisões terapêuticas nem as orientações prestadas pelo seu médico especialista em hematologia, pediatra ou equipa hospitalar de acompanhamento.
          </p>
        </div>
      </div>
    </div>
  );
};
