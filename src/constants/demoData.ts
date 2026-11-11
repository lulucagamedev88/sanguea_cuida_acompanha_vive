/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PatientProfile,
  MedicationItem,
  HydrationLog,
  CalendarEvent,
  MedicalRecord,
  EmergencyContact,
  HealthcareCenter,
} from '../types';

export const DEMO_PATIENT: PatientProfile = {
  id: 'patient-demo-01',
  name: 'Mariana Costa Silva',
  birthDate: '2014-05-18',
  age: 12,
  ageGroup: 'Criança',
  gender: 'Feminino',
  sickleCellType: 'HbSS',
  avatarId: 'child-girl-braids',
  isChild: true,
  isUnderCare: true,
  caregiver: {
    name: 'Helena Costa Silva',
    relationship: 'Mãe',
    phone: '+244 923 456 789',
    email: 'helena.silva@exemplo.ao',
  },
  bloodType: 'O Rh+ (Positivo)',
  phenotype: 'C- c+ E- e+ K- (Compatibilidade estendida)',
  hospital: 'Hospital Pediátrico David Bernardino — Centro de Anemia Falciforme',
  specialistDoctor: 'Dr.ª Luísa Panzo (Hematologista Pediátrica)',
  baselineHemoglobin: '8.2 – 8.6 g/dL',
  allergies: 'Sem alergias medicamentosas conhecidas',
  createdAt: '2026-01-10T10:00:00Z',
  updatedAt: '2026-11-09T10:00:00Z',
};

export const DEMO_AVATARS = [
  { id: 'avatar-1', label: 'Mariana (Criança / Menina)', color: 'bg-rose-100 text-rose-700', initials: 'MS', emoji: '👧' },
  { id: 'avatar-2', label: 'Lucas (Rapaz)', color: 'bg-sky-100 text-sky-700', initials: 'LS', emoji: '👦' },
  { id: 'avatar-3', label: 'Sofia (Jovem)', color: 'bg-amber-100 text-amber-700', initials: 'SS', emoji: '👩' },
  { id: 'avatar-4', label: 'André (Adulto)', color: 'bg-emerald-100 text-emerald-700', initials: 'AS', emoji: '👨' },
];

export const DEMO_HYDRATION: HydrationLog = {
  targetMl: 2250,
  currentMl: 1500,
  glassSizeMl: 250,
  glassesCount: 6,
  totalGlassesTarget: 9,
  lastDrinkTime: 'Há 35 minutos',
};

export const DEMO_MEDICATIONS: MedicationItem[] = [
  {
    id: 'med-1',
    name: 'Hidroxiureia',
    dosage: '500 mg (1 cápsula)',
    purpose: 'Indutor de Hemoglobina Fetal (HbF) e prevenção de crises',
    timeSchedule: '08:30',
    status: 'taken',
    notes: 'Tomar de manhã com um copo cheio de água.',
  },
  {
    id: 'med-2',
    name: 'Ácido Fólico',
    dosage: '5 mg (1 comprimido)',
    purpose: 'Apoio à produção contínua de glóbulos vermelhos',
    timeSchedule: '08:30',
    status: 'taken',
    notes: 'Suplementação diária para eritropoiese.',
  },
  {
    id: 'med-3',
    name: 'Paracetamol (Em caso de dor ligeira)',
    dosage: '500 mg (conforme prescrição)',
    purpose: 'Analgesia de primeiro nível para desconforto ligeiro',
    timeSchedule: 'Em caso de necessidade (SOS)',
    status: 'sos',
    notes: 'Apenas se dor articular ou muscular ligeira. Não ultrapassar 3 doses/dia.',
  },
];

