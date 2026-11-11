/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Lock,
  X,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Shield,
  ChevronRight,
  Download,
  Upload,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { ProfileMetadata } from '../../services/storage';
import { BackupExportModal } from './BackupExportModal';
import { BackupRestoreModal } from './BackupRestoreModal';
import { useSettings } from '../../context/SettingsContext';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateNew: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateNew,
}) => {
  const { profiles, activeProfile, unlockProfile, lockSession, isDemoActive } = useProfile();
  const { playEnterSound, playExitSound } = useInterfaceAudio();
  const [selectedToSwitch, setSelectedToSwitch] = useState<ProfileMetadata | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modais da Fase 4: Backup e Restauro
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);

  if (!isOpen) return null;

  const handleSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedToSwitch) return;
    playEnterSound();
    if (!passphrase.trim()) {
      setErrorMsg('Introduza a palavra-passe do perfil.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await unlockProfile(selectedToSwitch.id, passphrase);
      setSelectedToSwitch(null);
      setPassphrase('');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Credencial incorrecta.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
        <div className="w-full max-w-md rounded-3xl bg-[var(--app-surface)] p-6 shadow-2xl border border-[var(--app-border)] space-y-5 animate-in fade-in zoom-in-95 duration-150 transition-colors duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-700" />
              <h3 className="text-sm font-bold text-[var(--app-text)]">Gestão e Troca de Perfis</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                playExitSound();
                onClose();
              }}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Active Profile Indicator */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeProfile && <AvatarGraphic avatarId={activeProfile.avatarId} size="md" />}
              <div>
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Perfil Activo
                </span>
                <p className="text-xs font-bold text-[var(--app-text)]">{activeProfile?.name}</p>
                <p className="text-[10px] text-stone-500">
                  {activeProfile?.ageGroup} · {activeProfile?.sickleCellType}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              Em Uso
            </span>
          </div>

          {/* Switch to Another Profile Form */}
          {selectedToSwitch ? (
            <form onSubmit={handleSwitch} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--app-text)]">
                  Desbloquear: {selectedToSwitch.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playExitSound();
                    setSelectedToSwitch(null);
                    setErrorMsg(null);
                    setPassphrase('');
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Voltar
                </button>
              </div>

              {/* ... rest of the form ... */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Palavra-passe de {selectedToSwitch.name}:
                </label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => {
                    setPassphrase(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Palavra-passe de acesso local"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <div className="p-2 rounded-lg bg-rose-100 text-rose-800 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !passphrase}
                className="w-full py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold disabled:opacity-50 transition"
              >
                {isSubmitting ? 'A decifrar...' : 'Confirmar e Alternar'}
              </button>
            </form>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Outros perfis registados localmente:
              </label>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {profiles
                  .filter((p) => p.id !== activeProfile?.id)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        playEnterSound();
                        setSelectedToSwitch(p);
                        setErrorMsg(null);
                        setPassphrase('');
                      }}
                      className="w-full p-2.5 rounded-xl border border-[var(--app-border)] hover:border-rose-400 hover:bg-[var(--app-bg)] transition text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <AvatarGraphic avatarId={p.avatarId} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-[var(--app-text)]">{p.name}</p>
                          <p className="text-[10px] text-stone-500">{p.ageGroup}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </button>
                  ))}

                {profiles.filter((p) => p.id !== activeProfile?.id).length === 0 && (
                  <p className="text-xs text-stone-400 italic py-2">
                    Não existem outros perfis criados no dispositivo.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Secção de Backup e Restauro (Fase 4) */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Cópia de Segurança & Transferência
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  setIsExportOpen(true);
                }}
                className="py-2 px-2.5 rounded-xl border border-[var(--app-border)] hover:bg-sky-50 hover:border-sky-300 text-xs font-semibold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-sky-600" />
                <span>Exportar Backup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  setIsRestoreOpen(true);
                }}
                className="py-2 px-2.5 rounded-xl border border-[var(--app-border)] hover:bg-emerald-50 hover:border-emerald-300 text-xs font-semibold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restaurar Backup</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                playEnterSound();
                onClose();
                onOpenCreateNew();
              }}
              className="flex-1 py-2 px-3 rounded-xl border border-[var(--app-border)] hover:bg-stone-50 text-xs font-semibold text-[var(--app-text)] flex items-center justify-center gap-1.5 transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-rose-600" />
              <span>Adicionar Novo Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playExitSound();
                lockSession();
                onClose();
              }}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              title="Bloquear sessão imediatamente"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Bloquear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modais da Fase 4 */}
      <BackupExportModal
        isOpen={isExportOpen}
        onClose={() => {
          playExitSound();
          setIsExportOpen(false);
        }}
        profiles={profiles}
      />

      <BackupRestoreModal
        isOpen={isRestoreOpen}
        onClose={() => {
          playExitSound();
          setIsRestoreOpen(false);
        }}
        onRestoreComplete={() => {
          // Atualiza a lista de perfis do contexto
          window.location.reload();
        }}
      />
    </>
  );
};
