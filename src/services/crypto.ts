/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Web Crypto API service for Sanguea PWA — AES-GCM V2 com AAD
 * Usa AES-GCM (256-bit) com IV aleatório único (12 bytes), AAD (additionalData)
 * e derivação de chave PBKDF2 (SHA-256, 100.000 iterações).
 * Zero dependências externas. Zero chamadas de rede.
 */

const PBKDF2_ITERATIONS = 100000;
const AES_KEY_LENGTH = 256;
const SENTINEL_PHRASE = 'SANGUEA_ENCRYPTED_VALID_RECORD_V1';

export type EncryptedRecordType = 'profile' | 'health_data';

export interface AADMetadata {
  version: 2;
  profileId: string;
  recordType: EncryptedRecordType;
}

export interface EncryptedPayloadV1 {
  version?: 1;
  salt: string;       // Base64 (16 bytes)
  iv: string;         // Base64 (12 bytes - partilhado na V1)
  ciphertext: string; // Base64
  verifier: string;   // Base64 (sentinela legada)
}

export interface EncryptedPayloadV2 {
  version: 2;
  salt: string;       // Base64 (16 bytes)
  iv: string;         // Base64 (12 bytes - ÚNICO por operação de cifragem)
  ciphertext: string; // Base64 (payload JSON cifrado com AES-GCM-256 e AAD)
}

export type EncryptedPayload = EncryptedPayloadV1 | EncryptedPayloadV2;

// Helpers Base64 nativos do navegador
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Importa o material da palavra-passe como uma CryptoKey PBKDF2 primária (não exportável).
 */
export async function importPassphraseKey(passphrase: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );
}

/**
 * Deriva uma CryptoKey AES-GCM de 256 bits a partir da CryptoKey PBKDF2 primária e de um salt de 16 bytes.
 */
export async function deriveAESKeyFromPassphraseKey(
  passphraseKey: CryptoKey,
  salt: Uint8Array
): Promise<CryptoKey> {
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passphraseKey,
    {
      name: 'AES-GCM',
      length: AES_KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Procura a CryptoKey AES-GCM na cache de sessão `derivedKeysMap`. Se não existir, deriva e guarda na cache.
 */
export async function getOrDeriveSessionKey(
  passphraseKey: CryptoKey,
  saltBase64: string,
  derivedKeysMap: Map<string, CryptoKey>
): Promise<CryptoKey> {
  const cached = derivedKeysMap.get(saltBase64);
  if (cached) {
    return cached;
  }

  const saltBytes = new Uint8Array(base64ToArrayBuffer(saltBase64));
  const derivedKey = await deriveAESKeyFromPassphraseKey(passphraseKey, saltBytes);
  derivedKeysMap.set(saltBase64, derivedKey);
  return derivedKey;
}

/**
 * Constrói deterministicamente os bytes AAD (Additional Authenticated Data) para a versão 2.
 */
export function buildAADBytes(
  version: 2,
  profileId: string,
  recordType: EncryptedRecordType
): Uint8Array {
  const metadata: AADMetadata = {
    version,
    profileId,
    recordType,
  };
  return new TextEncoder().encode(JSON.stringify(metadata));
}

/**
 * Cifra dados em formato V2 com AAD e IV obrigatoriamente novo.
 */
export async function encryptDataV2<T>(
  data: T,
  passphraseKey: CryptoKey,
  profileId: string,
  recordType: EncryptedRecordType,
  derivedKeysMap: Map<string, CryptoKey>,
  existingSaltBase64?: string
): Promise<EncryptedPayloadV2> {
  let saltBase64: string;
  if (existingSaltBase64) {
    saltBase64 = existingSaltBase64;
  } else {
    const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    saltBase64 = arrayBufferToBase64(saltBytes.buffer);
  }

  const aesKey = await getOrDeriveSessionKey(passphraseKey, saltBase64, derivedKeysMap);

  // IV novo de 12 bytes gerado obrigatoriamente a cada cifragem
  const ivBytes = window.crypto.getRandomValues(new Uint8Array(12));
  const aadBytes = buildAADBytes(2, profileId, recordType);

  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(data));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
      additionalData: aadBytes.buffer as ArrayBuffer,
    },
    aesKey,
    plaintextBytes
  );

  return {
    version: 2,
    salt: saltBase64,
    iv: arrayBufferToBase64(ivBytes.buffer),
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
  };
}

/**
 * Decifra registos no formato V2 (com AAD) ou V1 (sem AAD, retrocompatível).
 * Lança excepção se a chave for incorrecta ou os dados/AAD forem alterados.
 */
export async function decryptData<T>(
  payload: EncryptedPayload,
  passphraseKeyOrString: CryptoKey | string,
  profileId: string,
  recordType: EncryptedRecordType,
  derivedKeysMap?: Map<string, CryptoKey>
): Promise<T> {
  let passphraseKey: CryptoKey;
  if (typeof passphraseKeyOrString === 'string') {
    passphraseKey = await importPassphraseKey(passphraseKeyOrString);
  } else {
    passphraseKey = passphraseKeyOrString;
  }

  const activeMap = derivedKeysMap || new Map<string, CryptoKey>();
  const aesKey = await getOrDeriveSessionKey(passphraseKey, payload.salt, activeMap);

  const ivBytes = new Uint8Array(base64ToArrayBuffer(payload.iv));
  const ciphertextBuffer = base64ToArrayBuffer(payload.ciphertext);

  const isV2 = payload.version === 2;

  if (isV2) {
    try {
      const aadBytes = buildAADBytes(2, profileId, recordType);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes,
          additionalData: aadBytes.buffer as ArrayBuffer,
        },
        aesKey,
        ciphertextBuffer
      );
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decryptedBuffer)) as T;
    } catch {
      throw new Error('Credencial de acesso ou dados do perfil inválidos (Falha de autenticação GCM/AAD V2).');
    }
  } else {
    // Decifragem legada V1 sem AAD
    const payloadV1 = payload as EncryptedPayloadV1;
    try {
      // 1. Tentar decifrar o ciphertext principal
      const decryptedDataBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes,
        },
        aesKey,
        ciphertextBuffer
      );
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decryptedDataBuffer)) as T;
    } catch {
      // 2. Se o ciphertext falhar, tentar verifier para diagnóstico legados
      if (payloadV1.verifier) {
        try {
          const verifierBuffer = base64ToArrayBuffer(payloadV1.verifier);
          const decryptedVerifier = await window.crypto.subtle.decrypt(
            {
              name: 'AES-GCM',
              iv: ivBytes,
            },
            aesKey,
            verifierBuffer
          );
          const decoder = new TextDecoder();
          if (decoder.decode(decryptedVerifier) !== SENTINEL_PHRASE) {
            throw new Error('Credencial de acesso inválida.');
          }
        } catch {
          // Fall through
        }
      }
      throw new Error('Credencial de acesso incorrecta. Não foi possível decifrar o perfil V1.');
    }
  }
}

/**
 * Função de auxílio legada para manter compatibilidade no momento de criação sem chave em memória
 */
export async function encryptDataLegacy<T>(data: T, passphrase: string): Promise<EncryptedPayloadV1> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const passphraseKey = await importPassphraseKey(passphrase);
  const key = await deriveAESKeyFromPassphraseKey(passphraseKey, salt);

  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(JSON.stringify(data));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintextBytes
  );

  const sentinelBytes = encoder.encode(SENTINEL_PHRASE);
  const verifierBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    sentinelBytes
  );

  return {
    version: 1,
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    verifier: arrayBufferToBase64(verifierBuffer),
  };
}
