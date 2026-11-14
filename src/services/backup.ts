/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SangueaBackupFile,
  BackupPayloadData,
  BackupProfilePackage,
  UserProfile,
} from '../types';
import { PatientHealthRecord } from '../types/health';
import {
  ProfileMetadata,
  saveProfileRecord,
  getEncryptedRecord,
  getEncryptedHealthRecord,
  getAllProfilesMetadata,
  StoredEncryptedRecord,
  StoredEncryptedHealthRecord,
} from './storage';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  importPassphraseKey,
  encryptDataV2,
  decryptData,
  EncryptedPayloadV1,
  EncryptedPayloadV2,
} from './crypto';
import { isValidProfilePhotoDataUrl } from '../utils/imageProcessor';

export const DEFAULT_PBKDF2_BACKUP_ITERATIONS = 600000;
export const MAX_BACKUP_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_BACKUP_PROFILES_COUNT = 20;

const DB_NAME = 'sanguea_secure_db';
const STORE_PROFILES_META = 'profiles_meta';
const STORE_ENCRYPTED = 'encrypted_profiles';
const STORE_ENCRYPTED_HEALTH = 'encrypted_health_data';

/**
 * Constrói o AAD (Additional Authenticated Data) canónico e determinístico do envelope de backup.
 */
export function buildCanonicalBackupAAD(cryptoParams: {
  format: 'SANGUEA_BACKUP';
  version: 1;
  algorithm: 'AES-GCM';
  keyLength: 256;
  kdf: 'PBKDF2';
  kdfHash: 'SHA-256';
  iterations: number;
  salt: string;
  iv: string;
}): Uint8Array {
  const canonicalString = JSON.stringify({
    format: cryptoParams.format,
    version: cryptoParams.version,
    algorithm: cryptoParams.algorithm,
    keyLength: cryptoParams.keyLength,
    kdf: cryptoParams.kdf,
    kdfHash: cryptoParams.kdfHash,
    iterations: cryptoParams.iterations,
    salt: cryptoParams.salt,
    iv: cryptoParams.iv,
  });
  return new TextEncoder().encode(canonicalString);
}

/**
 * Deriva a CryptoKey AES-GCM de 256 bits para o backup usando PBKDF2 HMAC-SHA-256.
 */
export async function deriveBackupAESKey(
  passphrase: string,
  saltBytes: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const passphraseKey = await importPassphraseKey(passphrase);
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    passphraseKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Cifra o payload de backup em formato AES-GCM-256 com AAD canónico e mede a duração real da execução.
 */
export async function encryptBackupPayload(
  payload: BackupPayloadData,
  passphrase: string,
  customIterations: number = DEFAULT_PBKDF2_BACKUP_ITERATIONS
): Promise<{ backupFile: SangueaBackupFile; durationMs: number }> {
  const startTime = performance.now();

  const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));
  const saltBase64 = arrayBufferToBase64(saltBytes.buffer);
  const ivBase64 = arrayBufferToBase64(ivBytes.buffer);

  const cryptoHeader = {
    format: 'SANGUEA_BACKUP' as const,
    version: 1 as const,
    algorithm: 'AES-GCM' as const,
    keyLength: 256 as const,
    kdf: 'PBKDF2' as const,
    kdfHash: 'SHA-256' as const,
    iterations: customIterations,
    salt: saltBase64,
    iv: ivBase64,
  };

  const aesKey = await deriveBackupAESKey(passphrase, saltBytes, customIterations);
  const aadBytes = buildCanonicalBackupAAD(cryptoHeader);

  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(payload));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      additionalData: aadBytes.buffer as ArrayBuffer,
    },
    aesKey,
    plaintextBytes
  );

  const endTime = performance.now();
  const durationMs = Math.round(endTime - startTime);

  const backupFile: SangueaBackupFile = {
    format: 'SANGUEA_BACKUP',
    version: 1,
    createdAt: new Date().toISOString(),
    appVersion: '1.0.0',
    crypto: cryptoHeader,
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
  };

  return { backupFile, durationMs };
}

/**
 * Decifra e valida a integridade do envelope do backup e do payload JSON resultante.
 */
