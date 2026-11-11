/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EncryptedPayload, EncryptedPayloadV1, EncryptedPayloadV2 } from './crypto';

export interface ProfileMetadata {
  id: string;
  name: string;
  avatarId: string;
  ageGroup: 'Criança' | 'Adolescente' | 'Adulto';
  isChild: boolean;
  createdAt: string;
  updatedAt: string;
  caregiverName?: string;
  caregiverRelation?: string;
}

export interface StoredEncryptedRecord {
  id: string;
  version?: number;
  salt: string;
  iv: string;
  ciphertext: string;
  verifier?: string;
  updatedAt: string;
}

export interface StoredEncryptedHealthRecord {
  profileId: string;
  version?: number;
  salt: string;
  iv: string;
  ciphertext: string;
  verifier?: string;
  updatedAt: string;
}

const DB_NAME = 'sanguea_secure_db';
const DB_VERSION = 2;
const STORE_PROFILES_META = 'profiles_meta';
const STORE_ENCRYPTED = 'encrypted_profiles';
const STORE_ENCRYPTED_HEALTH = 'encrypted_health_data';
const STORE_SETTINGS = 'app_settings';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não é suportado neste navegador.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_PROFILES_META)) {
        db.createObjectStore(STORE_PROFILES_META, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_ENCRYPTED)) {
        db.createObjectStore(STORE_ENCRYPTED, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_ENCRYPTED_HEALTH)) {
        db.createObjectStore(STORE_ENCRYPTED_HEALTH, { keyPath: 'profileId' });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Falha ao abrir a base de dados local IndexedDB.'));
    };
  });

  return dbPromise;
}

/**
 * Guarda ou actualiza o registo cifrado de um perfil e a sua metadata pública
 */
export async function saveProfileRecord(
  meta: ProfileMetadata,
  payload: EncryptedPayload
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PROFILES_META, STORE_ENCRYPTED], 'readwrite');
    const metaStore = tx.objectStore(STORE_PROFILES_META);
    const encStore = tx.objectStore(STORE_ENCRYPTED);

    metaStore.put(meta);

    const isV2 = payload.version === 2;
    const record: StoredEncryptedRecord = {
      id: meta.id,
      version: payload.version || (isV2 ? 2 : 1),
      salt: payload.salt,
      iv: payload.iv,
      ciphertext: payload.ciphertext,
      verifier: isV2 ? undefined : (payload as EncryptedPayloadV1).verifier,
      updatedAt: meta.updatedAt,
    };
    encStore.put(record);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Migração atómica e transaccional de um registo de perfil de V1 para V2
 */
export async function migrateProfileRecordV1ToV2(
  meta: ProfileMetadata,
  oldV1Payload: EncryptedPayloadV1,
  newV2Payload: EncryptedPayloadV2,
  oldV1UpdatedAt?: string
): Promise<boolean> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PROFILES_META, STORE_ENCRYPTED], 'readwrite');
    const metaStore = tx.objectStore(STORE_PROFILES_META);
    const encStore = tx.objectStore(STORE_ENCRYPTED);

    const getEncReq = encStore.get(meta.id);
    const getMetaReq = metaStore.get(meta.id);

    let currentEnc: StoredEncryptedRecord | undefined;
    let currentMeta: ProfileMetadata | undefined;
    let encDone = false;
    let metaDone = false;

    const checkAndProcess = () => {
      if (!encDone || !metaDone) return;

      if (!currentEnc) {
        tx.abort();
        return;
      }

      // Comparação estrita do snapshot em 8 pontos antes de proceder com a escrita V2
      const matchId = currentEnc.id === meta.id;
      const matchVersion = currentEnc.version === undefined || currentEnc.version === 1;
      const matchSalt = currentEnc.salt === oldV1Payload.salt;
      const matchIv = currentEnc.iv === oldV1Payload.iv;
      const matchCiphertext = currentEnc.ciphertext === oldV1Payload.ciphertext;
      const matchVerifier = currentEnc.verifier === oldV1Payload.verifier;
      const matchUpdatedAt = oldV1UpdatedAt ? currentEnc.updatedAt === oldV1UpdatedAt : true;
      const matchMetaId = currentMeta ? currentMeta.id === meta.id : true;

      if (
        !matchId ||
        !matchVersion ||
        !matchSalt ||
        !matchIv ||
        !matchCiphertext ||
        !matchVerifier ||
        !matchUpdatedAt ||
        !matchMetaId
      ) {
        tx.abort();
        return;
      }

      // Gravamos a nova versão V2 de forma atómica na transacção
      metaStore.put(meta);
      const newRecord: StoredEncryptedRecord = {
        id: meta.id,
        version: 2,
        salt: newV2Payload.salt,
        iv: newV2Payload.iv,
        ciphertext: newV2Payload.ciphertext,
        verifier: undefined,
        updatedAt: meta.updatedAt,
      };
      encStore.put(newRecord);
    };

    getEncReq.onsuccess = () => {
      currentEnc = getEncReq.result as StoredEncryptedRecord | undefined;
      encDone = true;
      checkAndProcess();
    };

    getMetaReq.onsuccess = () => {
      currentMeta = getMetaReq.result as ProfileMetadata | undefined;
      metaDone = true;
      checkAndProcess();
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => resolve(false);
  });
}

/**
 * Obtém o payload cifrado de um perfil por ID
 */
