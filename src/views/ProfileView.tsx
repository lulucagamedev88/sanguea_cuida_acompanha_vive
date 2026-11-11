/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Palette, 
  Volume2, 
  Monitor, 
  Type, 
  Bell, 
  ShieldCheck, 
  Info as InfoIcon,
  AppWindow,
  Speaker,
  Edit3,
  Save,
  Users,
  Lock,
  Phone,
  AlertCircle,
  FileBadge,
  Heart,
  CheckCircle2,
  VolumeX,
  Music
} from 'lucide-react';
import { UserProfile } from '../types';
import { getAvatarsForProfile } from '../constants/avatars';
import { AvatarGraphic } from '../components/avatar/AvatarGraphic';
import { useProfile } from '../context/ProfileContext';
import { formatAgeString } from '../utils/age';
import { AngolaPhoneInput } from '../components/common/AngolaPhoneInput';
import { validateAngolaPhone } from '../utils/phone';
import { useSettings, AppTheme } from '../context/SettingsContext';
import { useInterfaceAudio } from '../context/InterfaceAudioContext';

interface ProfileViewProps {
  patient: UserProfile;
  onOpenSwitcher?: () => void;
}

const SICKLE_CELL_OPTIONS = [
  'HbSS',
  'HbSC',
  'HbS/β⁰-talassemia',
  'HbS/β⁺-talassemia',
  'Outro tipo confirmado',
  'Não sei / Ainda não confirmado',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  patient,
  onOpenSwitcher,
}) => {
  const { updateActiveProfile, isDemoActive, lockSession } = useProfile();
  const { 
    theme, setTheme, 
    buttonSoundEnabled, setButtonSoundEnabled,
    buttonSoundVolume, setButtonSoundVolume,
    ambientSoundEnabled, setAmbientSoundEnabled,
    ambientVolume, setAmbientVolume,
    fontSize, setFontSize,
    notifications, setNotificationPreference
  } = useSettings();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [isEditingClinical, setIsEditingClinical] = useState(false);
  const [selectedSickleType, setSelectedSickleType] = useState(patient.sickleCellType);
  const [customType, setCustomType] = useState(patient.customSickleCellType || '');

  const [isEditingCaregiver, setIsEditingCaregiver] = useState(false);
  const [caregiverName, setCaregiverName] = useState(patient.caregiver?.name || '');
  const [caregiverRelation, setCaregiverRelation] = useState(patient.caregiver?.relationship || 'Mãe');
  const [caregiverPhone, setCaregiverPhone] = useState(patient.caregiver?.phone || '');
  const [caregiverPhoneError, setCaregiverPhoneError] = useState<string | null>(null);

  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  const availableAvatars = getAvatarsForProfile(patient.gender, patient.ageGroup);

  const APP_VERSION = '1.2.0-beta';

  const handleAvatarChange = async (avatarId: string) => {
    playEnterSound();
    try {
      await updateActiveProfile({ avatarId });
      setSaveSuccessNotice('Avatar actualizado com sucesso!');
      setTimeout(() => setSaveSuccessNotice(null), 2500);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSaveClinical = async () => {
    playEnterSound();
    try {
      await updateActiveProfile({
        sickleCellType: selectedSickleType,
        customSickleCellType: selectedSickleType === 'Outro tipo confirmado' ? customType : undefined,
      });
      setIsEditingClinical(false);
      setSaveSuccessNotice('Informação clínica actualizada e guardada localmente!');
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSaveCaregiver = async () => {
    playEnterSound();
    if (caregiverPhone.trim()) {
      const validation = validateAngolaPhone(caregiverPhone);
      if (!validation.isValid) {
        setCaregiverPhoneError(validation.errorMessage || 'Número de telefone de Angola inválido.');
        return;
      }
    }
    setCaregiverPhoneError(null);

    try {
      await updateActiveProfile({
        caregiver: caregiverName.trim()
          ? {
              name: caregiverName.trim(),
              relationship: caregiverRelation,
              phone: caregiverPhone.trim(),
            }
          : undefined,
      });
      setIsEditingCaregiver(false);
      setSaveSuccessNotice('Informação de cuidador actualizada!');
      setTimeout(() => setSaveSuccessNotice(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notice */}
      {saveSuccessNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <AvatarGraphic avatarId={patient.avatarId} size="xl" />

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--app-text)] tracking-tight">
                  {patient.name}
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  {patient.sickleCellType}
                  {patient.customSickleCellType ? ` (${patient.customSickleCellType})` : ''}
                </span>
                {isDemoActive && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Modo Demonstração
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-500">
                Data de Nascimento: <span className="font-semibold text-slate-700 font-mono">{patient.birthDate}</span> ·{' '}
                <span className="text-rose-700 font-semibold">{formatAgeString(patient.age, patient.ageGroup)}</span>
              </p>

              <p className="text-[11px] text-stone-600 font-medium">
                Sexo: <span className="font-bold text-[var(--app-text)]">{patient.gender}</span> · País: <span className="font-bold text-[var(--app-text)]">Angola (🇦🇴 +244)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenSwitcher && (
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  onOpenSwitcher();
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-slate-800 transition"
              >
                <Users className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                <span>Trocar Perfil</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playExitSound();
                lockSession();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-900 text-white text-xs font-semibold transition shadow-sm active:scale-[0.98]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>

        {/* Avatar Selection Row — Segregated by Gender + AgeGroup */}
        <div className="pt-4 border-t border-[var(--app-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div>
              <span className="text-xs font-bold text-[var(--app-text)] block">
                Biblioteca de Avatares — {patient.gender} · {patient.ageGroup}
              </span>
              <span className="text-[10px] text-[var(--app-text-muted)]">
                Apresenta estritamente opções correspondentes ao sexo ({patient.gender}) e faixa etária ({patient.ageGroup}).
              </span>
            </div>
            <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 w-fit">
              {availableAvatars.length} avatares nesta biblioteca
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableAvatars.map((av) => {
              const isSelected = patient.avatarId === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => handleAvatarChange(av.id)}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 relative ${
                    isSelected
                      ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5'
                      : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:opacity-80'
                  }`}
                >
                  <div className="relative">
                    <AvatarGraphic avatarId={av.id} size="lg" />
                    {av.isOfficialCharacter ? (
                      <span className="absolute -top-1 -right-1 text-[8px] font-extrabold bg-rose-600 text-white px-1.5 py-0.5 rounded-full shadow-2xs">
                        OFICIAL
                      </span>
                    ) : (
                      <span className="absolute -top-1 -right-1 text-[8px] font-medium bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-full shadow-2xs">
                        ESTUDO
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[var(--app-text)] truncate w-full text-center">
                    {av.name}
                  </span>
                  <span className="text-[10px] text-[var(--app-text-muted)] line-clamp-1 w-full text-center">
                    {av.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Columns Grid on Tablets (md:): Clinical Info & Caregiver Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* SECTION 1: INFORMAÇÃO CLÍNICA (DOENÇA FALCIFORME) */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <div className="flex items-center gap-2">
              <FileBadge className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">
                Informação Clínica (Doença Falciforme)
              </h3>
            </div>
            {!isEditingClinical ? (
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  setIsEditingClinical(true);
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveClinical}
                className="text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>
            )}
          </div>

          {!isEditingClinical ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-transparent border border-[var(--app-border)]">
                <span className="text-[11px] text-[var(--app-text-muted)] font-medium block">
                  Genótipo / Diagnóstico de Hemoglobina
                </span>
                <span className="text-sm font-bold text-[var(--app-text)] mt-0.5 block">
                  {patient.sickleCellType}
                  {patient.customSickleCellType ? ` — ${patient.customSickleCellType}` : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-transparent border border-[var(--app-border)]">
                  <span className="text-[11px] text-[var(--app-text-muted)] block">Faixa Etária</span>
                  <span className="font-semibold text-[var(--app-text)] mt-0.5 block">{patient.ageGroup}</span>
                </div>
                <div className="p-3 rounded-xl bg-transparent border border-[var(--app-border)]">
                  <span className="text-[11px] text-[var(--app-text-muted)] block">Idade Precisa</span>
                  <span className="font-semibold text-[var(--app-text)] mt-0.5 block">{patient.age} anos</span>
                </div>
              </div>

              <div className="rounded-xl bg-transparent border border-[var(--app-border)] p-3 text-xs text-[var(--app-text-muted)] space-y-1">
                <p className="font-semibold text-[var(--app-text)] text-[11px]">Rigor Clínico:</p>
                <p className="text-[11px] leading-relaxed">
                  A confirmação laboratorial (eletroforese de hemoglobinas ou estudo genético) é essencial para determinar o plano de vigilância e a resposta a indutores de HbF como a hidroxiureia.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <label className="text-xs font-semibold text-[var(--app-text)] block">
                Seleccione o tipo de doença falciforme confirmado:
              </label>

              <div className="space-y-1.5">
                {SICKLE_CELL_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setSelectedSickleType(opt);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                      selectedSickleType === opt
                        ? 'border-rose-500 bg-rose-50/10 font-bold text-rose-500'
                        : 'border-[var(--app-border)] bg-transparent text-[var(--app-text-muted)]'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedSickleType === opt && (
                      <CheckCircle2 className="w-4 h-4 text-rose-600" />
                    )}
                  </button>
                ))}
              </div>

              {selectedSickleType === 'Outro tipo confirmado' && (
                <div className="pt-2">
                  <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                    Indicação do médico:
                  </label>
                  <input
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Ex: HbS/O-Arab"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-transparent text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: GESTÃO DO CUIDADOR / RESPONSÁVEL */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">
                Informação do Cuidador / Apoio
              </h3>
            </div>
            {!isEditingCaregiver ? (
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  setIsEditingCaregiver(true);
                }}
                className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveCaregiver}
                className="text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </button>
            )}
          </div>

          {!isEditingCaregiver ? (
            <div className="space-y-3">
              {patient.caregiver ? (
                <div className="p-4 rounded-2xl bg-rose-500/5 border border-[var(--app-border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600">
                      {patient.isChild ? 'Adulto Responsável / Cuidador' : 'Contacto de Apoio / Familiar'}
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {patient.caregiver.relationship}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[var(--app-text)]">
                    {patient.caregiver.name}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)] pt-1 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{patient.caregiver.phone}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-transparent border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] text-center italic">
                  Nenhum cuidador registado para este perfil de adulto.
                </div>
              )}

              {patient.isChild && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Salvaguarda:</strong> O perfil de uma criança é sempre administrado pelo cuidador legal designado. Não é permitida a autogestão jurídica por menores de idade.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Nome do Cuidador:
                </label>
                <input
                  type="text"
                  value={caregiverName}
                  onChange={(e) => setCaregiverName(e.target.value)}
                  placeholder="Nome do responsável"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-transparent text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                    Parentesco:
                  </label>
                  <select
                    value={caregiverRelation}
                    onChange={(e) => setCaregiverRelation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-transparent text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Mãe">Mãe</option>
                    <option value="Pai">Pai</option>
                    <option value="Avó / Avô">Avó / Avô</option>
                    <option value="Tio / Tia">Tio / Tia</option>
                    <option value="Tutor Legal">Tutor Legal</option>
                    <option value="Cônjuge">Cônjuge</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <AngolaPhoneInput
                    value={caregiverPhone}
                    onChange={(val) => {
                      setCaregiverPhone(val);
                      if (caregiverPhoneError) setCaregiverPhoneError(null);
                    }}
                    label="Contacto Telefónico do Cuidador (Angola):"
                    error={caregiverPhoneError || undefined}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-[var(--app-border)] mt-2">
        <h2 className="text-lg font-bold text-[var(--app-text)] flex items-center gap-2 mb-6 px-1">
          <AppWindow className="w-5 h-5 text-rose-700" />
          Definições e Preferências
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. TEMA */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
              <Palette className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">Tema Visual</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {(['white', 'black', 'turquoise'] as AppTheme[]).map((t) => {
                const isSelected = theme === t;
                const themeNames = {
                  white: 'Branco (Padrão)',
                  black: 'Preto Profundo',
                  turquoise: 'Branco + Azul-Turquesa'
                };
                
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setTheme(t);
                    }}
                    className={`p-4 rounded-2xl border text-left transition relative overflow-hidden group ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5'
                        : 'border-[var(--app-border)] bg-[var(--app-surface)] hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                          t === 'white' ? 'bg-white border-stone-200' : 
                          t === 'black' ? 'bg-black border-white/20' : 'bg-white border-stone-200'
                        }`}>
                          <div className={`w-3 h-3 rounded-full ${
                            t === 'white' || t === 'black' ? 'bg-rose-600' : 'bg-sky-500'
                          }`} />
                        </div>
                        <span className="text-xs font-bold text-[var(--app-text)]">{themeNames[t]}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SOM */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
              <Speaker className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">Áudio e Sons</h3>
            </div>

            <div className="space-y-5">
              {/* Música de Fundo */}
              <div className="p-4 rounded-2xl border border-[var(--app-border)] bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      ambientSoundEnabled ? 'bg-sky-500/15 text-sky-500' : 'bg-slate-500/10 text-[var(--app-text-muted)]'
                    }`}>
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--app-text)] block">Música de Fundo</span>
                      <span className="text-[10px] text-[var(--app-text-muted)]">Faixas dedicadas para o Sanguéa e Aqua Quest</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={ambientSoundEnabled}
                    onClick={() => {
                      if (!ambientSoundEnabled) playEnterSound();
                      setAmbientSoundEnabled(!ambientSoundEnabled);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      ambientSoundEnabled ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    title={ambientSoundEnabled ? 'Desativar música de fundo' : 'Ativar música de fundo'}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      ambientSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Controlo de Volume da Música de Fundo */}
                <div className="pt-1 border-t border-[var(--app-border)]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                      Volume da Música
                    </span>
                    <span className="text-xs font-bold text-sky-500 font-mono">
                      {Math.round(ambientVolume * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={ambientVolume}
                      onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-sky-500 cursor-pointer"
                      aria-label="Volume da música de fundo"
                    />
                    <Volume2 className="w-4 h-4 text-sky-500 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Sons dos Botões (Efeitos Sonoros da Interface) */}
              <div className="p-4 rounded-2xl border border-[var(--app-border)] bg-black/[0.02] dark:bg-white/[0.02] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      buttonSoundEnabled ? 'bg-rose-500/15 text-rose-600' : 'bg-slate-500/10 text-[var(--app-text-muted)]'
                    }`}>
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--app-text)] block">Sons dos Botões</span>
                      <span className="text-[10px] text-[var(--app-text-muted)]">Efeitos sonoros nas interações e ações</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={buttonSoundEnabled}
                    onClick={() => {
                      if (!buttonSoundEnabled) playEnterSound();
                      setButtonSoundEnabled(!buttonSoundEnabled);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                      buttonSoundEnabled ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    title={buttonSoundEnabled ? 'Desativar sons dos botões' : 'Ativar sons dos botões'}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                      buttonSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Controlo de Volume dos Sons dos Botões */}
                <div className="pt-1 border-t border-[var(--app-border)]/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                      Volume dos Botões
                    </span>
                    <span className="text-xs font-bold text-rose-600 font-mono">
                      {Math.round(buttonSoundVolume * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VolumeX className="w-4 h-4 text-[var(--app-text-muted)] shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={buttonSoundVolume}
                      onChange={(e) => setButtonSoundVolume(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-700 accent-rose-600 cursor-pointer"
                      aria-label="Volume dos sons dos botões"
                    />
                    <Volume2 className="w-4 h-4 text-rose-600 shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ACESSIBILIDADE */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
              <Type className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">Acessibilidade</h3>
            </div>

            <div>
              <p className="text-[11px] text-[var(--app-text-muted)] mb-3">Ajuste o tamanho do texto para uma leitura mais confortável.</p>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'extra-large'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      playEnterSound();
                      setFontSize(size);
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-[11px] font-bold transition ${
                      fontSize === size
                        ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                        : 'bg-transparent text-[var(--app-text)] border-[var(--app-border)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {size === 'normal' && 'Normal'}
                    {size === 'large' && 'Grande'}
                    {size === 'extra-large' && 'Extra'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. NOTIFICAÇÕES */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
              <Bell className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">Lembretes Locais</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--app-text)]">Lembretes de Hidratação</span>
                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setNotificationPreference('hydration', !notifications.hydration);
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifications.hydration ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    notifications.hydration ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--app-text)]">Lembretes de Medicação</span>
                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    setNotificationPreference('medication', !notifications.medication);
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    notifications.medication ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    notifications.medication ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <p className="text-[10px] text-[var(--app-text-muted)] leading-tight pt-1 italic">
                * Os lembretes são executados localmente pela aplicação e dependem da permissão do navegador/sistema.
              </p>
            </div>
          </div>

          {/* 5. PRIVACIDADE */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">Privacidade e Dados</h3>
            </div>
            <div className="space-y-3 text-[11px] text-[var(--app-text-muted)]">
              <p>Os seus dados são cifrados com <strong>AES-GCM 256-bit</strong> e guardados apenas neste dispositivo (IndexedDB).</p>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 font-medium text-center">
                🛡️ O Sanguea não envia as suas informações clínicas para a nuvem. A privacidade é total e local.
              </div>
            </div>
          </div>

          {/* 6. SOBRE */}
          <div className="bg-[var(--app-surface)] rounded-3xl p-6 border border-[var(--app-border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--app-border)]">
              <InfoIcon className="w-4 h-4 text-[var(--app-text-muted)]" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">Sobre o Sanguéa</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-sm">
                  <span className="font-extrabold text-xl">S</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--app-text)] tracking-tight">Sanguéa</p>
                  <p className="text-[10px] text-[var(--app-text-muted)] font-medium">Versão {APP_VERSION}</p>
                </div>
              </div>
              <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed pt-1">
                Uma iniciativa dedicada ao apoio e acompanhamento proactivo de pessoas com anemia falciforme.
                <br/>
                <strong>Autor:</strong> Rodrigo Luluca
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