export async function decryptBackupPayload(
  backupFile: SangueaBackupFile,
  passphrase: string
): Promise<{ payload: BackupPayloadData; durationMs: number }> {
  const startTime = performance.now();

  // 1. Validações pré-criptográficas rígidas do envelope
  if (!backupFile || backupFile.format !== 'SANGUEA_BACKUP') {
    throw new Error('Ficheiro inválido: o formato do envelope não é SANGUEA_BACKUP.');
  }

  if (backupFile.version !== 1) {
    throw new Error(`Versão de backup não suportada (${backupFile.version}). Requer versão 1.`);
  }

  const { crypto: cryptoHeader, ciphertext } = backupFile;
  if (!cryptoHeader || !ciphertext) {
    throw new Error('Ficheiro inválido: cabeçalho criptográfico ou ciphertext ausente.');
  }

  if (
    cryptoHeader.algorithm !== 'AES-GCM' ||
    cryptoHeader.keyLength !== 256 ||
    cryptoHeader.kdf !== 'PBKDF2' ||
    cryptoHeader.kdfHash !== 'SHA-256'
  ) {
    throw new Error('Parâmetros criptográficos do envelope não suportados.');
  }

  // Protecção contra DoS: limites rígidos de iterações
  if (cryptoHeader.iterations < 10000 || cryptoHeader.iterations > 1000000) {
    throw new Error(
      `Número de iterações KDF fora do limite de segurança permitido (${cryptoHeader.iterations}).`
    );
  }

  const saltBytes = new Uint8Array(base64ToArrayBuffer(cryptoHeader.salt));
  const ivBytes = new Uint8Array(base64ToArrayBuffer(cryptoHeader.iv));
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext);

  const aesKey = await deriveBackupAESKey(passphrase, saltBytes, cryptoHeader.iterations);
  const aadBytes = buildCanonicalBackupAAD({
    format: 'SANGUEA_BACKUP',
    version: 1,
    algorithm: 'AES-GCM',
    keyLength: 256,
    kdf: 'PBKDF2',
    kdfHash: 'SHA-256',
    iterations: cryptoHeader.iterations,
    salt: cryptoHeader.salt,
    iv: cryptoHeader.iv,
  });

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        additionalData: aadBytes.buffer as ArrayBuffer,
      },
      aesKey,
      ciphertextBuffer
    );
  } catch {
    throw new Error(
      'Palavra-passe de backup incorrecta ou o ficheiro de backup foi adulterado/corrompido.'
    );
  }

  const decoder = new TextDecoder();
  let parsedPayload: unknown;
  try {
    parsedPayload = JSON.parse(decoder.decode(decryptedBuffer));
  } catch {
    throw new Error('Falha ao interpretar a estrutura JSON do payload decifrado.');
  }

  // 2. Validação estrita em runtime da estrutura de dados
  const payload = validateBackupPayloadRuntime(parsedPayload);

  const endTime = performance.now();
  const durationMs = Math.round(endTime - startTime);

  return { payload, durationMs };
}

/**
 * Validação em tempo de execução da estrutura JSON do payload de backup sem confiar em ilações TypeScript.
 */
function validateBackupPayloadRuntime(data: unknown): BackupPayloadData {
  if (!data || typeof data !== 'object') {
    throw new Error('Payload inválido: não é um objeto JSON válido.');
  }

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.profiles)) {
    throw new Error('Payload inválido: a propriedade "profiles" deve ser uma lista.');
  }

  if (obj.profiles.length > MAX_BACKUP_PROFILES_COUNT) {
    throw new Error(`O ficheiro excede o limite máximo de ${MAX_BACKUP_PROFILES_COUNT} perfis.`);
  }

  for (let i = 0; i < obj.profiles.length; i++) {
    const pkg = obj.profiles[i] as Record<string, unknown>;
    if (!pkg || typeof pkg !== 'object') {
      throw new Error(`Perfil na posição ${i} está corrompido.`);
    }

    const meta = pkg.meta as Record<string, unknown>;
    const profileData = pkg.profileData as Record<string, unknown>;

    if (!meta || typeof meta.id !== 'string' || typeof meta.name !== 'string') {
      throw new Error(`Metadados do perfil na posição ${i} são inválidos.`);
    }

    if (!profileData || typeof profileData.id !== 'string' || typeof profileData.name !== 'string') {
      throw new Error(`Dados pessoais do perfil "${meta.name}" são inválidos.`);
    }

    // Validar fotografia opcional cifrada dentro de profileData
    if (
      profileData.photoDataUrl !== undefined &&
      !isValidProfilePhotoDataUrl(profileData.photoDataUrl)
    ) {
      delete profileData.photoDataUrl;
    }
  }

  return data as BackupPayloadData;
}

/**
 * Lê e pré-valida o ficheiro .sanguea a partir do disco/input do navegador.
 */
export async function readBackupFileFromDisk(file: File): Promise<SangueaBackupFile> {
  if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
    throw new Error(
      `O ficheiro selecionado (${(file.size / (1024 * 1024)).toFixed(1)} MB) excede o limite máximo permitido de 20 MB.`
    );
  }

  const fileText = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    throw new Error('O ficheiro selecionado não é um documento JSON válido.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Ficheiro inválido.');
  }

  const backupFile = parsed as SangueaBackupFile;
  if (backupFile.format !== 'SANGUEA_BACKUP') {
    throw new Error('O ficheiro selecionado não é um backup reconhecido do Sanguea.');
  }

  return backupFile;
}

/**
 * Dispara o download automático do ficheiro .sanguea no navegador.
 */