export async function getEncryptedRecord(id: string): Promise<EncryptedPayload | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENCRYPTED, 'readonly');
    const store = tx.objectStore(STORE_ENCRYPTED);
    const request = store.get(id);

    request.onsuccess = () => {
      if (!request.result) {
        resolve(null);
        return;
      }
      const res = request.result as StoredEncryptedRecord;
      if (res.version === 2 || (!res.verifier && res.version !== 1)) {
        resolve({
          version: 2,
          salt: res.salt,
          iv: res.iv,
          ciphertext: res.ciphertext,
        } as EncryptedPayloadV2);
      } else {
        resolve({
          version: 1,
          salt: res.salt,
          iv: res.iv,
          ciphertext: res.ciphertext,
          verifier: res.verifier || '',
        } as EncryptedPayloadV1);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtém a lista de metadados não-sensíveis para o ecrã de selecção de perfil
 */
export async function getAllProfilesMetadata(): Promise<ProfileMetadata[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROFILES_META, 'readonly');
    const store = tx.objectStore(STORE_PROFILES_META);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina um perfil e os seus registos associados de forma atómica
 */
export async function deleteProfileRecord(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PROFILES_META, STORE_ENCRYPTED, STORE_ENCRYPTED_HEALTH], 'readwrite');
    tx.objectStore(STORE_PROFILES_META).delete(id);
    tx.objectStore(STORE_ENCRYPTED).delete(id);
    tx.objectStore(STORE_ENCRYPTED_HEALTH).delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Guarda ou actualiza o registo clínico cifrado de um perfil
 */
export async function saveEncryptedHealthRecord(
  profileId: string,
  payload: EncryptedPayload
): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENCRYPTED_HEALTH, 'readwrite');
    const store = tx.objectStore(STORE_ENCRYPTED_HEALTH);

    const isV2 = payload.version === 2;
    const record: StoredEncryptedHealthRecord = {
      profileId,
      version: payload.version || (isV2 ? 2 : 1),
      salt: payload.salt,
      iv: payload.iv,
      ciphertext: payload.ciphertext,
      verifier: isV2 ? undefined : (payload as EncryptedPayloadV1).verifier,
      updatedAt: new Date().toISOString(),
    };
    store.put(record);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Migração atómica e transaccional de um registo de saúde de V1 para V2
 */
export async function migrateHealthRecordV1ToV2(
  profileId: string,
  oldV1Payload: EncryptedPayloadV1,
  newV2Payload: EncryptedPayloadV2,
  oldV1UpdatedAt?: string
): Promise<boolean> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENCRYPTED_HEALTH, 'readwrite');
    const store = tx.objectStore(STORE_ENCRYPTED_HEALTH);

    const getReq = store.get(profileId);
    getReq.onsuccess = () => {
      const current = getReq.result as StoredEncryptedHealthRecord | undefined;
      if (!current) {
        tx.abort();
        return;
      }

      const matchId = current.profileId === profileId;
      const matchVersion = current.version === undefined || current.version === 1;
      const matchSalt = current.salt === oldV1Payload.salt;
      const matchIv = current.iv === oldV1Payload.iv;
      const matchCiphertext = current.ciphertext === oldV1Payload.ciphertext;
      const matchVerifier = current.verifier === oldV1Payload.verifier;
      const matchUpdatedAt = oldV1UpdatedAt ? current.updatedAt === oldV1UpdatedAt : true;

      if (
        !matchId ||
        !matchVersion ||
        !matchSalt ||
        !matchIv ||
        !matchCiphertext ||
        !matchVerifier ||
        !matchUpdatedAt
      ) {
        tx.abort();
        return;
      }

      const newRecord: StoredEncryptedHealthRecord = {
        profileId,
        version: 2,
        salt: newV2Payload.salt,
        iv: newV2Payload.iv,
        ciphertext: newV2Payload.ciphertext,
        verifier: undefined,
        updatedAt: new Date().toISOString(),
      };
      store.put(newRecord);
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => resolve(false);
  });
}

/**
 * Obtém o registo clínico cifrado de um perfil por ID
 */
export async function getEncryptedHealthRecord(profileId: string): Promise<EncryptedPayload | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENCRYPTED_HEALTH, 'readonly');
    const store = tx.objectStore(STORE_ENCRYPTED_HEALTH);
    const request = store.get(profileId);

    request.onsuccess = () => {
      if (!request.result) {
        resolve(null);
        return;
      }
      const res = request.result as StoredEncryptedHealthRecord;
      if (res.version === 2 || (!res.verifier && res.version !== 1)) {
        resolve({
          version: 2,
          salt: res.salt,
          iv: res.iv,
          ciphertext: res.ciphertext,
        } as EncryptedPayloadV2);
      } else {
        resolve({
          version: 1,
          salt: res.salt,
          iv: res.iv,
          ciphertext: res.ciphertext,
          verifier: res.verifier || '',
        } as EncryptedPayloadV1);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Elimina o registo de saúde cifrado de um perfil
 */
export async function deleteHealthRecord(profileId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ENCRYPTED_HEALTH, 'readwrite');
    tx.objectStore(STORE_ENCRYPTED_HEALTH).delete(profileId);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Definições e definições locais da aplicação
 */
export async function getAppSetting<T>(key: string): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SETTINGS, 'readonly');
    const store = tx.objectStore(STORE_SETTINGS);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function setAppSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    const store = tx.objectStore(STORE_SETTINGS);
    store.put({ key, value });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
