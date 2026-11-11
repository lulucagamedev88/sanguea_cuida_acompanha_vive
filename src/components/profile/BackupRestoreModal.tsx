/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  readBackupFileFromDisk,
  decryptBackupPayload,
  restoreProfilesToStorage,
} from '../../services/backup';
import { getAllProfilesMetadata, ProfileMetadata } from '../../services/storage';
import {
  SangueaBackupFile,
  BackupPayloadData,
  BackupProfilePackage,
} from '../../types';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onRestoreComplete,
}) => {
  const { playEnterSound, playExitSound } = useInterfaceAudio();
  const [step, setStep] = useState<
    'select_file' | 'enter_passphrase' | 'preview_select' | 'set_credentials' | 'success'
  >('select_file');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backupEnvelope, setBackupEnvelope] = useState<SangueaBackupFile | null>(null);

  const [backupPassphrase, setBackupPassphrase] = useState<string>('');
  const [decryptedPayload, setDecryptedPayload] = useState<BackupPayloadData | null>(null);
  const [decryptionTimeMs, setDecryptionTimeMs] = useState<number>(0);

  const [selectedOldIds, setSelectedOldIds] = useState<string[]>([]);

  // Credenciais locais para os perfis restaurados
  const [useCommonPassphrase, setUseCommonPassphrase] = useState<boolean>(true);
  const [commonPassphrase, setCommonPassphrase] = useState<string>('');
  const [confirmCommonPassphrase, setConfirmCommonPassphrase] = useState<string>('');
  const [individualPassphrases, setIndividualPassphrases] = useState<Record<string, string>>({});

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [restoredSummary, setRestoredSummary] = useState<
    Array<{ oldId: string; newId: string; name: string }>
  >([]);

  if (!isOpen) return null;

  const handleReset = () => {
    playExitSound();
    setStep('select_file');
    setSelectedFile(null);
    setBackupEnvelope(null);
    setBackupPassphrase('');
    setDecryptedPayload(null);
    setDecryptionTimeMs(0);
    setSelectedOldIds([]);
    setUseCommonPassphrase(true);
    setCommonPassphrase('');
    setConfirmCommonPassphrase('');
    setIndividualPassphrases({});
    setIsProcessing(false);
    setErrorMessage(null);
    setRestoredSummary([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      setIsProcessing(true);
      const envelope = await readBackupFileFromDisk(file);
      setSelectedFile(file);
      setBackupEnvelope(envelope);
      setStep('enter_passphrase');
    } catch (err: unknown) {
      console.error('Erro ao ler ficheiro de backup:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha ao ler o ficheiro selecionado.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!backupEnvelope) return;

    if (!backupPassphrase) {
      setErrorMessage('Por favor introduza a palavra-passe do backup.');
      return;
    }

    try {
      setIsProcessing(true);
      const { payload, durationMs } = await decryptBackupPayload(
        backupEnvelope,
        backupPassphrase
      );

      setDecryptedPayload(payload);
      setDecryptionTimeMs(durationMs);
      setSelectedOldIds(payload.profiles.map((p) => p.meta.id));
      setStep('preview_select');
    } catch (err: unknown) {
      console.error('Erro ao decifrar backup:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Palavra-passe do backup incorrecta ou ficheiro adulterado.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToCredentials = () => {
    playEnterSound();
    setErrorMessage(null);
    if (selectedOldIds.length === 0) {
      setErrorMessage('Selecione pelo menos um perfil para importar.');
      return;
    }
    setStep('set_credentials');
  };

  const handleFinalRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!decryptedPayload) return;

    const packagesToRestore = decryptedPayload.profiles.filter((p) =>
      selectedOldIds.includes(p.meta.id)
    );

    const passphrasesMap: Record<string, string> = {};

    if (useCommonPassphrase) {
      if (!commonPassphrase || commonPassphrase.length < 4) {
        setErrorMessage('A nova palavra-passe local deve conter pelo menos 4 caracteres.');
        return;
      }
      if (commonPassphrase !== confirmCommonPassphrase) {
        setErrorMessage('As novas palavras-passe locais não coincidem.');
        return;
      }
      passphrasesMap['__COMMON__'] = commonPassphrase;
    } else {
      for (const pkg of packagesToRestore) {
        const pass = individualPassphrases[pkg.meta.id];
        if (!pass || pass.length < 4) {
          setErrorMessage(
            `Por favor defina uma palavra-passe válida para o perfil "${pkg.meta.name}".`
          );
          return;
        }
        passphrasesMap[pkg.meta.id] = pass;
      }
    }

    try {
      setIsProcessing(true);
      const currentMetas = await getAllProfilesMetadata();

      const results = await restoreProfilesToStorage(
        packagesToRestore,
        passphrasesMap,
        currentMetas
      );

      setRestoredSummary(results);
      setStep('success');
    } catch (err: unknown) {
      console.error('Erro ao restaurar perfis no IndexedDB:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Falha ao gravar os perfis restaurados.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelectProfile = (oldId: string) => {
    playEnterSound();
    setSelectedOldIds((prev) =>
      prev.includes(oldId) ? prev.filter((i) => i !== oldId) : [...prev, oldId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              Restaurar Cópia de Segurança
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Importe perfis e dados clínicos a partir de um ficheiro .sanguea
            </p>
          </div>
          <button
            onClick={() => {
              playExitSound();
              onClose();
            }}
            type="button"
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start space-x-2">
            <span className="font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* PASSO 1: Seleccionar Ficheiro */}
        {step === 'select_file' && (
          <div className="mt-6 space-y-4">
            <div className="border-2 border-dashed border-stone-300 hover:border-sky-500 bg-stone-50/50 hover:bg-sky-50/30 transition-all rounded-2xl p-8 text-center cursor-pointer relative">
              <input
                type="file"
                accept=".sanguea,.json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
                📂
              </div>
              <p className="text-sm font-bold text-stone-800">
                Clique aqui para seleccionar o ficheiro .sanguea
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Suporta cópias de segurança cifradas do Sanguéa (até 20 MB)
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 space-y-1">
              <p className="font-bold text-stone-700">• Garantia de Privacidade:</p>
              <p>
                O ficheiro é processado exclusivamente no seu dispositivo. Nenhum dado é enviado para servidores externos.
              </p>
            </div>
          </div>
        )}

        {/* PASSO 2: Palavra-passe do Backup */}
        {step === 'enter_passphrase' && selectedFile && (
          <form onSubmit={handleDecrypt} className="mt-5 space-y-4">
            <div className="p-3 bg-stone-100/80 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-base">📄</span>
                <span className="font-mono font-medium truncate">{selectedFile.name}</span>
              </div>
              <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded-full text-stone-600 font-medium">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Palavra-passe da Cópia de Segurança
              </label>
              <p className="text-xs text-stone-500 mb-2">
                Introduza a palavra-passe que definiu ao exportar este ficheiro.
              </p>
              <input
                id="backup-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Palavra-passe do backup"
                value={backupPassphrase}
                onChange={(e) => setBackupPassphrase(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                ← Escolher outro ficheiro
              </button>
              <button
                type="submit"
                onClick={() => playEnterSound()}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>A Decifrar...</span>
                  </>
                ) : (
                  <span>Decifrar e Validar Ficheiro</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* PASSO 3: Pré-visualizar e Seleccionar Perfis */}
        {step === 'preview_select' && decryptedPayload && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-600 pb-2 border-b border-stone-100">
              <span>
                <strong>{decryptedPayload.profileCount}</strong> perfis encontrados
              </span>
              <span className="text-[10px] text-stone-400">
                Decifrado em {decryptionTimeMs} ms
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {decryptedPayload.profiles.map((pkg: BackupProfilePackage) => {
                const isSelected = selectedOldIds.includes(pkg.meta.id);
                const h = pkg.healthData;

                return (
                  <div
                    key={pkg.meta.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-sky-300 bg-sky-50/40'
                        : 'border-stone-200 bg-stone-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProfile(pkg.meta.id)}
                          className="rounded border-stone-300 text-sky-600 focus:ring-sky-500 w-4 h-4"
                        />
                        <span className="text-sm font-bold text-stone-800">
                          {pkg.meta.name}
                        </span>
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full">
                          {pkg.meta.ageGroup}
                        </span>
                      </label>
                    </div>

                    {/* Resumo clínico do perfil */}
                    {h && (
                      <div className="mt-2 text-[11px] text-stone-500 grid grid-cols-2 gap-x-2 gap-y-1 bg-white/60 p-2 rounded-lg border border-stone-100">
                        <span>• Hidratação: {h.hydrationEntries.length} registos</span>
                        <span>• Medicação: {h.medications.length} ativas</span>
                        <span>• Sintomas: {h.symptoms.length} registados</span>
                        <span>• Rotinas: {h.routines.length} ativas</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setStep('enter_passphrase');
                }}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                ← Voltar
              </button>
              <button
                type="button"
                onClick={handleProceedToCredentials}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
              >
                Continuar para Credenciais ({selectedOldIds.length})
              </button>
            </div>
          </div>
        )}

        {/* PASSO 4: Definir Novas Credenciais Locais */}
        {step === 'set_credentials' && decryptedPayload && (
          <form onSubmit={handleFinalRestore} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Definir Novas Palavras-passe Locais
              </label>
              <p className="text-xs text-stone-600 mb-3">
                Por motivos de segurança, defina a palavra-passe que utilizará para desbloquear os perfis restaurados neste dispositivo.
              </p>

              {/* Opções de Palavra-passe */}
              <div className="space-y-2 mb-4">
                <label className="flex items-center space-x-2 text-xs text-stone-800 cursor-pointer">
                  <input
                    type="radio"
                    name="passphrase_type"
                    checked={useCommonPassphrase}
                    onChange={() => setUseCommonPassphrase(true)}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-medium">
                    Usar a mesma palavra-passe para todos os perfis importados
                  </span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-stone-800 cursor-pointer">
                  <input
                    type="radio"
                    name="passphrase_type"
                    checked={!useCommonPassphrase}
                    onChange={() => setUseCommonPassphrase(false)}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span className="font-medium">
                    Definir palavras-passe individuais por perfil
                  </span>
                </label>
              </div>

              {useCommonPassphrase ? (
                <div className="space-y-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nova Palavra-passe Local
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={commonPassphrase}
                      onChange={(e) => setCommonPassphrase(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Confirmar Nova Palavra-passe
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repita a palavra-passe"
                      value={confirmCommonPassphrase}
                      onChange={(e) => setConfirmCommonPassphrase(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {decryptedPayload.profiles
                    .filter((p) => selectedOldIds.includes(p.meta.id))
                    .map((pkg) => (
                      <div
                        key={pkg.meta.id}
                        className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2"
                      >
                        <span className="block text-xs font-bold text-stone-800">
                          Perfil: {pkg.meta.name}
                        </span>
                        <input
                          type="password"
                          required
                          placeholder={`Palavra-passe para ${pkg.meta.name}`}
                          value={individualPassphrases[pkg.meta.id] || ''}
                          onChange={(e) =>
                            setIndividualPassphrases({
                              ...individualPassphrases,
                              [pkg.meta.id]: e.target.value,
                            })
                          }
                          className="w-full text-xs px-3 py-1.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-stone-100">
              <button
                type="button"
                onClick={() => {
                  playExitSound();
                  setStep('preview_select');
                }}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                ← Voltar
              </button>
              <button
                type="submit"
                onClick={() => playEnterSound()}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>A Restaurar no Dispositivo...</span>
                  </>
                ) : (
                  <span>Concluir e Restaurar Perfis</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* PASSO 5: Sucesso */}
        {step === 'success' && (
          <div className="mt-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Restauro Concluído com Sucesso!
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                Os seguintes perfis foram importados e cifrados localmente com as novas palavras-passe:
              </p>

              <div className="mt-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200 text-stone-700 text-left space-y-1 max-h-36 overflow-y-auto">
                {restoredSummary.map((r) => (
                  <p key={r.newId} className="flex items-center space-x-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span className="font-medium">{r.name}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  onRestoreComplete();
                  onClose();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-xs"
              >
                Ir para Seleção de Perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
