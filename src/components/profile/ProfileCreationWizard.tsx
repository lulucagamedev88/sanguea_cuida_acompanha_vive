/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Calendar,
  Heart,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { UserProfile, SickleCellType } from '../../types';
import { calculateAge, formatAgeString } from '../../utils/age';
import {
  getAvatarsForProfile,
  getDefaultAvatarId,
  AvatarDefinition,
} from '../../constants/avatars';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { AngolaPhoneInput } from '../common/AngolaPhoneInput';
import { validateAngolaPhone } from '../../utils/phone';
import { useProfile } from '../../context/ProfileContext';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface ProfileCreationWizardProps {
  onCancel?: () => void;
  onSuccess: (created: UserProfile) => void;
}

type TargetAudience = 'criança' | 'adolescente' | 'adulto';

const SICKLE_CELL_OPTIONS: { id: string; label: string; desc: string }[] = [
  { id: 'HbSS', label: 'HbSS', desc: 'Anemia Falciforme mais frequente (homozigótica).' },
  { id: 'HbSC', label: 'HbSC', desc: 'Dupla heterozigotia de hemoglobina S e hemoglobina C.' },
  { id: 'HbS/β⁰-talassemia', label: 'HbS/β⁰-talassemia', desc: 'Combinação com beta-talassemia nula.' },
  { id: 'HbS/β⁺-talassemia', label: 'HbS/β⁺-talassemia', desc: 'Combinação com beta-talassemia positiva.' },
  { id: 'Outro tipo confirmado', label: 'Outro tipo confirmado', desc: 'Outra variante identificada por electroforese ou teste genético.' },
  { id: 'Não sei / Ainda não confirmado', label: 'Não sei / Ainda não confirmado', desc: 'Em processo de diagnóstico ou aguarda resultados de exames.' },
];

