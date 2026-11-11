/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  PatientHealthRecord,
  DailyHydrationEntry,
  HydrationConfig,
  Medication,
  MedicationDoseLog,
  MedicationDoseStatus,
  SymptomEntry,
  PersonalRoutine,
  RoutineCompletion,
  AppointmentEvent,
  UnifiedHistoryItem,
  HistoryCategory,
} from '../types/health';
import { useProfile } from './ProfileContext';
import {
  getEncryptedHealthRecord,
  saveEncryptedHealthRecord,
  migrateHealthRecordV1ToV2,
} from '../services/storage';
import {
  EncryptedPayloadV1,
  encryptDataV2,
  decryptData,
} from '../services/crypto';
import { DEMO_HEALTH_RECORD } from '../constants/demoHealthData';

interface HealthContextType {
  healthRecord: PatientHealthRecord | null;
  isLoading: boolean;
  saveError: string | null;

  // Accões de Hidratação
  addHydration: (amountMl: number, time?: string, date?: string, notes?: string) => Promise<void>;
  updateHydrationConfig: (targetMl: number, glassSizeMl?: number, notes?: string) => Promise<void>;
  updateHydrationEntry: (id: string, amountMl: number, time?: string, notes?: string) => Promise<void>;
  deleteHydrationEntry: (id: string) => Promise<void>;
  resetTodayHydration: () => Promise<void>;

  // Acções de Medicação
  addMedication: (med: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  logMedicationDose: (
    medicationId: string,
    scheduledTime: string,
    date: string,
    status: MedicationDoseStatus,
    notes?: string,
    postponedUntil?: string
  ) => Promise<void>;

  // Acções de Sintomas e Dor
  addSymptom: (symptom: Omit<SymptomEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateSymptom: (id: string, updates: Partial<SymptomEntry>) => Promise<void>;
  deleteSymptom: (id: string) => Promise<void>;

  // Acções de Rotinas
  addRoutine: (routine: Omit<PersonalRoutine, 'id' | 'createdAt'>) => Promise<void>;
  updateRoutine: (id: string, updates: Partial<PersonalRoutine>) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  toggleRoutineCompletion: (routineId: string, date: string) => Promise<void>;

  // Acções de Consultas / Compromissos
  addAppointment: (app: Omit<AppointmentEvent, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<AppointmentEvent>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Histórico Unificado
  getUnifiedHistory: (category?: HistoryCategory, period?: 'today' | '7days' | '30days' | 'all') => UnifiedHistoryItem[];
  deleteHistoryItem: (category: UnifiedHistoryItem['category'], originalRefId: string) => Promise<void>;

  // Valores Computados para Hoje
  todayDateStr: string;
  todayHydrationTotalMl: number;
  todayHydrationPercent: number;
  todayHydrationEntries: DailyHydrationEntry[];
  todayMedicationSchedule: Array<{
    medication: Medication;
    scheduledTime: string;
    log?: MedicationDoseLog;
    status: MedicationDoseStatus;
  }>;
  todayRoutinesStatus: Array<{
    routine: PersonalRoutine;
    isCompleted: boolean;
    completedAt?: string;
  }>;
  upcomingAppointments: AppointmentEvent[];
  recentSymptoms: SymptomEntry[];

  // Notificações e Lembretes
  isNotificationSupported: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  toggleNotificationsEnabled: () => void;
  sendDiscreetReminder: (title: string, body: string) => void;
}

function getLocalTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeProfile,
    isLocked,
    isDemoActive,
    getSessionPassphraseKey,
    getDerivedKeysMap,
    getSessionGeneration,
  } = useProfile();
  const [healthRecord, setHealthRecord] = useState<PatientHealthRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Referência em memória do registo de saúde mais recente para execução sequencial da fila
  const latestHealthRecordRef = useRef<PatientHealthRecord | null>(null);

  // Fila sequencial de promessas para prevenir edições simultâneas (lost updates)
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  // Armazena o salt estável do registo de saúde do perfil activo
  const activeHealthRecordSaltRef = useRef<string | undefined>(undefined);

  // Estado dinâmico para a data local de hoje
  const [todayDateStr, setTodayDateStr] = useState<string>(getLocalTodayDateStr);

  // Gestão de temporizador e ouvintes para viragem de dia à meia-noite e regresso a primeiro plano
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    const updateDateIfNeeded = () => {
      const newDateStr = getLocalTodayDateStr();
      setTodayDateStr((prev) => (prev !== newDateStr ? newDateStr : prev));
      scheduleMidnightTimer();
    };

    const scheduleMidnightTimer = () => {
      if (timerId) clearTimeout(timerId);
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        500
      );
      const msUntilMidnight = Math.max(1000, midnight.getTime() - now.getTime());
      timerId = setTimeout(() => {
        updateDateIfNeeded();
      }, msUntilMidnight);
    };