export const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Consulta de Hematologia de Rotina',
    date: '2026-11-14',
    time: '10:30',
    category: 'consultation',
    location: 'Hospital de Santa Maria — Consulta Externa',
    doctorOrService: 'Dr.ª Teresa Antunes',
    description: 'Avaliação trimestral do hemograma, crescimento e adesão à hidroxiureia.',
    status: 'upcoming',
  },
  {
    id: 'ev-2',
    title: 'Ecodoppler Transcraniano (DTC)',
    date: '2026-11-28',
    time: '14:00',
    category: 'exam',
    location: 'Serviço de Imagiologia Pediátrica',
    doctorOrService: 'Dr. Manuel Ribeiro',
    description: 'Vigilância anual de fluxo cerebral para rastreio primário do risco de AVC.',
    status: 'upcoming',
  },
  {
    id: 'ev-3',
    title: 'Análises de Controlo (Hemograma + Ferritina)',
    date: '2026-11-12',
    time: '08:45',
    category: 'exam',
    location: 'Laboratório Central de Patologia Clínica',
    doctorOrService: 'Posto de Colheitas',
    description: 'Controlo rotineiro pré-consulta: reticulócitos, hemoglobina e função renal.',
    status: 'upcoming',
  },
  {
    id: 'ev-4',
    title: 'Consulta de Oftalmologia (Fundo de Olho)',
    date: '2026-12-05',
    time: '11:15',
    category: 'consultation',
    location: 'Hospital de Santa Maria — Oftalmologia',
    doctorOrService: 'Dr.ª Leonor Vasconcelos',
    description: 'Vigilância da retina para prevenção de retinopatia falciforme.',
    status: 'upcoming',
  },
  {
    id: 'ev-5',
    title: 'Sessão de Fisioterapia Preventiva',
    date: '2026-11-10',
    time: '16:00',
    category: 'routine',
    location: 'Clínica de Reabilitação Pediátrica',
    doctorOrService: 'Fisioterapeuta Rita Mendes',
    description: 'Mobilidade articular e relaxamento muscular pós-escola.',
    status: 'upcoming',
  },
];

export const DEMO_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    date: '2026-09-18',
    category: 'consultation',
    title: 'Consulta Trimestral de Hematologia',
    facility: 'Hospital de Santa Maria',
    professional: 'Dr.ª Teresa Antunes',
    keyFindings: 'Excelente adesão à terapêutica com hidroxiureia. Hb estável em 8.5 g/dL. Sem crises nos últimos 4 meses.',
    documentsCount: 2,
    status: 'completed',
  },
  {
    id: 'rec-2',
    date: '2026-09-15',
    category: 'exam',
    title: 'Hemograma Completo e Bioquímica',
    facility: 'Laboratório Central HSM',
    professional: 'Patologia Clínica',
    keyFindings: 'Hemoglobina: 8.5 g/dL | Reticulócitos: 8.2% | Plaquetas: 320.000/uL | Ferritina: 180 ng/mL.',
    documentsCount: 1,
    status: 'completed',
  },
  {
    id: 'rec-3',
    date: '2026-06-22',
    category: 'exam',
    title: 'Ecodoppler Transcraniano de Rastreio',
    facility: 'Neurorradiologia Pediátrica',
    professional: 'Dr. Manuel Ribeiro',
    keyFindings: 'Velocidade máxima na artéria cerebral média: 145 cm/s (Norma < 170 cm/s — Baixo Risco).',
    documentsCount: 1,
    status: 'completed',
  },
  {
    id: 'rec-4',
    date: '2026-01-14',
    category: 'hospitalization',
    title: 'Internamento por Crise Vaso-Oclusiva (Ossos Longos)',
    facility: 'Enfermaria de Pediatria Médica — HSM',
    professional: 'Equipa de Pediatria de Serviço',
    keyFindings: 'Crise de dor em membros inferiores precipitada por infecção respiratória ligeira. Hidratação EV e analgesia com boa resolução ao fim de 3 dias.',
    documentsCount: 3,
    status: 'completed',
  },
  {
    id: 'rec-5',
    date: '2025-11-04',
    category: 'transfusion',
    title: 'Transfusão Simples de Concentrado de Eritrócitos',
    facility: 'Serviço de Imunohemoterapia HSM',
    professional: 'Dr.ª Clara Pires',
    keyFindings: 'Transfusão fenocompatível simples de 1 unidade (250 mL). Hb pré: 6.8 g/dL -> Hb pós: 9.6 g/dL. Sem reacções adversas.',
    documentsCount: 1,
    status: 'completed',
  },
];