export function exportBackupFile(backupFile: SangueaBackupFile, defaultFilename?: string): void {
  const jsonStr = JSON.stringify(backupFile, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const datePart = new Date().toISOString().slice(0, 10);
  const filename = defaultFilename || `sanguea-backup-${datePart}.sanguea`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Executa o restauro atómico de perfis seleccionados no IndexedDB.
 * Prepara todas as mutações e cifragens em memória ANTES da transacção IndexedDB síncrona.
 */
export async function restoreProfilesToStorage(
  selectedPackages: BackupProfilePackage[],
  passphrasesMap: Record<string, string>, // Mapeia oldProfileId ou '__COMMON__' para a nova palavra-passe local
  existingProfilesMeta: ProfileMetadata[]
): Promise<Array<{ oldId: string; newId: string; name: string }>> {
  const results: Array<{ oldId: string; newId: string; name: string }> = [];

  const preparedMetas: ProfileMetadata[] = [];
  const preparedEncProfiles: StoredEncryptedRecord[] = [];
  const preparedEncHealths: StoredEncryptedHealthRecord[] = [];

  const existingNames = new Set(existingProfilesMeta.map((p) => p.name.trim().toLowerCase()));

  // 1. Preparação assíncrona em memória (Web Crypto API)
  for (const pkg of selectedPackages) {
    const oldProfileId = pkg.meta.id;
    const newProfileId = window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Obter palavra-passe local escolhida para este perfil
    const localPassphrase = passphrasesMap[oldProfileId] || passphrasesMap['__COMMON__'];
    if (!localPassphrase) {
      throw new Error(`Palavra-passe não definida para o perfil "${pkg.meta.name}".`);
    }

    // Verificar se o nome colide com um perfil existente
    let finalName = pkg.meta.name.trim();
    if (existingNames.has(finalName.toLowerCase())) {
      finalName = `${finalName} (Restaurado)`;
    }

    const now = new Date().toISOString();

    const updatedProfileData: UserProfile = {
      ...pkg.profileData,
      id: newProfileId,
      name: finalName,
      updatedAt: now,
    };

    const updatedMeta: ProfileMetadata = {
      ...pkg.meta,
      id: newProfileId,
      name: finalName,
      avatarId: updatedProfileData.avatarId || pkg.meta.avatarId,
      photoDataUrl: updatedProfileData.photoDataUrl,
      updatedAt: now,
    };

    // Importar a nova CryptoKey PBKDF2 primária para este perfil
    const passphraseKey = await importPassphraseKey(localPassphrase);
    const derivedKeysMap = new Map<string, CryptoKey>();

    // Cifrar perfil em formato V2 com AAD
    const encProfilePayload = await encryptDataV2<UserProfile>(
      updatedProfileData,
      passphraseKey,
      newProfileId,
      'profile',
      derivedKeysMap
    );

    const storedEncProfile: StoredEncryptedRecord = {
      id: newProfileId,
      version: 2,
      salt: encProfilePayload.salt,
      iv: encProfilePayload.iv,
      ciphertext: encProfilePayload.ciphertext,
      updatedAt: now,
    };

    preparedMetas.push(updatedMeta);
    preparedEncProfiles.push(storedEncProfile);

    // Se existirem dados clínicos, remapear e cifrar
    if (pkg.healthData) {
      const updatedHealthData: PatientHealthRecord = {
        ...pkg.healthData,
        profileId: newProfileId,
        updatedAt: now,
      };

      const encHealthPayload = await encryptDataV2<PatientHealthRecord>(
        updatedHealthData,
        passphraseKey,
        newProfileId,
        'health_data',
        derivedKeysMap
      );

      const storedEncHealth: StoredEncryptedHealthRecord = {
        profileId: newProfileId,
        version: 2,
        salt: encHealthPayload.salt,
        iv: encHealthPayload.iv,
        ciphertext: encHealthPayload.ciphertext,
        updatedAt: now,
      };

      preparedEncHealths.push(storedEncHealth);
    }

    results.push({
      oldId: oldProfileId,
      newId: newProfileId,
      name: finalName,
    });
  }

  // 2. Transacção IndexedDB síncrona de escrita atómica
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }

    const openReq = window.indexedDB.open(DB_NAME, 2);

    openReq.onerror = () => reject(openReq.error || new Error('Falha ao abrir base de dados para restauro.'));

    openReq.onsuccess = () => {
      const db = openReq.result;
      const tx = db.transaction([STORE_PROFILES_META, STORE_ENCRYPTED, STORE_ENCRYPTED_HEALTH], 'readwrite');

      const metaStore = tx.objectStore(STORE_PROFILES_META);
      const encProfileStore = tx.objectStore(STORE_ENCRYPTED);
      const encHealthStore = tx.objectStore(STORE_ENCRYPTED_HEALTH);

      for (const m of preparedMetas) {
        metaStore.put(m);
      }
      for (const ep of preparedEncProfiles) {
        encProfileStore.put(ep);
      }
      for (const eh of preparedEncHealths) {
        encHealthStore.put(eh);
      }

      tx.oncomplete = () => {
        resolve(results);
      };

      tx.onerror = () => {
        reject(tx.error || new Error('Erro ao gravar dados restaurados no armazenamento local.'));
      };

      tx.onabort = () => {
        reject(new Error('A transacção de restauro foi abortada. Nenhuma alteração foi gravada.'));
      };
    };
  });
}