    scheduleMidnightTimer();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        updateDateIfNeeded();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  // Definições de notificação local
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const isNotificationSupported = typeof window !== 'undefined' && 'Notification' in window;
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    isNotificationSupported ? Notification.permission : 'unsupported'
  );

  const updateHealthRecordState = useCallback((record: PatientHealthRecord | null) => {
    latestHealthRecordRef.current = record;
    setHealthRecord(record);
  }, []);

  // 1. Carregar registo clínico ao desbloquear ou mudar de perfil
  useEffect(() => {
    let isCancelled = false;
    const currentGen = getSessionGeneration();
    const currentProfileId = activeProfile?.id;

    const loadRecords = async () => {
      if (isLocked || !activeProfile) {
        updateHealthRecordState(null);
        activeHealthRecordSaltRef.current = undefined;
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setSaveError(null);

      // A) MODO DEMO
      if (isDemoActive) {
        updateHealthRecordState(JSON.parse(JSON.stringify(DEMO_HEALTH_RECORD)));
        setIsLoading(false);
        return;
      }

      // B) PERFIL REAL: Decifrar do IndexedDB usando AES-GCM com AAD
      const passphraseKey = getSessionPassphraseKey();
      const derivedKeysMap = getDerivedKeysMap();

      if (!passphraseKey) {
        setSaveError('Sessão sem credencial criptográfica activa.');
        setIsLoading(false);
        return;
      }

      try {
        const encrypted = await getEncryptedHealthRecord(activeProfile.id);

        if (!encrypted) {
          // Inicializar novo registo limpo para este perfil
          const initialRecord: PatientHealthRecord = {
            profileId: activeProfile.id,
            hydrationConfig: {
              dailyTargetMl: 2000,
              glassSizeMl: 250,
              customNotes: 'Meta inicial. Ajuste conforme orientação da sua equipa de saúde.',
            },
            hydrationEntries: [],
            medications: [],
            medicationLogs: [],
            symptoms: [],
            routines: [],
            routineCompletions: [],
            appointments: [],
            updatedAt: new Date().toISOString(),
          };

          const payloadV2 = await encryptDataV2<PatientHealthRecord>(
            initialRecord,
            passphraseKey,
            activeProfile.id,
            'health_data',
            derivedKeysMap
          );

          await saveEncryptedHealthRecord(activeProfile.id, payloadV2);
          activeHealthRecordSaltRef.current = payloadV2.salt;

          if (
            !isCancelled &&
            getSessionGeneration() === currentGen &&
            activeProfile.id === currentProfileId
          ) {
            updateHealthRecordState(initialRecord);
          }
        } else {
          activeHealthRecordSaltRef.current = encrypted.salt;
          const decrypted = await decryptData<PatientHealthRecord>(
            encrypted,
            passphraseKey,
            activeProfile.id,
            'health_data',
            derivedKeysMap
          );

          if (
            !isCancelled &&
            getSessionGeneration() === currentGen &&
            activeProfile.id === currentProfileId
          ) {
            updateHealthRecordState(decrypted);
          }

          // Se o registo lido era V1, realizar a migração transaccional V1 -> V2 em background
          if (encrypted.version !== 2) {
            try {
              const newV2Payload = await encryptDataV2<PatientHealthRecord>(
                decrypted,
                passphraseKey,
                activeProfile.id,
                'health_data',
                derivedKeysMap,
                encrypted.salt
              );

              await migrateHealthRecordV1ToV2(
                activeProfile.id,
                encrypted as EncryptedPayloadV1,
                newV2Payload
              );
            } catch (err) {
              console.warn('Migração V1->V2 do registo de saúde adiada:', err);
            }
          }
        }
      } catch (err: unknown) {
        console.error('Erro ao decifrar registo de saúde:', err);
        if (
          !isCancelled &&
          getSessionGeneration() === currentGen &&
          activeProfile.id === currentProfileId
        ) {
          setSaveError('Não foi possível carregar os registos clínicos locais cifrados.');
        }
      } finally {
        if (!isCancelled && getSessionGeneration() === currentGen) {
          setIsLoading(false);
        }
      }
    };

    loadRecords();

    return () => {
      isCancelled = true;
    };
  }, [
    activeProfile,
    isLocked,
    isDemoActive,
    getSessionPassphraseKey,
    getDerivedKeysMap,
    getSessionGeneration,
    updateHealthRecordState,
  ]);

  // Executor de mutações sequenciais da fila com invalidação por sessão
  const enqueueRecordOperation = useCallback(
    (mutator: (currentRecord: PatientHealthRecord) => PatientHealthRecord): Promise<void> => {
      const currentGen = getSessionGeneration();
      const currentProfileId = activeProfile?.id;

      return new Promise<void>((resolve, reject) => {
        queueRef.current = queueRef.current
          .then(async () => {
            // Invalidação por token de geração de sessão e perfil activo
            if (
              getSessionGeneration() !== currentGen ||
              !activeProfile ||
              isLocked ||
              activeProfile.id !== currentProfileId
            ) {
              const err = new Error('Operação cancelada: a sessão foi encerrada ou alterada.');
              reject(err);
              return;
            }

            const currentRecord = latestHealthRecordRef.current;
            if (!currentRecord) {
              const err = new Error('Registo de saúde não disponível para alteração.');
              reject(err);
              return;
            }

            const updatedRecord = mutator(currentRecord);

            // Actualização imediata da referência em memória para acções subsequentes na fila
            latestHealthRecordRef.current = updatedRecord;

            if (isDemoActive) {
              setHealthRecord(updatedRecord);
              setSaveError(null);
              resolve();
              return;
            }

            const passphraseKey = getSessionPassphraseKey();
            const derivedKeysMap = getDerivedKeysMap();

            if (!passphraseKey) {
              setSaveError('Sessão bloqueada. As alterações não puderam ser cifradas.');
              reject(new Error('Sessão sem chave de cifragem.'));
              return;
            }

            try {
              const payloadV2 = await encryptDataV2<PatientHealthRecord>(
                updatedRecord,
                passphraseKey,
                activeProfile.id,
                'health_data',
                derivedKeysMap,
                activeHealthRecordSaltRef.current
              );

              await saveEncryptedHealthRecord(activeProfile.id, payloadV2);

              // Confirmação de estado apenas se a sessão continuar válida no final da gravação
              if (
                getSessionGeneration() === currentGen &&
                activeProfile &&
                activeProfile.id === currentProfileId
              ) {
                setHealthRecord(updatedRecord);
                setSaveError(null);
              }
              resolve();
            } catch (err: unknown) {
              console.error('Erro ao guardar registo clínico cifrado V2:', err);
              setSaveError('Falha de persistência segura no dispositivo.');
              reject(err);
            }
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    [activeProfile, isLocked, isDemoActive, getSessionPassphraseKey, getDerivedKeysMap, getSessionGeneration]
  );

  // --- ACÇÕES: HIDRATAÇÃO ---
  const addHydration = useCallback(
    async (amountMl: number, time?: string, date?: string, notes?: string) => {
      return enqueueRecordOperation((rec) => {
        const now = new Date();
        const entryTime = time || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const entryDate = date || todayDateStr;

        const newEntry: DailyHydrationEntry = {
          id: `hydro-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: entryDate,
          time: entryTime,
          amountMl,
          timestamp: Date.now(),
          notes: notes?.trim() || undefined,
        };

        return {
          ...rec,
          hydrationEntries: [newEntry, ...rec.hydrationEntries],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [todayDateStr, enqueueRecordOperation]
  );

  const updateHydrationConfig = useCallback(
    async (targetMl: number, glassSizeMl?: number, notes?: string) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        hydrationConfig: {
          dailyTargetMl: Math.max(500, Math.min(6000, targetMl)),
          glassSizeMl: glassSizeMl || rec.hydrationConfig.glassSizeMl || 250,
          customNotes: notes !== undefined ? notes : rec.hydrationConfig.customNotes,
        },
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const updateHydrationEntry = useCallback(
    async (id: string, amountMl: number, time?: string, notes?: string) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        hydrationEntries: rec.hydrationEntries.map((e) =>
          e.id === id
            ? {
                ...e,
                amountMl,
                time: time || e.time,
                notes: notes !== undefined ? notes : e.notes,
              }
            : e
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const deleteHydrationEntry = useCallback(
    async (id: string) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        hydrationEntries: rec.hydrationEntries.filter((e) => e.id !== id),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const resetTodayHydration = useCallback(async () => {
    return enqueueRecordOperation((rec) => ({
      ...rec,
      hydrationEntries: rec.hydrationEntries.filter((e) => e.date !== todayDateStr),
      updatedAt: new Date().toISOString(),
    }));
  }, [todayDateStr, enqueueRecordOperation]);

  // --- ACÇÕES: MEDICAÇÃO ---
  const addMedication = useCallback(
    async (med: Omit<Medication, 'id' | 'createdAt'>) => {
      return enqueueRecordOperation((rec) => {
        const newMed: Medication = {
          ...med,
          id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        return {
          ...rec,
          medications: [...rec.medications, newMed],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [enqueueRecordOperation]
  );

  const updateMedication = useCallback(
    async (id: string, updates: Partial<Medication>) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        medications: rec.medications.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        medications: rec.medications.filter((m) => m.id !== id),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const logMedicationDose = useCallback(
    async (
      medicationId: string,
      scheduledTime: string,
      date: string,
      status: MedicationDoseStatus,
      notes?: string,
      postponedUntil?: string
    ) => {
      return enqueueRecordOperation((rec) => {
        const med = rec.medications.find((m) => m.id === medicationId);
        const medName = med ? med.name : 'Medicamento';

        const existingIndex = rec.medicationLogs.findIndex(
          (l) => l.medicationId === medicationId && l.date === date && l.scheduledTime === scheduledTime
        );

        let newLogs: MedicationDoseLog[];

        if (existingIndex >= 0) {
          newLogs = [...rec.medicationLogs];
          newLogs[existingIndex] = {
            ...newLogs[existingIndex],
            status,
            loggedAt: new Date().toISOString(),
            notes: notes !== undefined ? notes : newLogs[existingIndex].notes,
            postponedUntil: postponedUntil || newLogs[existingIndex].postponedUntil,
          };
        } else {
          const newLog: MedicationDoseLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            medicationId,
            medicationName: medName,
            scheduledTime,
            date,
            status,
            loggedAt: new Date().toISOString(),
            notes,
            postponedUntil,
          };
          newLogs = [newLog, ...rec.medicationLogs];
        }

        return {
          ...rec,
          medicationLogs: newLogs,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [enqueueRecordOperation]
  );

  // --- ACÇÕES: SINTOMAS ---
  const addSymptom = useCallback(
    async (symptom: Omit<SymptomEntry, 'id' | 'createdAt'>) => {
      return enqueueRecordOperation((rec) => {
        const newEntry: SymptomEntry = {
          ...symptom,
          id: `symp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        return {
          ...rec,
          symptoms: [newEntry, ...rec.symptoms],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [enqueueRecordOperation]
  );

  const updateSymptom = useCallback(
    async (id: string, updates: Partial<SymptomEntry>) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        symptoms: rec.symptoms.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const deleteSymptom = useCallback(
    async (id: string) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        symptoms: rec.symptoms.filter((s) => s.id !== id),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  // --- ACÇÕES: ROTINAS ---
  const addRoutine = useCallback(
    async (routine: Omit<PersonalRoutine, 'id' | 'createdAt'>) => {
      return enqueueRecordOperation((rec) => {
        const newRoutine: PersonalRoutine = {
          ...routine,
          id: `rout-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        return {
          ...rec,
          routines: [...rec.routines, newRoutine],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [enqueueRecordOperation]
  );

  const updateRoutine = useCallback(
    async (id: string, updates: Partial<PersonalRoutine>) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        routines: rec.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const deleteRoutine = useCallback(
    async (id: string) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        routines: rec.routines.filter((r) => r.id !== id),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const toggleRoutineCompletion = useCallback(
    async (routineId: string, date: string) => {
      return enqueueRecordOperation((rec) => {
        const existing = rec.routineCompletions.find(
          (c) => c.routineId === routineId && c.date === date
        );

        let newCompletions: RoutineCompletion[];
        if (existing) {
          newCompletions = rec.routineCompletions.filter((c) => c.id !== existing.id);
        } else {
          const newComp: RoutineCompletion = {
            id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            routineId,
            date,
            completedAt: new Date().toISOString(),
          };
          newCompletions = [newComp, ...rec.routineCompletions];
        }

        return {
          ...rec,
          routineCompletions: newCompletions,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [enqueueRecordOperation]
  );

  // --- ACÇÕES: CONSULTAS ---
  const addAppointment = useCallback(
    async (app: Omit<AppointmentEvent, 'id' | 'createdAt'>) => {
      return enqueueRecordOperation((rec) => {
        const newApp: AppointmentEvent = {
          ...app,
          id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
        };
        return {
          ...rec,
          appointments: [...rec.appointments, newApp],
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [enqueueRecordOperation]
  );

  const updateAppointment = useCallback(
    async (id: string, updates: Partial<AppointmentEvent>) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        appointments: rec.appointments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      return enqueueRecordOperation((rec) => ({
        ...rec,
        appointments: rec.appointments.filter((a) => a.id !== id),
        updatedAt: new Date().toISOString(),
      }));
    },
    [enqueueRecordOperation]
  );

  // --- HISTÓRICO UNIFICADO ---
  const getUnifiedHistory = useCallback(
    (category: HistoryCategory = 'all', period: 'today' | '7days' | '30days' | 'all' = 'all'): UnifiedHistoryItem[] => {
      if (!healthRecord) return [];

      const items: UnifiedHistoryItem[] = [];
      const now = new Date();

      const isDateInPeriod = (dateStr: string): boolean => {
        if (period === 'all') return true;
        if (period === 'today') return dateStr === todayDateStr;
        const target = new Date(dateStr).getTime();
        const diffDays = (now.getTime() - target) / (1000 * 3600 * 24);
        if (period === '7days') return diffDays <= 7 && diffDays >= -1;
        if (period === '30days') return diffDays <= 30 && diffDays >= -1;
        return true;
      };

      if (category === 'all' || category === 'hydration') {
        healthRecord.hydrationEntries.forEach((h) => {
          if (!isDateInPeriod(h.date)) return;
          items.push({
            id: `hist-hydro-${h.id}`,
            date: h.date,
            time: h.time,
            category: 'hydration',
            title: `Registo de Hidratação: +${h.amountMl} ml`,
            subtitle: h.notes || 'Consumo de água registado',
            badge: {
              text: `${h.amountMl} ml`,
              color: 'bg-sky-100 text-sky-800',
            },
            originalRefId: h.id,
            rawItem: h,
          });
        });
      }

      if (category === 'all' || category === 'medication') {
        healthRecord.medicationLogs.forEach((l) => {
          if (!isDateInPeriod(l.date)) return;
          let statusText = 'Pendente';
          let statusColor = 'bg-stone-100 text-stone-700';

          if (l.status === 'taken') {
            statusText = 'Tomado';
            statusColor = 'bg-emerald-100 text-emerald-800';
          } else if (l.status === 'skipped') {
            statusText = 'Não tomado';
            statusColor = 'bg-amber-100 text-amber-800';
          } else if (l.status === 'postponed') {
            statusText = `Adiado${l.postponedUntil ? ` (${l.postponedUntil})` : ''}`;
            statusColor = 'bg-purple-100 text-purple-800';
          }

          items.push({
            id: `hist-med-${l.id}`,
            date: l.date,
            time: l.scheduledTime,
            category: 'medication',
            title: `Medicação: ${l.medicationName}`,
            subtitle: l.notes || `Horário programado: ${l.scheduledTime}`,
            badge: {
              text: statusText,
              color: statusColor,
            },
            originalRefId: l.id,
            rawItem: l,
          });
        });
      }

      if (category === 'all' || category === 'symptoms') {
        healthRecord.symptoms.forEach((s) => {
          if (!isDateInPeriod(s.date)) return;
          items.push({
            id: `hist-symp-${s.id}`,
            date: s.date,
            time: s.time,
            category: 'symptoms',
            title: `Sintoma: ${s.symptomType}`,
            subtitle: `Dor ${s.painScore}/10 · ${s.locations.join(', ')} · ${s.duration}`,
            details: s.notes || (s.reliefMeasures ? `Alívio: ${s.reliefMeasures}` : undefined),
            badge: {
              text: `Dor ${s.painScore}/10`,
              color: s.painScore >= 6 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800',
            },
            originalRefId: s.id,
            rawItem: s,
          });
        });
      }

      if (category === 'all' || category === 'routines') {
        healthRecord.routineCompletions.forEach((c) => {
          if (!isDateInPeriod(c.date)) return;
          const rout = healthRecord.routines.find((r) => r.id === c.routineId);
          const routTitle = rout ? rout.title : 'Cuidado Pessoal';
          const time = c.completedAt ? c.completedAt.split('T')[1].substring(0, 5) : '00:00';

          items.push({
            id: `hist-rout-${c.id}`,
            date: c.date,
            time,
            category: 'routines',
            title: `Cuidado Concluído: ${routTitle}`,
            subtitle: rout?.description || 'Actividade diária cumprida com sucesso',
            badge: {
              text: 'Concluído',
              color: 'bg-emerald-100 text-emerald-800',
            },
            originalRefId: c.id,
            rawItem: c,
          });
        });
      }

      if (category === 'all' || category === 'appointments') {
        healthRecord.appointments.forEach((a) => {
          if (!isDateInPeriod(a.date)) return;
          let badgeText = 'Agendado';
          let badgeColor = 'bg-sky-100 text-sky-800';
          if (a.status === 'completed') {
            badgeText = 'Realizado';
            badgeColor = 'bg-emerald-100 text-emerald-800';
          } else if (a.status === 'cancelled') {
            badgeText = 'Cancelado';
            badgeColor = 'bg-stone-100 text-stone-600';
          }

          items.push({
            id: `hist-app-${a.id}`,
            date: a.date,
            time: a.time,
            category: 'appointments',
            title: a.title,
            subtitle: `${a.facility}${a.professional ? ` · ${a.professional}` : ''}`,
            details: a.description,
            badge: {
              text: badgeText,
              color: badgeColor,
            },
            originalRefId: a.id,
            rawItem: a,
          });
        });
      }

      return items.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (b.time || '00:00').localeCompare(a.time || '00:00');
      });
    },
    [healthRecord, todayDateStr]
  );

  const deleteHistoryItem = useCallback(
    async (category: UnifiedHistoryItem['category'], originalRefId: string) => {
      if (category === 'hydration') {
        await deleteHydrationEntry(originalRefId);
      } else if (category === 'symptoms') {
        await deleteSymptom(originalRefId);
      } else if (category === 'appointments') {
        await deleteAppointment(originalRefId);
      } else if (category === 'routines') {
        await enqueueRecordOperation((rec) => ({
          ...rec,
          routineCompletions: rec.routineCompletions.filter((c) => c.id !== originalRefId),
          updatedAt: new Date().toISOString(),
        }));
      } else if (category === 'medication') {
        await enqueueRecordOperation((rec) => ({
          ...rec,
          medicationLogs: rec.medicationLogs.filter((l) => l.id !== originalRefId),
          updatedAt: new Date().toISOString(),
        }));
      }
    },
    [deleteHydrationEntry, deleteSymptom, deleteAppointment, enqueueRecordOperation]
  );

  // --- VALORES COMPUTADOS PARA HOJE ---
  const todayHydrationEntries = useMemo(() => {
    if (!healthRecord) return [];
    return healthRecord.hydrationEntries.filter((h) => h.date === todayDateStr);
  }, [healthRecord, todayDateStr]);

  const todayHydrationTotalMl = useMemo(() => {
    return todayHydrationEntries.reduce((sum, e) => sum + e.amountMl, 0);
  }, [todayHydrationEntries]);

  const todayHydrationPercent = useMemo(() => {
    if (!healthRecord) return 0;
    const target = healthRecord.hydrationConfig.dailyTargetMl || 2000;
    return Math.min(100, Math.round((todayHydrationTotalMl / target) * 100));
  }, [healthRecord, todayHydrationTotalMl]);

  const todayMedicationSchedule = useMemo(() => {
    if (!healthRecord) return [];
    const scheduleItems: Array<{
      medication: Medication;
      scheduledTime: string;
      log?: MedicationDoseLog;
      status: MedicationDoseStatus;
    }> = [];

    const activeMeds = healthRecord.medications.filter((m) => m.status === 'active');

    activeMeds.forEach((med) => {
      if (med.frequency === 'specific_days' && med.specificDays) {
        const dayOfWeek = new Date().getDay();
        if (!med.specificDays.includes(dayOfWeek)) return;
      }

      med.schedules.forEach((time) => {
        const log = healthRecord.medicationLogs.find(
          (l) => l.medicationId === med.id && l.date === todayDateStr && l.scheduledTime === time
        );
        scheduleItems.push({
          medication: med,
          scheduledTime: time,
          log,
          status: log ? log.status : 'pending',
        });
      });
    });

    return scheduleItems.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [healthRecord, todayDateStr]);

  const todayRoutinesStatus = useMemo(() => {
    if (!healthRecord) return [];
    const activeRoutines = healthRecord.routines.filter((r) => r.isActive);
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return activeRoutines
      .filter((r) => {
        if (r.frequency === 'weekdays' && isWeekend) return false;
        if (r.frequency === 'weekends' && !isWeekend) return false;
        return true;
      })
      .map((routine) => {
        const comp = healthRecord.routineCompletions.find(
          (c) => c.routineId === routine.id && c.date === todayDateStr
        );
        return {
          routine,
          isCompleted: !!comp,
          completedAt: comp?.completedAt,
        };
      })
      .sort((a, b) => a.routine.time.localeCompare(b.routine.time));
  }, [healthRecord, todayDateStr]);

  const upcomingAppointments = useMemo(() => {
    if (!healthRecord) return [];
    return healthRecord.appointments
      .filter((a) => a.date >= todayDateStr && a.status === 'scheduled')
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.time.localeCompare(b.time);
      });
  }, [healthRecord, todayDateStr]);

  const recentSymptoms = useMemo(() => {
    if (!healthRecord) return [];
    return [...healthRecord.symptoms]
      .sort((a, b) => {
        const d = b.date.localeCompare(a.date);
        return d !== 0 ? d : b.time.localeCompare(a.time);
      })
      .slice(0, 5);
  }, [healthRecord]);

  // --- NOTIFICAÇÕES LOCALMENTE ---
  const requestNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (!isNotificationSupported) return false;
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [isNotificationSupported]);

  const toggleNotificationsEnabled = useCallback(() => {
    if (!notificationsEnabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    } else {
      setNotificationsEnabled((prev) => !prev);
    }
  }, [notificationsEnabled, notificationPermission, requestNotificationPermission]);

  const sendDiscreetReminder = useCallback(
    (title: string, body: string) => {
      if (!isNotificationSupported || notificationPermission !== 'granted' || !notificationsEnabled) {
        return;
      }
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Falha ao emitir notificação local:', err);
      }
    },
    [isNotificationSupported, notificationPermission, notificationsEnabled]
  );

  return (
    <HealthContext.Provider
      value={{
        healthRecord,
        isLoading,
        saveError,
        addHydration,
        updateHydrationConfig,
        updateHydrationEntry,
        deleteHydrationEntry,
        resetTodayHydration,
        addMedication,
        updateMedication,
        deleteMedication,
        logMedicationDose,
        addSymptom,
        updateSymptom,
        deleteSymptom,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        toggleRoutineCompletion,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getUnifiedHistory,
        deleteHistoryItem,
        todayDateStr,
        todayHydrationTotalMl,
        todayHydrationPercent,
        todayHydrationEntries,
        todayMedicationSchedule,
        todayRoutinesStatus,
        upcomingAppointments,
        recentSymptoms,
        isNotificationSupported,
        notificationPermission,
        notificationsEnabled,
        requestNotificationPermission,
        toggleNotificationsEnabled,
        sendDiscreetReminder,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth deve ser utilizado dentro de um HealthProvider');
  }
  return context;
}
