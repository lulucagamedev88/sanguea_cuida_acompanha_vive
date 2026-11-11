/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NavigationModule = 
  | 'dashboard'
  | 'profile'
  | 'care'
  | 'calendar'
  | 'history'
  | 'sos'
  | 'ai'
  | 'game'
  | 'about'
  | 'creator'
  | 'thanks';

export type SickleCellType = 
  | 'HbSS'
  | 'HbSC'
  | 'HbS/β⁰-talassemia'
  | 'HbS/β⁺-talassemia'
  | 'Outro tipo confirmado'
  | 'Não sei / Ainda não confirmado'
  | 'HbSS (Anemia Falciforme)'
  | 'HbSC (Doença da Hemoglobina SC)'
  | 'HbS/Beta0-Talassemia'
  | 'HbS/Beta+-Talassemia';

export interface UserProfile {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  age: number; // calculated from birthDate
  ageGroup: 'Criança' | 'Adolescente' | 'Adulto';
  gender: 'Masculino' | 'Feminino';
  avatarId: string;
  sickleCellType: string;
  customSickleCellType?: string;
  isChild: boolean;
  isUnderCare: boolean;
  phone?: string;
  email?: string;
  caregiver?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  bloodType?: string;
  phenotype?: string;
  hospital?: string;
  specialistDoctor?: string;
  baselineHemoglobin?: string;
  allergies?: string;
  createdAt: string;
  updatedAt: string;
}

export type PatientProfile = UserProfile;

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  purpose: string;
  timeSchedule: string;
  status: 'taken' | 'pending' | 'sos';
  notes?: string;
}

export interface HydrationLog {
  targetMl: number;
  currentMl: number;
  glassSizeMl: number;
  glassesCount: number;
  totalGlassesTarget: number;
  lastDrinkTime: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  category: 'consultation' | 'exam' | 'transfusion' | 'care' | 'routine';
  location: string;
  doctorOrService?: string;
  description: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface MedicalRecord {
  id: string;
  date: string;
  category: 'consultation' | 'exam' | 'transfusion' | 'hospitalization' | 'other';
  title: string;
  facility: string;
  professional: string;
  keyFindings: string;
  documentsCount: number;
  status: 'completed' | 'scheduled';
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  availableHours: string;
  isPrimary?: boolean;
}

export interface HealthcareCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  emergencyUnit: string;
  hasPediatricHematology: boolean;
}

// Interfaces para a Fase 4: Backup e Restauro Cifrados
export interface BackupProfilePackage {
  meta: import('../services/storage').ProfileMetadata;
  profileData: UserProfile;
  healthData: import('./health').PatientHealthRecord | null;
}

export interface BackupPayloadData {
  backupId: string;
  exportedAt: string;
  profileCount: number;
  profiles: BackupProfilePackage[];
  appSettings?: Record<string, unknown>;
}

export interface SangueaBackupFile {
  format: 'SANGUEA_BACKUP';
  version: 1;
  createdAt: string;
  appVersion: string;
  crypto: {
    algorithm: 'AES-GCM';
    keyLength: 256;
    kdf: 'PBKDF2';
    kdfHash: 'SHA-256';
    iterations: number;
    salt: string;
    iv: string;
  };
  ciphertext: string;
}

export * from './health';
