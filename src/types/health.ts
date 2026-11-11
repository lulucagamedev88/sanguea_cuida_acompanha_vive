/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Definições de tipos para a Fase 3 de Sanguéa: Cuidados e Acompanhamento Diário
 */

// --- 1. HIDRATAÇÃO ---
export interface DailyHydrationEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amountMl: number;
  timestamp: number;
  notes?: string;
}

export interface HydrationConfig {
  dailyTargetMl: number; // Configurado individualmente pelo utilizador/cuidador
  glassSizeMl: number; // Tamanho padrão do copo (ex: 250ml)
  customNotes?: string;
}

// --- 2. MEDICAÇÃO ---
export type MedicationFrequency = 'daily' | 'interval' | 'specific_days' | 'sos';

export interface Medication {
  id: string;
  name: string;
  dosage: string; // Ex: "500", "1", "10"
  unit: string; // Ex: "mg", "cápsula(s)", "comprimido(s)", "ml", "gotas"
  schedules: string[]; // Horários programados (Ex: ["08:30", "20:30"])
  frequency: MedicationFrequency;
  intervalHours?: number; // Se frequency === 'interval' (Ex: de 8 em 8 horas)
  specificDays?: number[]; // Se frequency === 'specific_days' (0=Domingo, 1=Segunda, ...)
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (opcional)
  notes?: string; // Ex: "Tomar de manhã com um copo cheio de água"
  status: 'active' | 'suspended';
  createdAt: string;
}

export type MedicationDoseStatus = 'taken' | 'skipped' | 'postponed' | 'pending';

export interface MedicationDoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string; // HH:mm
  date: string; // YYYY-MM-DD
  status: MedicationDoseStatus;
  loggedAt?: string; // ISO string do momento em que a acção foi registada
  notes?: string;
  postponedUntil?: string; // HH:mm se adiada
}

// --- 3. SINTOMAS E DOR ---
export interface SymptomEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  symptomType: string; // Ex: "Dor articular / óssea", "Febre", "Fadiga acentuada", etc.
  painScore: number; // Escala 0 a 10
  locations: string[]; // Ex: ["Pernas / Joelhos", "Costas"]
  duration: string; // Ex: "Menos de 1 hora", "1 a 3 horas", "Constante ao longo do dia"
  triggers?: string[]; // Ex: "Frio intenso", "Desidratação", "Esforço físico", "Stress"
  reliefMeasures?: string; // Ex: "Repouso e hidratação oral reforçada"
  notes?: string; // Observações pessoais
  createdAt: string;
}

// --- 4. ROTINAS E CUIDADOS PESSOAIS ---
export type RoutineCategory = 'hydration' | 'medication' | 'rest' | 'consultation' | 'care' | 'other';
export type RoutineFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';

export interface PersonalRoutine {
  id: string;
  title: string;
  description?: string;
  time: string; // HH:mm
  category: RoutineCategory;
  frequency: RoutineFrequency;
  startDate: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO string
}

// --- 5. COMPROMISSOS E CONSULTAS ---
export type AppointmentCategory = 'consultation' | 'exam' | 'transfusion' | 'care' | 'routine';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface AppointmentEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: AppointmentCategory;
  facility: string; // Ex: "Hospital Pediátrico David Bernardino"
  professional?: string; // Ex: "Dr.ª Luísa Panzo"
  description?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

// --- 6. REGISTO DE SAÚDE COMPLETO POR PERFIL ---
export interface PatientHealthRecord {
  profileId: string;
  hydrationConfig: HydrationConfig;
  hydrationEntries: DailyHydrationEntry[];
  medications: Medication[];
  medicationLogs: MedicationDoseLog[];
  symptoms: SymptomEntry[];
  routines: PersonalRoutine[];
  routineCompletions: RoutineCompletion[];
  appointments: AppointmentEvent[];
  updatedAt: string;
}

// --- 7. HISTÓRICO UNIFICADO ---
export type HistoryCategory = 'all' | 'hydration' | 'medication' | 'symptoms' | 'routines' | 'appointments';

export interface UnifiedHistoryItem {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  category: 'hydration' | 'medication' | 'symptoms' | 'routines' | 'appointments';
  title: string;
  subtitle: string;
  details?: string;
  badge?: {
    text: string;
    color: string;
  };
  originalRefId: string;
  rawItem: DailyHydrationEntry | MedicationDoseLog | SymptomEntry | RoutineCompletion | AppointmentEvent;
}