export const DEMO_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'em-1',
    name: 'Helena Costa Silva (Mãe)',
    role: 'Cuidadora Principal',
    phone: '+244 923 456 789',
    availableHours: '24 horas / Sempre disponível',
    isPrimary: true,
  },
  {
    id: 'em-2',
    name: 'Carlos Alberto Silva (Pai)',
    role: 'Cuidador Secundário',
    phone: '+244 912 345 678',
    availableHours: '24 horas / Sempre disponível',
    isPrimary: false,
  },
  {
    id: 'em-3',
    name: 'Dr.ª Luísa Panzo',
    role: 'Médica Hematologista (HPDB)',
    phone: '+244 924 556 778',
    availableHours: 'Dias úteis: 08:00 - 15:30',
    isPrimary: false,
  },
  {
    id: 'em-4',
    name: 'CISP — Polícia Nacional & Emergência Geral',
    role: 'Centro Integrado de Segurança Pública',
    phone: '111',
    availableHours: '24h / 7 dias por semana (Gratuito)',
    isPrimary: true,
  },
  {
    id: 'em-5',
    name: 'INEMA — Emergência Médica de Angola',
    role: 'Socorro Médico de Urgência e Ambulâncias',
    phone: '112',
    availableHours: '24h / 7 dias por semana (Gratuito)',
    isPrimary: true,
  },
];

export const DEMO_HEALTHCARE_CENTROS: HealthcareCenter[] = [
  {
    id: 'hc-1',
    name: 'Hospital Pediátrico David Bernardino (HPDB)',
    type: 'Centro de Referência Nacional em Anemia Falciforme Pediátrica',
    address: 'Rua Amílcar Cabral, Maianga, Luanda',
    phone: '+244 222 334 500',
    emergencyUnit: 'Banco de Urgência Pediátrica 24h & Bloco de Hematologia',
    hasPediatricHematology: true,
  },
  {
    id: 'hc-2',
    name: 'Complexo Hospitalar Cardeal Dom Alexandre do Nascimento',
    type: 'Hospital Universitário e Centro de Doenças do Sangue',
    address: 'Av. 21 de Janeiro, Morro Bento, Luanda',
    phone: '+244 923 100 200',
    emergencyUnit: 'Serviço de Urgência Especializada em Hematologia',
    hasPediatricHematology: true,
  },
  {
    id: 'hc-3',
    name: 'Hospital Geral de Luanda (HGL)',
    type: 'Hospital Central Provincial',
    address: 'Município do Kilamba Kiaxi, Luanda',
    phone: '+244 222 391 122',
    emergencyUnit: 'Banco de Urgência Geral e Pediatria',
    hasPediatricHematology: true,
  },
  {
    id: 'hc-4',
    name: 'Hospital Américo Boavida (HAB)',
    type: 'Hospital Central Universitário',
    address: 'Rua Américo Boavida, Rangel, Luanda',
    phone: '+244 222 445 566',
    emergencyUnit: 'Serviço de Urgência de Medicina Interna e Pediatria',
    hasPediatricHematology: false,
  },
];

export const PAIN_SCALE_ITEMS = [
  { score: 0, label: 'Sem dor', emoji: '😊', description: 'Mariana sente-se bem, confortável e sem qualquer dor.' },
  { score: 2, label: 'Dor ligeira', emoji: '🙂', description: 'Desconforto pequeno, permite brincar e estudar sem problema.' },
  { score: 4, label: 'Dor moderada', emoji: '😐', description: 'Dor perceptível. Pode precisar de repouso e analgesia ligeira.' },
  { score: 6, label: 'Dor intensa', emoji: '😟', description: 'Dificulta a concentração e movimentos. Avisar cuidador.' },
  { score: 8, label: 'Muito intensa', emoji: '😣', description: 'Dor severa em ossos ou articulações. Iniciar protocolo médico.' },
  { score: 10, label: 'Dor insuportável', emoji: '😭', description: 'Crise aguda severa. Contactar equipa médica ou SOS imediatamente.' },
];

export const COMMON_PAIN_LOCATIONS = [
  { id: 'legs', label: 'Pernas / Joelhos (Ossos longos)' },
  { id: 'arms', label: 'Braços / Ombros' },
  { id: 'back', label: 'Costas / Coluna lombar' },
  { id: 'chest', label: 'Peito / Tórax (Atenção prioritária)' },
  { id: 'abdomen', label: 'Abdómen / Barriga' },
  { id: 'hands_feet', label: 'Mãos / Pés (Dactilite)' },
];
