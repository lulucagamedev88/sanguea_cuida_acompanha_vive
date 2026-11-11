/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ProfileMetadata,
  getEncryptedRecord,
  getEncryptedHealthRecord,
} from '../../services/storage';
import {
  decryptData,
  importPassphraseKey,
} from '../../services/crypto';
import {
  encryptBackupPayload,
  exportBackupFile,
  DEFAULT_PBKDF2_BACKUP_ITERATIONS,
} from '../../services/backup';
import { useProfile } from '../../context/ProfileContext';
import {
  BackupPayloadData,
  BackupProfilePackage,
  UserProfile,
} from '../../types';
import { PatientHealthRecord } from '../../types/health';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface BackupExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: ProfileMetadata[];
}

export const BackupExportModal: React.FC<BackupExportModalProps> = ({
  isOpen,
  onClose,
  profiles,
}) => {
  const { activeProfile, getSessionPassphraseKey, getDerivedKeysMap } = useProfile();
  const { playEnterSound, playExitSound } = useInterfaceAudio();

  const [selectedIds, setSelectedIds] = useState<string[]>(
    profiles.map((p) => p.id)
  );
  const [lockedPassphrases, setLockedPassphrases] = useState<Record<string, string>>({});

  const [backupPassphrase, setBackupPassphrase] = useState<string>('');
  const [confirmPassphrase, setConfirmPassphrase] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    profileCount: number;
    durationMs: number;
    filename: string;
  } | null>(null);

  if (!isOpen) return null;

  const toggleSelectProfile = (id: string) => {
    playEnterSound();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    playEnterSound();
    if (selectedIds.length === profiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(profiles.map((p) => p.id));
    }
  };

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (selectedIds.length === 0) {
      setErrorMessage('Selecione pelo menos um perfil para incluir no backup.');
      return;
    }

    if (!backupPassphrase || backupPassphrase.length < 4) {
      setErrorMessage('A palavra-passe do backup deve conter pelo menos 4 caracteres.');
      return;
    }

    if (backupPassphrase !== confirmPassphrase) {
      setErrorMessage('As palavras-passe do backup não coincidem.');
      return;
    }

    setIsProcessing(true);

    try {
      const backupPackages: BackupProfilePackage[] = [];

      for (const id of selectedIds) {
        const meta = profiles.find((p) => p.id === id);
        if (!meta) continue;

        let decryptedProfile: UserProfile | null = null;
        let decryptedHealth: PatientHealthRecord | null = null;

        if (activeProfile && activeProfile.id === id) {
          // Perfil activo e já desbloqueado na sessão
          const passphraseKey = getSessionPassphraseKey();
          const derivedKeysMap = getDerivedKeysMap();

          if (!passphraseKey) {
            throw new Error(`Sessão sem credencial activa para o perfil ${meta.name}.`);
          }

          const encProfile = await getEncryptedRecord(id);
          if (!encProfile) throw new Error(`Registo do perfil ${meta.name} não encontrado.`);
          decryptedProfile = await decryptData<UserProfile>(
            encProfile,
            passphraseKey,
            id,
            'profile',
            derivedKeysMap
          );

          const encHealth = await getEncryptedHealthRecord(id);
          if (encHealth) {
            decryptedHealth = await decryptData<PatientHealthRecord>(
              encHealth,
              passphraseKey,
              id,
              'health_data',
              derivedKeysMap
            );
          }
        } else {
          // Perfil bloqueado: utilizar a palavra-passe fornecida pelo utilizador
          const passphrase = lockedPassphrases[id];
          if (!passphrase) {
            throw new Error(
              `Por favor introduza a palavra-passe de desbloqueio do perfil "${meta.name}".`
            );
          }

          const passphraseKey = await importPassphraseKey(passphrase);
          const derivedKeysMap = new Map<string, CryptoKey>();

          const encProfile = await getEncryptedRecord(id);
          if (!encProfile) throw new Error(`Registo do perfil ${meta.name} não encontrado.`);

          try {
            decryptedProfile = await decryptData<UserProfile>(
              encProfile,
              passphraseKey,
              id,
              'profile',
              derivedKeysMap
            );
          } catch {
            throw new Error(`Palavra-passe de desbloqueio incorrecta para o perfil "${meta.name}".`);
          }

          const encHealth = await getEncryptedHealthRecord(id);
          if (encHealth) {
            try {
              decryptedHealth = await decryptData<PatientHealthRecord>(
                encHealth,
                passphraseKey,
                id,
                'health_data',
                derivedKeysMap
              );
            } catch {
              // Fall through
            }
          }
        }

        backupPackages.push({
          meta,
          profileData: decryptedProfile,
          healthData: decryptedHealth,
        });
      }

      const payload: BackupPayloadData = {
        backupId: window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : `backup-${Date.now()}`,
        exportedAt: new Date().toISOString(),
        profileCount: backupPackages.length,
        profiles: backupPackages,
      };

      // Cifrar payload com PBKDF2 (600.000 iterações) e medir o tempo real de execução
      const { backupFile, durationMs } = await encryptBackupPayload(
        payload,
        backupPassphrase,
        DEFAULT_PBKDF2_BACKUP_ITERATIONS
      );

      const datePart = new Date().toISOString().slice(0, 10);
      const filename = `sanguea-backup-${datePart}.sanguea`;

      exportBackupFile(backupFile, filename);

      setSuccessInfo({
        profileCount: backupPackages.length,
        durationMs,
        filename,
      });

      // Limpar campos sensíveis
      setBackupPassphrase('');
      setConfirmPassphrase('');
      setLockedPassphrases({});
    } catch (err: unknown) {
      console.error('Erro na exportação do backup:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao gerar a cópia de segurança.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--app-surface)] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[var(--app-border)] my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--app-border)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--app-text)]">
              Exportar Cópia de Segurança (.sanguea)
            </h2>
            <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
              Crie um ficheiro cifrado offline para transferir os seus dados com segurança.
            </p>
          </div>
          <button
            onClick={() => {
              playExitSound();
              onClose();
            }}
            type="button"
            className="text-[var(--app-text-muted)] hover:text-[var(--app-text)] p-1.5 rounded-lg hover:bg-[var(--app-bg)] transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs rounded-xl flex items-start space-x-2">
            <span className="font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold border border-emerald-500/20">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--app-text)]">
                Cópia de Segurança Exportada!
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Ficheiro descarregado com sucesso:{' '}
                <span className="font-mono bg-[var(--app-bg)] px-1.5 py-0.5 rounded text-[var(--app-text)] border border-[var(--app-border)]">
                  {successInfo.filename}
                </span>
              </p>
              <div className="mt-3 text-xs bg-[var(--app-bg)] p-3 rounded-xl border border-[var(--app-border)] text-[var(--app-text-muted)] space-y-1 text-left shadow-inner">
                <p>
                  • <strong>Perfis incluídos:</strong> {successInfo.profileCount}
                </p>
                <p>
                  • <strong>Cifragem de Segurança:</strong> PBKDF2 (600.000 iterações) + AES-GCM-256
                </p>
                <p>
                  • <strong>Tempo de Processamento:</strong> {successInfo.durationMs} ms
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  onClose();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-xs"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleExport} className="mt-4 space-y-5">
            {/* 1. Seleção de Perfis */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[var(--app-text)] uppercase tracking-wider opacity-70">
                  1. Seleccionar Perfis ({selectedIds.length}/{profiles.length})
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-[var(--app-accent)] hover:opacity-70 font-medium"
                >
                  {selectedIds.length === profiles.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {profiles.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  const isCurrentActive = activeProfile?.id === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isChecked
                          ? 'border-[var(--app-accent)]/30 bg-[var(--app-accent)]/5'
                          : 'border-[var(--app-border)] bg-[var(--app-bg)] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectProfile(p.id)}
                            className="rounded border-[var(--app-border)] text-[var(--app-accent)] focus:ring-[var(--app-accent)] w-4 h-4 bg-[var(--app-bg)]"
                          />
                          <span className="text-sm font-medium text-[var(--app-text)]">
                            {p.name}
                          </span>
                          <span className="text-[10px] bg-[var(--app-bg)] text-[var(--app-text-muted)] px-1.5 py-0.2 rounded-full border border-[var(--app-border)]">
                            {p.ageGroup}
                          </span>
                        </label>

                        {isCurrentActive && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-medium px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Desbloqueado
                          </span>
                        )}
                      </div>

                      {/* Solicitação de palavra-passe para perfis seleccionados que estão bloqueados */}
                      {isChecked && !isCurrentActive && (
                        <div className="mt-2 pt-2 border-t border-[var(--app-border)]">
                          <label className="block text-[11px] font-medium text-[var(--app-text-muted)] mb-1">
                            Palavra-passe de desbloqueio do perfil "{p.name}":
                          </label>
                          <input
                            type="password"
                            placeholder="Introduza a palavra-passe do perfil"
                            value={lockedPassphrases[p.id] || ''}
                            onChange={(e) =>
                              setLockedPassphrases({
                                ...lockedPassphrases,
                                [p.id]: e.target.value,
                              })
                            }
                            className="w-full text-xs px-2.5 py-1.5 border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] rounded-lg focus:ring-2 focus:ring-[var(--app-accent)]/20 focus:border-[var(--app-accent)] outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Palavra-passe do Backup */}
            <div className="space-y-3 pt-2 border-t border-[var(--app-border)]">
              <label className="block text-xs font-bold text-[var(--app-text)] uppercase tracking-wider opacity-70">
                2. Proteger Cópia de Segurança
              </label>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Palavra-passe de Backup
                </label>
                <input
                  type="password"
                  required
                  placeholder="Defina uma palavra-passe forte para o ficheiro"
                  value={backupPassphrase}
                  onChange={(e) => setBackupPassphrase(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] rounded-xl focus:ring-2 focus:ring-[var(--app-accent)]/20 focus:border-[var(--app-accent)] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--app-text-muted)] mb-1">
                  Confirmar Palavra-passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita a palavra-passe do backup"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] rounded-xl focus:ring-2 focus:ring-[var(--app-accent)]/20 focus:border-[var(--app-accent)] outline-none"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[11px] rounded-xl space-y-1 shadow-inner">
                <p className="font-bold flex items-center space-x-1">
                  <span>🔒</span>
                  <span>Aviso Importante de Segurança:</span>
                </p>
                <p className="opacity-90 leading-relaxed">
                  Esta palavra-passe será necessária para restaurar a cópia noutro dispositivo. Guarde-a num local seguro. A perda desta palavra-passe tornará o ficheiro matematicamente irrecuperável.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  onClose();
                }}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-medium text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg)] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => playEnterSound()}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-[var(--app-accent)] hover:opacity-90 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>A Cifrar Backup...</span>
                  </>
                ) : (
                  <span>Exportar e Descarregar (.sanguea)</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
