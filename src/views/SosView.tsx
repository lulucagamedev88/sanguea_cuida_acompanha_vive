/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  Hospital,
  AlertTriangle,
  User,
  Heart,
  FileBadge,
  MapPin,
  ExternalLink,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { PatientProfile } from '../types';
import { DEMO_PATIENT, DEMO_EMERGENCY_CONTACTS, DEMO_HEALTHCARE_CENTROS } from '../constants/demoData';
import { DemoNotice } from '../components/common/DemoNotice';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';

interface SosViewProps {
  patient: PatientProfile;
}

export const SosView: React.FC<SosViewProps> = ({ patient }) => {
  const { playEnterSound } = useInterfaceAudio();
  const [activeTab, setActiveTab] = useState<'contacts' | 'card' | 'hospitals'>('contacts');
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  const simulateCall = (name: string, phone: string) => {
    setCopiedNotice(`Número de teste: ${phone} (${name})`);
    setTimeout(() => setCopiedNotice(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <DemoNotice />

      {/* Emergency Header Alert Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 text-white p-6 shadow-sm border border-rose-600 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
                Sanguea · Protocolo SOS
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
                Central de Apoio e Emergência Médica
              </h2>
              <p className="text-xs text-rose-100/90 mt-1">
                Acesso imediato aos contactos de socorro, cuidadores e resumo clínico para a triagem hospitalar.
              </p>
            </div>
          </div>
        </div>

        {copiedNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-semibold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{copiedNotice} — Em ambiente real iniciará a chamada telefónica.</span>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/70 rounded-2xl overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('contacts');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'contacts'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <Phone className="w-3.5 h-3.5 text-rose-600" />
          <span>Contactos de Emergência</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('card');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'card'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <FileBadge className="w-3.5 h-3.5 text-rose-600" />
          <span>Resumo Médico de Triagem</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playEnterSound();
            setActiveTab('hospitals');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'hospitals'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-stone-600 hover:text-slate-900'
          }`}
        >
          <Hospital className="w-3.5 h-3.5 text-rose-600" />
          <span>Unidades Hospitalares</span>
        </button>
      </div>

      {/* 1. CONTACTOS DE EMERGÊNCIA */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {/* Quick Angola Emergency Bar (INEMA 112 & CISP 111) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                  Emergência Médica Angola (INEMA)
                </span>
                <p className="text-2xl font-black text-rose-950 font-mono mt-0.5">112</p>
                <p className="text-xs text-rose-800">Socorro Médico e Ambulâncias 24h</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  simulateCall('INEMA (112)', '112');
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-700 text-white font-bold text-xs shadow-xs hover:bg-rose-800 active:scale-95 transition"
              >
                Testar Botão
              </button>
            </div>

            <div className="bg-sky-50 border border-sky-300 rounded-3xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700">
                  Emergência Geral & Polícia (CISP)
                </span>
                <p className="text-2xl font-black text-sky-950 font-mono mt-0.5">111</p>
                <p className="text-xs text-sky-800">Centro Integrado de Segurança Pública</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  simulateCall('CISP (111)', '111');
                }}
                className="px-4 py-2.5 rounded-xl bg-sky-700 text-white font-bold text-xs shadow-xs hover:bg-sky-800 active:scale-95 transition"
              >
                Testar Botão
              </button>
            </div>
          </div>

          {/* Caregiver and Specialized Contacts */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-stone-100">
              Cuidadores Familiares e Equipa Médica de Acompanhamento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {patient.caregiver && (
                <div className="md:col-span-2 p-4 rounded-2xl border-2 border-rose-300 bg-rose-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {patient.caregiver.name} ({patient.caregiver.relationship})
                      </span>
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                        Cuidador do Perfil Activo
                      </span>
                    </div>
                    <p className="text-xs text-rose-900 font-medium">Responsável directo pelo perfil de {patient.name}</p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      Contacto: {patient.caregiver.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        simulateCall(patient.caregiver!.name, patient.caregiver!.phone);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-700 text-white hover:bg-rose-800 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contactar Cuidador</span>
                    </button>
                  </div>
                </div>
              )}

              {DEMO_EMERGENCY_CONTACTS.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-2xl border border-stone-200/70 bg-stone-50/50 flex flex-col justify-between gap-3 hover:border-stone-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {contact.name}
                      </span>
                      {contact.isPrimary && (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600">{contact.role}</p>
                    <p className="text-[11px] text-stone-400 font-mono">
                      Disponibilidade: {contact.availableHours}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200/50 shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {contact.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        simulateCall(contact.name, contact.phone);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Contactar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-stone-400 pt-2">
              * Nota: Em cumprimento das directrizes da Fase 1, a aplicação não efetua chamadas telefónicas automáticas nem envia mensagens SMS de emergência sem confirmação expressa do utilizador.
            </p>
          </div>
        </div>
      )}

      {/* 2. RESUMO MÉDICO DE TRIAGEM */}
      {activeTab === 'card' && (
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                <FileBadge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cartão de Emergência da Pessoa com Doença Falciforme
                </h3>
                <p className="text-xs text-rose-700 font-medium">
                  Documento rápido para exibição imediata na triagem do hospital
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              Urgência Médica
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-medium block">Nome do Doente</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.name}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-medium block">Diagnóstico de Base</span>
              <span className="text-sm font-bold text-rose-800 mt-0.5 block">{patient.sickleCellType}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-medium block">Hemoglobina Basal Habitual</span>
              <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{patient.baselineHemoglobin}</span>
              <span className="text-[10px] text-stone-400 mt-0.5 block">(Valores inferiores a 6.0 g/dL exigem alerta urgente)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-medium block">Grupo Sanguíneo & Fenótipo</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.bloodType}</span>
              <span className="text-[10px] font-mono text-rose-700 mt-0.5 block">{patient.phenotype}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-medium block">Alergias</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.allergies}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[11px] text-stone-500 font-medium block">Hospital & Hematologista</span>
              <span className="text-xs font-semibold text-slate-900 mt-0.5 block">{patient.hospital}</span>
              <span className="text-[11px] text-stone-500 mt-0.5 block">{patient.specialistDoctor}</span>
            </div>
          </div>

          {/* Emergency Sickle Cell Clinical Protocol Summary */}
          <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4 space-y-2 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>RECOMENDAÇÕES DE BOA PRÁTICA CLÍNICA NA URGÊNCIA:</span>
            </div>
            <ul className="text-[11px] text-amber-900/90 space-y-1 list-disc list-inside leading-relaxed">
              <li><strong>Analgesia Rápida:</strong> A dor na crise falciforme é de origem isquémica óssea severa; não atrasar a administração de analgesia adequada.</li>
              <li><strong>Hidratação Endovenosa:</strong> Iniciar fluidoterapia ponderada (evitar hiper-hidratação pulmonar).</li>
              <li><strong>Oxigenoterapia:</strong> Apenas indicada se a saturação de O₂ for inferior a 95% em ar ambiente.</li>
              <li><strong>Febre:</strong> Se temperatura ≥ 38.0°C, colher hemoculturas e iniciar antibioterapia empírica endovenosa sem demora (risco de sépsis por bactérias encapsuladas).</li>
            </ul>
          </div>
        </div>
      )}

      {/* 3. UNIDADES HOSPITALARES */}
      {activeTab === 'hospitals' && (
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Directório de Unidades Hospitalares com Hematologia de Referência
              </h3>
              <p className="text-xs text-stone-500">
                Centros recomendados para atendimento pediátrico e adulto em situações agudas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {DEMO_HEALTHCARE_CENTROS.map((hospital) => (
              <div
                key={hospital.id}
                className="p-4 rounded-2xl border border-stone-200/70 bg-stone-50/50 space-y-2 hover:border-stone-300 transition flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{hospital.name}</h4>
                    <span className="text-[11px] text-stone-500 font-medium">{hospital.type}</span>
                  </div>
                  {hospital.hasPediatricHematology && (
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full self-start shrink-0">
                      Hematologia Pediátrica
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-stone-600 pt-1 border-t border-stone-200/40">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hospital className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{hospital.emergencyUnit}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{hospital.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-stone-400 pt-2">
            * Directório demonstrativo. Na Fase 1 não são utilizados serviços externos de GPS ou geolocalização por razões de privacidade.
          </p>
        </div>
      )}
    </div>
  );
};
