/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Laptop,
  Lock,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { useInterfaceAudio } from '../../context/InterfaceAudioContext';

export const RemindersSection: React.FC = () => {
  const {
    isNotificationSupported,
    notificationPermission,
    notificationsEnabled,
    requestNotificationPermission,
    toggleNotificationsEnabled,
    sendDiscreetReminder,
  } = useHealth();
  const { playEnterSound } = useInterfaceAudio();

  const [testSent, setTestSent] = useState(false);

  const handleTestNotification = () => {
    playEnterSound();
    sendDiscreetReminder(
      'Sanguea · Lembrete de Cuidado',
      'Hora programada para o seu cuidado diário. Abra a aplicação para registar.'
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-[var(--app-surface)] rounded-3xl p-6 sm:p-7 border border-[var(--app-border)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--app-text)]">
                Lembretes Locais e Notificações no Dispositivo
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Avisos pontuais para tomas de medicação, rotinas e horários de hidratação
              </p>
            </div>
          </div>

          {/* Toggle Control */}
          <div className="flex items-center gap-2">
            {!isNotificationSupported ? (
              <span className="text-xs font-semibold text-[var(--app-text-muted)] bg-[var(--app-bg)] px-3 py-1.5 rounded-xl border border-[var(--app-border)]">
                Não suportado neste navegador
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playEnterSound();
                  toggleNotificationsEnabled();
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-xs ${
                  notificationsEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[var(--app-text)] hover:opacity-90 text-[var(--app-bg)]'
                }`}
              >
                {notificationsEnabled ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lembretes Activos</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Activar Lembretes</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--app-text)] opacity-80">Estado da Permissão do Sistema:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : notificationPermission === 'denied'
                  ? 'bg-rose-500/10 text-rose-600'
                  : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              {notificationPermission === 'granted'
                ? 'Autorizado pelo Utilizador'
                : notificationPermission === 'denied'
                ? 'Bloqueado nas Definições do Navegador'
                : 'Pendente de Autorização'}
            </span>
          </div>

          {notificationPermission === 'granted' && (
            <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between">
              <span className="text-xs text-[var(--app-text-muted)]">
                Verificar o funcionamento no ecrã do seu dispositivo:
              </span>
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-surface)] text-[var(--app-text)] text-xs font-semibold transition shadow-2xs"
              >
                {testSent ? '✓ Notificação Enviada!' : 'Testar Notificação'}
              </button>
            </div>
          )}
        </div>

        {/* Privacy Safeguard for Lock Screen */}
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-[var(--app-text)] space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-purple-600">
            <Lock className="w-4 h-4" />
            <span>Salvaguarda de Privacidade no Ecrã Bloqueado:</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Para proteger a sua confidencialidade médica perante terceiros que possam olhar para o seu telemóvel ou computador, as notificações emitidas por Sanguea são sempre <strong>discretas</strong>. Apresentam apenas «<em>Sanguea: hora do seu cuidado programado</em>», sem exibir nomes de medicamentos, diagnósticos ou dados clínicos no ecrã de bloqueio.
          </p>
        </div>

        {/* Technical Limitations and Offline Architecture Explanation */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-[var(--app-text)] block">
            Funcionamento e Otimização para Dispositivos Android:
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-[var(--app-text)] opacity-90">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>Smartphones Android (PWA / APK):</span>
              </div>
              <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                Lembretes executados de forma integrada no sistema móvel. Recomenda-se desativar as otimizações agressivas de bateria para o Sanguéa nas definições do Android para assegurar disparos pontuais de tomas e hidratação.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-bg)] border border-[var(--app-border)] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-[var(--app-text)] opacity-90">
                <Smartphone className="w-4 h-4 text-indigo-500 rotate-90" />
                <span>Tablets Android (Ecrã Amplo):</span>
              </div>
              <p className="text-[11px] text-[var(--app-text-muted)] leading-relaxed">
                Compatibilidade plena tanto na orientação vertical como horizontal. As notificações locais respeitam a área de estado e privacidade do tablet, mantendo o resumo discreto e seguro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
