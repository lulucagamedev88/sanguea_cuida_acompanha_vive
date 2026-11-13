/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  KeyRound,
  UserPlus,
  Lock,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Heart,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { AvatarGraphic } from '../avatar/AvatarGraphic';
import { useSettings } from '../../context/SettingsContext';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';
import { SangueaLogoMark } from '../common/SangueaLogoMark';

interface EntryFlowProps {
  onStartCreate: () => void;
}

export const EntryFlow: React.FC<EntryFlowProps> = ({ onStartCreate }) => {
  const { profiles, unlockProfile, loadDemoProfile } = useProfile();
  const { playEnterSound } = useInterfaceAudio();
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles.length > 0 ? profiles[0].id : ''
  );
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep selectedProfileId in sync when profiles load
  React.useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profiles[0].id);
    }
  }, [profiles, selectedProfileId]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) {
      setErrorMsg('Por favor selecione um perfil.');
      return;
    }
    if (!passphrase) {
      setErrorMsg('Por favor introduza a palavra-passe de acesso local.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await unlockProfile(selectedProfileId, passphrase);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Credencial incorrecta. Verifique a palavra-passe.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSelectedMeta = profiles.find((p) => p.id === selectedProfileId);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex flex-col items-center justify-center p-4 sm:p-6 text-[var(--app-text)] select-none transition-colors duration-500">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <SangueaLogoMark size="md" className="mb-1" />
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--app-text)]">Sanguea</h1>
          <p className="text-xs font-semibold text-[var(--app-accent)] uppercase tracking-widest transition-colors duration-500">
            Cuida. Acompanha. Vive.
          </p>
          <p className="text-xs text-[var(--app-text)] opacity-60 max-w-sm mx-auto">
            Apoio ao acompanhamento de pessoas com doença falciforme. Protecção estritamente local e confidencial.
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-md text-[var(--app-text)] space-y-6 transition-all duration-200">
          {profiles.length > 0 ? (
            /* UNLOCK FLOW FOR EXISTING PROFILES */
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--app-border)]">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[var(--app-accent)] transition-colors duration-500" />
                  <h2 className="text-sm font-bold text-[var(--app-text)]">Aceder a Perfil Local</h2>
                </div>
                <span className="text-[10px] font-semibold text-[var(--app-accent)] bg-[var(--app-accent)]/10 px-2 py-0.5 rounded-full border border-[var(--app-accent)]/20 transition-colors duration-500">
                  AES-GCM V2 256-bit
                </span>
              </div>

              {/* Profile Selector Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--app-text-muted)] block">
                  Escolha o perfil a consultar:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {profiles.map((p) => {
                    const isSelected = p.id === selectedProfileId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playEnterSound();
                          setSelectedProfileId(p.id);
                          setErrorMsg(null);
                        }}
                        className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                          isSelected
                            ? 'border-[var(--app-accent)] bg-[var(--app-accent)]/5 ring-2 ring-[var(--app-accent)]/10'
                            : 'border-[var(--app-border)] hover:bg-[var(--app-bg)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <AvatarGraphic avatarId={p.avatarId} size="md" />
                          <div>
                            <p className="text-xs font-bold text-[var(--app-text)]">{p.name}</p>
                            <p className="text-[11px] text-[var(--app-text-muted)]">
                              {p.ageGroup}
                              {p.caregiverName ? ` · Acompanhado por ${p.caregiverName}` : ''}
                            </p>
                          </div>
                        </div>

                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-white' : 'border-[var(--app-border)]'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passphrase Input Form with Google Password Manager / Autofill Support */}
              <form onSubmit={handleUnlock} className="space-y-4 pt-1">
                {/* Hidden username field for Android Autofill & Password Manager match */}
                <input
                  type="text"
                  name="username"
                  id="username"
                  autoComplete="username"
                  value={activeSelectedMeta?.name || 'Perfil Sanguea'}
                  readOnly
                  className="sr-only"
                  aria-hidden="true"
                />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="current-password" className="text-xs font-semibold text-[var(--app-text-muted)]">
                      Palavra-passe de acesso local:
                    </label>
                    <span className="text-[10px] text-[var(--app-text-muted)] opacity-60">Protecção Web Crypto</span>
                  </div>

                  <div className="relative">
                    <input
                      id="current-password"
                      name="password"
                      type={showPassphrase ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={passphrase}
                      onChange={(e) => {
                        setPassphrase(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="Introduza a palavra-passe do perfil"
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:ring-2 focus:ring-[var(--app-accent)]/20 outline-none focus:border-[var(--app-accent)] transition-all"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] p-1"
                    >
                      {showPassphrase ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-start gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !passphrase}
                  onClick={() => playEnterSound()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--app-accent)] hover:opacity-90 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'A verificar e decifrar...' : 'Desbloquear Perfil'}</span>
                </button>
              </form>

              {/* Bottom Option: Create Another Profile */}
              <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={onStartCreate}
                  className="text-xs font-semibold text-[var(--app-accent)] hover:opacity-70 flex items-center gap-1.5 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Criar outro perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    loadDemoProfile();
                  }}
                  className="text-xs text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition"
                >
                  Ver modo demo
                </button>
              </div>
            </div>
          ) : (
            /* ONBOARDING FLOW WHEN NO PROFILES EXIST */
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--app-accent)]/10 text-[var(--app-accent)] flex items-center justify-center mx-auto transition-colors duration-500">
                <Heart className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-base font-bold text-[var(--app-text)]">
                  Bem-vindo ao Sanguea
                </h2>
                <p className="text-xs text-[var(--app-text-muted)] leading-relaxed max-w-sm mx-auto">
                  Acompanha de forma próxima e segura a saúde na doença falciforme. Para começar, cria o teu primeiro perfil protegido localmente.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    onStartCreate();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[var(--app-accent)] hover:opacity-90 text-white font-semibold text-xs shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Criar Novo Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playEnterSound();
                    loadDemoProfile();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] hover:bg-[var(--app-bg)] text-[var(--app-text)] font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <span>Explorar Modo de Demonstração</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security & Offline Privacy Footnote */}
        <div className="rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] p-4 text-xs text-[var(--app-text-muted)] space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-[var(--app-text)] font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[var(--app-accent)]" />
            <span>Privacidade & Armazenamento Seguro no Dispositivo</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Os dados clínicos e pessoais são cifrados com <strong>AES-GCM (256-bit)</strong> e chave derivada por <strong>PBKDF2</strong> diretamente no teu dispositivo. Nenhuma informação médica é transmitida pela internet ou guardada em texto simples.
          </p>
        </div>
      </div>
    </div>
  );
};