export const ProfileCreationWizard: React.FC<ProfileCreationWizardProps> = ({
  onCancel,
  onSuccess,
}) => {
  const { createProfile } = useProfile();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  // Wizard Step (1 to 6)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [targetGroup, setTargetGroup] = useState<TargetAudience>('criança');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  // Strictly Masculino or Feminino
  const [gender, setGender] = useState<'Masculino' | 'Feminino'>('Masculino');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('child-boy-hoodie');
  const [sickleCellType, setSickleCellType] = useState<string>('HbSS');
  const [customSickleCellType, setCustomSickleCellType] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Caregiver fields with Angola phone
  const [caregiverName, setCaregiverName] = useState('');
  const [caregiverRelation, setCaregiverRelation] = useState('Mãe');
  const [caregiverPhone, setCaregiverPhone] = useState('');
  const [caregiverEmail, setCaregiverEmail] = useState('');

  // Password / Local Encryption Credentials
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);

  // Validation feedback
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Age calculation
  const { age, ageGroup, isValidDate } = calculateAge(birthDate);

  // When targetGroup changes, update state and move to Step 2
  const handleTargetGroupSelect = (group: TargetAudience) => {
    playEnterSound();
    setTargetGroup(group);
    setStep(2);
  };

  // Step Validation before progressing
  const handleNextStep = () => {
    setValidationError(null);

    // Step 2: Personal Data Validation
    if (step === 2) {
      if (!fullName.trim()) {
        setValidationError('Por favor introduza o nome completo.');
        return;
      }
      if (!birthDate) {
        setValidationError('Por favor introduza a data de nascimento.');
        return;
      }
      if (!isValidDate) {
        setValidationError('Data de nascimento inválida ou no futuro.');
        return;
      }

      // Check consistency with initial selection
      if (targetGroup === 'criança' && age >= 12) {
        setValidationError(`A data indicada corresponde a ${age} anos (Adolescente/Adulto). Por favor verifique a data.`);
        return;
      }
      if (targetGroup === 'adolescente' && (age < 12 || age >= 18)) {
        setValidationError(`A data indicada corresponde a ${age} anos (fora do intervalo 12–17 anos).`);
        return;
      }
      if (targetGroup === 'adulto' && age < 18) {
        setValidationError(`A data indicada corresponde a ${age} anos (menor de idade). Por favor seleccione o perfil infantil ou adolescente.`);
        return;
      }

      // Automatically select default avatar for the exact (gender + ageGroup) combination
      const defaultAvatar = getDefaultAvatarId(gender, ageGroup);
      setSelectedAvatarId(defaultAvatar);

      setStep(3);
      return;
    }

    // Step 3: Avatar
    if (step === 3) {
      if (!selectedAvatarId) {
        setValidationError('Por favor seleccione um avatar.');
        return;
      }
      setStep(4);
      return;
    }

    // Step 4: Clinical Info
    if (step === 4) {
      if (sickleCellType === 'Outro tipo confirmado' && !customSickleCellType.trim()) {
        setValidationError('Por favor indique a variante confirmada pelo profissional de saúde.');
        return;
      }
      setStep(5);
      return;
    }

    // Step 5: Caregiver & Angola Phone
    if (step === 5) {
      if (targetGroup === 'adulto') {
        if (!patientPhone.trim()) {
          setValidationError('Por favor indique o seu contacto telefónico de Angola (+244).');
          return;
        }
        const phoneVal = validateAngolaPhone(patientPhone);
        if (!phoneVal.isValid) {
          setValidationError(phoneVal.errorMessage || 'Número de telefone em Angola inválido.');
          return;
        }
      } else {
        // Criança ou Adolescente
        if (!caregiverName.trim()) {
          setValidationError('É obrigatório identificar o adulto responsável/cuidador.');
          return;
        }
        if (!caregiverPhone.trim()) {
          setValidationError('Por favor indique o contacto telefónico de Angola (+244) do cuidador.');
          return;
        }
        const phoneVal = validateAngolaPhone(caregiverPhone);
        if (!phoneVal.isValid) {
          setValidationError(phoneVal.errorMessage || 'Número de telefone em Angola inválido.');
          return;
        }

        // Optional patient phone for adolescents
        if (targetGroup === 'adolescente' && patientPhone.trim()) {
          const pPhoneVal = validateAngolaPhone(patientPhone);
          if (!pPhoneVal.isValid) {
            setValidationError('Contacto do adolescente: ' + (pPhoneVal.errorMessage || 'Número inválido.'));
            return;
          }
        }
      }

      setStep(6);
      return;
    }

    // Advance
    setStep((s) => s + 1);
  };

  // Final Submission with AES-GCM local encryption
  const handleSubmitProfile = async () => {
    setValidationError(null);

    if (passphrase.length < 6) {
      setValidationError('A palavra-passe deve ter pelo menos 6 caracteres para garantir uma cifragem robusta.');
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setValidationError('As palavras-passe introduzidas não coincidem.');
      return;
    }

    try {
      setIsSubmitting(true);

      const isChild = targetGroup === 'criança' || age < 12;
      const isAdult = targetGroup === 'adulto' && age >= 18;

      const newProfileData: Omit<UserProfile, 'id' | 'age' | 'createdAt' | 'updatedAt'> = {
        name: fullName.trim(),
        birthDate,
        ageGroup,
        gender, // Strictly Masculino or Feminino
        avatarId: selectedAvatarId,
        sickleCellType,
        customSickleCellType: sickleCellType === 'Outro tipo confirmado' ? customSickleCellType.trim() : undefined,
        isChild,
        isUnderCare: !isAdult,
        phone: patientPhone.trim() || undefined,
        email: patientEmail.trim() || undefined,
        caregiver: (targetGroup === 'criança' || targetGroup === 'adolescente') && caregiverName.trim()
          ? {
              name: caregiverName.trim(),
              relationship: caregiverRelation,
              phone: caregiverPhone.trim(),
              email: caregiverEmail.trim() || undefined,
            }
          : undefined,
      };

      const created = await createProfile(newProfileData, passphrase);
      onSuccess(created);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      } else {
        setValidationError('Erro ao criar o perfil protegido.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Strictly segregated avatar library matching gender + ageGroup
  const availableLibrary = getAvatarsForProfile(gender, ageGroup);

  return (
    <div className="min-h-screen bg-[#fafaf9] py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
        {/* Wizard Progress Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Passo {step} de 6
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {step === 1 && 'Quem será acompanhado?'}
              {step === 2 && 'Dados Pessoais & Sexo'}
              {step === 3 && `Biblioteca de Avatares (${gender} — ${ageGroup})`}
              {step === 4 && 'Informação Clínica (Doença Falciforme)'}
              {step === 5 && (targetGroup === 'adulto' ? 'Os Seus Contactos (Angola +244)' : 'Contacto do Cuidador (Angola +244)')}
              {step === 6 && 'Protecção & Cifragem Local'}
            </h2>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={() => {
                playExitSound();
                onCancel();
              }}
              className="text-xs text-stone-500 hover:text-stone-800 transition"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center gap-1.5 w-full">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s === step
                  ? 'bg-rose-700'
                  : s < step
                  ? 'bg-rose-300'
                  : 'bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* PASSO 1: QUEM SERÁ ACOMPANHADO */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Selecciona a faixa de acompanhamento. A experiência, os campos de cuidador e as orientações adaptar-se-ão automaticamente.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleTargetGroupSelect('criança')}
                className="p-5 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/30 text-left transition flex flex-col justify-between min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                  👶
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Criança</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Menor de 12 anos. Requer acompanhamento de um adulto responsável.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTargetGroupSelect('adolescente')}
                className="p-5 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/30 text-left transition flex flex-col justify-between min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                  🧑
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Adolescente</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    12 a 17 anos. Linguagem adaptada e autonomia progressiva.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTargetGroupSelect('adulto')}
                className="p-5 rounded-2xl border border-stone-200 hover:border-rose-400 hover:bg-rose-50/30 text-left transition flex flex-col justify-between min-h-[140px] group"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl group-hover:scale-105 transition-transform">
                  👤
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Adulto</h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    18 anos ou mais. Autogestão e registo pessoal confidencial.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: DADOS PESSOAIS & SEXO */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome Completo: <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Mariana Costa Silva"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Data de Nascimento: <span className="text-rose-600">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition font-mono"
              />

              {/* Automatic Age Calculation Feedback */}
              {birthDate && isValidDate && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Idade calculada automaticamente: <strong>{formatAgeString(age, ageGroup)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Sexo Field: Strictly Masculino and Feminino */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Sexo: <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setGender('Masculino');
                  }}
                  className={`p-3 rounded-2xl border text-center transition flex items-center justify-center gap-2 ${
                    gender === 'Masculino'
                      ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">👦</span>
                  <span className="text-xs font-semibold">Masculino</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setGender('Feminino');
                  }}
                  className={`p-3 rounded-2xl border text-center transition flex items-center justify-center gap-2 ${
                    gender === 'Feminino'
                      ? 'border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-slate-700'
                  }`}
                >
                  <span className="text-base">👧</span>
                  <span className="text-xs font-semibold">Feminino</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5">
                O sexo e a idade determinam automaticamente a biblioteca de avatares correspondente.
              </p>
            </div>
          </div>
        )}

        {/* PASSO 3: BIBLIOTECA DE AVATARES SEGREGADA */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs">
              <div>
                <span className="text-stone-400 font-medium block text-[10px] uppercase tracking-wider">
                  Biblioteca Aplicada
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  {gender} — {ageGroup}s
                </span>
              </div>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                {availableLibrary.length} opções disponíveis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {availableLibrary.map((av) => {
                const isSelected = selectedAvatarId === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setSelectedAvatarId(av.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20 shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <AvatarGraphic avatarId={av.id} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{av.name}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                          av.isOfficialCharacter
                            ? 'bg-rose-600 text-white font-bold'
                            : av.isPrototype
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {av.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-2">
                        {av.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {gender === 'Masculino' && ageGroup === 'Criança' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-xs text-rose-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Referência Oficial Aprovada:</strong> O rapaz negro africano com hoodie vermelho é a personagem oficial da Sanguéa, mantida como modelo principal para rapazes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* PASSO 4: INFORMAÇÃO CLÍNICA SOBRE DOENÇA FALCIFORME */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-rose-50/70 border border-rose-100 p-3 text-xs text-rose-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-rose-900 leading-relaxed">
                Selecciona o tipo de doença falciforme confirmado pela tua equipa médica. Se ainda não souberes com precisão, escolhe <strong>"Não sei / Ainda não confirmado"</strong>. A Sanguéa nunca tentará deduzir o diagnóstico a partir de sintomas.
              </p>
            </div>

            <div className="space-y-2">
              {SICKLE_CELL_OPTIONS.map((opt) => {
                const isSelected = sickleCellType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setSickleCellType(opt.id);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500/30'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                      <p className="text-[11px] text-stone-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                      isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-stone-300'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom specification if "Outro tipo confirmado" is selected */}
            {sickleCellType === 'Outro tipo confirmado' && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Indique a informação confirmada pelo médico:
                </label>
                <input
                  type="text"
                  value={customSickleCellType}
                  onChange={(e) => setCustomSickleCellType(e.target.value)}
                  placeholder="Ex: HbS/O-Arab, HbSD, etc."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

         {/* PASSO 5: CUIDADOR E CONTACTO DE ANGOLA (+244) */}
        {step === 5 && (
          <div className="space-y-4">
            {targetGroup === 'adulto' ? (
              <>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Por favor, indique os seus dados de contacto para que possam ser utilizados em caso de necessidade ou emergência.
                </p>
                
                <AngolaPhoneInput
                  value={patientPhone}
                  onChange={setPatientPhone}
                  label="O Seu Contacto Telefónico"
                  required={true}
                  placeholder="923 456 789"
                />

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    O Seu E-mail (Opcional):
                  </label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="o-seu-email@exemplo.ao"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  />
                </div>
              </>
            ) : (
              <>
                {targetGroup === 'criança' ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200/70 p-3 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      <strong>Responsável Obrigatório:</strong> Por motivos legais e de segurança em saúde, uma criança não pode ser apresentada como responsável legal pelo próprio perfil. Identifica o cuidador principal.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-stone-600">
                    Informação do adulto responsável ou cuidador (obrigatório para adolescentes):
                  </p>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nome do Cuidador / Responsável: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="Ex: Amara da Silva"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Grau de Parentesco / Relação:
                    </label>
                    <select
                      value={caregiverRelation}
                      onChange={(e) => setCaregiverRelation(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                    >
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Avó / Avô">Avó / Avô</option>
                      <option value="Tio / Tia">Tio / Tia</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <AngolaPhoneInput
                    value={caregiverPhone}
                    onChange={setCaregiverPhone}
                    label="Contacto do Cuidador"
                    required={true}
                    placeholder="923 456 789"
                  />
                </div>

                {targetGroup === 'adolescente' && (
                  <div className="pt-2 border-t border-stone-100 mt-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Contacto do Próprio Adolescente (Opcional)</p>
                    <AngolaPhoneInput
                      value={patientPhone}
                      onChange={setPatientPhone}
                      label="Contacto Telefónico do Adolescente"
                      required={false}
                      placeholder="923 456 789"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PASSO 6: PROTECÇÃO & PALAVRA-PASSE LOCAL */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Lock className="w-4 h-4 text-rose-700" />
                <span>Definição da Credencial de Acesso Local</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Esta palavra-passe serve de semente para derivar a chave criptográfica <strong>AES-GCM (256-bit)</strong> com <strong>PBKDF2</strong>.
              </p>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-950 font-medium">
                ⚠️ Não existe recuperação por email ou nuvem. Se perderes esta credencial, os dados cifrados deste perfil não poderão ser recuperados.
              </div>
            </div>

            {/* Hidden username input for Android Autofill & Password Manager support */}
            <input
              type="text"
              name="username"
              id="new-profile-username"
              autoComplete="username"
              value={fullName || 'Novo Perfil Sanguea'}
              readOnly
              className="sr-only"
              aria-hidden="true"
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="new-profile-password" className="text-xs font-semibold text-slate-700">
                  Criar Palavra-passe de Acesso:
                </label>
                <span className="text-[10px] text-stone-400">Mínimo 6 caracteres</span>
              </div>
              <div className="relative">
                <input
                  id="new-profile-password"
                  name="new-password"
                  type={showPassphrase ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Introduza uma palavra-passe segura"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-profile-password" className="text-xs font-semibold text-slate-700 block mb-1">
                Confirmar Palavra-passe:
              </label>
              <input
                id="confirm-profile-password"
                name="confirm-password"
                type={showPassphrase ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Repita a palavra-passe criada"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 bg-stone-50/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
              />
            </div>
          </div>
        )}

        {/* Validation Error Toast */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Wizard Controls Footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                playExitSound();
                setValidationError(null);
                setStep((s) => s - 1);
              }}
              className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                handleNextStep();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs active:scale-[0.98]"
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                playEnterSound();
                handleSubmitProfile();
              }}
              className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition shadow-sm active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'A cifrar e guardar...' : 'Criar Perfil Protegido'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
