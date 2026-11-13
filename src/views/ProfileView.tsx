/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Edit3,
  Save,
  Users,
  Lock,
  Phone,
  AlertCircle,
  FileBadge,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarGraphic } from '../components/avatar/AvatarGraphic';
import { ProfileVisualIdentityPicker } from '../components/profile/ProfileVisualIdentityPicker';
import { AppSettingsSection } from '../components/settings/AppSettingsSection';
import { useProfile } from '../context/ProfileContext';
import { formatAgeString } from '../utils/age';
import { AngolaPhoneInput } from '../components/common/AngolaPhoneInput';
import { validateAngolaPhone } from '../utils/phone';
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
  'HbAS',
  'HbAC',
  'HbAA',
  'Outro tipo confirmado',
  'Não sei / Ainda não confirmado',
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  patient,
  onOpenSwitcher,
}) => {
  const { updateActiveProfile, isDemoActive, lockSession } = useProfile();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [isEditingClinical, setIsEditingClinical] = useState(false);
  const [selectedSickleType, setSelectedSickleType] = useState(patient.sickleCellType);
  const [customType, setCustomType] = useState(patient.customSickleCellType || '');
  const [bloodTypeInput, setBloodTypeInput] = useState(patient.bloodType || '');

  const [isEditingCaregiver, setIsEditingCaregiver] = useState(false);
  const [caregiverName, setCaregiverName] = useState(patient.caregiver?.name || '');
  const [caregiverRelation, setCaregiverRelation] = useState(patient.caregiver?.relationship || 'Mãe');
  const [caregiverPhone, setCaregiverPhone] = useState(patient.caregiver?.phone || '');
  const [caregiverPhoneError, setCaregiverPhoneError] = useState<string | null>(null);

  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSickleType(patient.sickleCellType);
    setCustomType(patient.customSickleCellType || '');
    setBloodTypeInput(patient.bloodType || '');
    setCaregiverName(patient.caregiver?.name || '');
    setCaregiverRelation(patient.caregiver?.relationship || 'Mãe');
    setCaregiverPhone(patient.caregiver?.phone || '');
  }, [patient]);

  const displayGenotype = (() => {
    const raw = patient.sickleCellType?.trim();
    if (!raw || raw === 'Não sei / Ainda não confirmado') {
      return 'Não informado';
    }
    if (raw === 'Outro tipo confirmado') {
      return patient.customSickleCellType?.trim() || 'Não informado';
    }
    return raw;
  })();

  const handleAvatarChange = async (avatarId: string) => {
    playEnterSound();
    try {
      await updateActiveProfile({ avatarId, photoDataUrl: undefined });
      setSaveSuccessNotice('Avatar actualizado com sucesso!');
      setTimeout(() => setSaveSuccessNotice(null), 2500);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handlePhotoChange = async (photoDataUrl: string) => {
    playEnterSound();
    try {
      await updateActiveProfile({ photoDataUrl });
      setSaveSuccessNotice('Fotografia guardada localmente com cifragem AES-GCM!');
      setTimeout(() => setSaveSuccessNotice(null), 2800);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handlePhotoRemove = async (fallbackAvatarId: string) => {
    playExitSound();
    try {
      await updateActiveProfile({ photoDataUrl: undefined, avatarId: fallbackAvatarId });
      setSaveSuccessNotice('Fotografia removida. O perfil voltou a utilizar um avatar.');
      setTimeout(() => setSaveSuccessNotice(null), 2800);
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
        bloodType: bloodTypeInput.trim() || undefined,
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
            <AvatarGraphic
              avatarId={patient.avatarId}
              photoUrl={patient.photoDataUrl}
              alt={patient.name}
              size="xl"
            />

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

        {/* Visual Identification Management — Avatar, Gallery, Camera or Remove Photo */}
        <div className="pt-4 border-t border-[var(--app-border)] space-y-3">
          <div>
            <span className="text-xs font-bold text-[var(--app-text)] block">
              Identificação Visual — Avatar ou Fotografia Pessoal
            </span>
            <span className="text-[10px] text-[var(--app-text-muted)]">
              Altere o avatar ilustrado, seleccione uma fotografia da galeria, tire uma fotografia ou remova a foto actual.
            </span>
          </div>

          <ProfileVisualIdentityPicker
            mode="profile"
            gender={patient.gender}
            ageGroup={patient.ageGroup}
            selectedAvatarId={patient.avatarId}
            selectedPhotoDataUrl={patient.photoDataUrl}
            onSelectAvatar={handleAvatarChange}
            onSelectPhoto={handlePhotoChange}
            onRemovePhoto={handlePhotoRemove}
          />
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
                  Genótipo Hb (Hemoglobina)
                </span>
                <span className="text-sm font-bold text-[var(--app-text)] mt-0.5 block">
                  {displayGenotype}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-transparent border border-[var(--app-border)]">
                  <span className="text-[11px] text-[var(--app-text-muted)] block">Faixa Etária</span>
                  <span className="font-semibold text-[var(--app-text)] mt-0.5 block">{patient.ageGroup}</span>
                </div>
                <div className="p-3 rounded-xl bg-transparent border border-[var(--app-border)]">
                  <span className="text-[11px] text-[var(--app-text-muted)] block">Idade Precisa</span>
                  <span className="font-semibold text-[var(--app-text)] mt-0.5 block">{patient.age} anos</span>
                </div>
                <div className="p-3 rounded-xl bg-transparent border border-[var(--app-border)]">
                  <span className="text-[11px] text-[var(--app-text-muted)] block">Grupo Sanguíneo (ABO/Rh)</span>
                  <span className="font-semibold text-[var(--app-text)] font-mono mt-0.5 block">
                    {patient.bloodType?.trim() || 'Não informado'}
                  </span>
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
                Seleccione o genótipo Hb (hemoglobina) confirmado:
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

              <div className="pt-2">
                <label className="text-xs font-semibold text-[var(--app-text)] block mb-1">
                  Grupo Sanguíneo (ABO/Rh):
                </label>
                <select
                  value={bloodTypeInput}
                  onChange={(e) => setBloodTypeInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">Não informado</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
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

      <AppSettingsSection showTopDivider={true} />
    </div>
  );
};
