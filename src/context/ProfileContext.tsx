/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile } from '../types';
import {
  ProfileMetadata,
  getAllProfilesMetadata,
  getEncryptedRecord,
  saveProfileRecord,
  deleteProfileRecord,
  migrateProfileRecordV1ToV2,
  getAppSetting,
  setAppSetting,
} from '../services/storage';
import {
  EncryptedPayloadV1,
  EncryptedPayloadV2,
  importPassphraseKey,
  encryptDataV2,
  decryptData,
} from '../services/crypto';
import { DEMO_PATIENT } from '../constants/demoData';
import { calculateAge } from '../utils/age';

interface ProfileContextType {
  profiles: ProfileMetadata[];
  activeProfile: UserProfile | null;
  isLocked: boolean;
  isLoading: boolean;
  hasInitialized: boolean;
  createProfile: (
    profileData: Omit<UserProfile, 'id' | 'age' | 'createdAt' | 'updatedAt'>,
    passphrase: string
  ) => Promise<UserProfile>;
  unlockProfile: (profileId: string, passphrase: string) => Promise<void>;
  lockSession: () => void;
  updateActiveProfile: (updates: Partial<UserProfile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  loadDemoProfile: () => void;
  isDemoActive: boolean;
  getSessionPassphraseKey: () => CryptoKey | null;
  getDerivedKeysMap: () => Map<string, CryptoKey>;
  getSessionGeneration: () => number;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Tempo de inactividade para bloqueio automático: 15 minutos
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<ProfileMetadata[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);

  // Armazenamento em memória da CryptoKey PBKDF2 primária da sessão (não exportável)
  const sessionPassphraseKeyRef = useRef<CryptoKey | null>(null);
  // Cache em memória de CryptoKeys AES-GCM derivadas por salt
  const derivedKeysMapRef = useRef<Map<string, CryptoKey>>(new Map());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Identificador sequencial de geração de sessão (token de invalidação)
  const sessionGenerationRef = useRef<number>(1);

  // Guarda o salt do perfil activo para re-utilização estável
  const activeProfileSaltRef = useRef<string | undefined>(undefined);

  const lockSession = useCallback(() => {
    sessionGenerationRef.current += 1;
    setActiveProfile(null);
    setIsLocked(true);
    setIsDemoActive(false);

    // Limpeza de chaves de sessão
    sessionPassphraseKeyRef.current = null;
    derivedKeysMapRef.current.clear();
    activeProfileSaltRef.current = undefined;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (!isLocked && activeProfile) {
      inactivityTimerRef.current = setTimeout(() => {
        lockSession();
      }, INACTIVITY_TIMEOUT_MS);
    }
  }, [isLocked, activeProfile, lockSession]);

  // Eventos de actividade para gerir o bloqueio
  useEffect(() => {
    const handleActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [resetInactivityTimer]);

  const refreshProfilesList = useCallback(async () => {
    try {
      setIsLoading(true);
      const metaList = await getAllProfilesMetadata();
      setProfiles(metaList);
      setHasInitialized(true);
    } catch (err) {
      console.error('Erro ao carregar perfis locais:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfilesList();
  }, [refreshProfilesList]);

  // Criar novo perfil com cifragem AES-GCM V2 com AAD
  const createProfile = async (
    profileData: Omit<UserProfile, 'id' | 'age' | 'createdAt' | 'updatedAt'>,
    passphrase: string
  ): Promise<UserProfile> => {
    const newId = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const { age, ageGroup } = calculateAge(profileData.birthDate);

    const fullProfile: UserProfile = {
      ...profileData,
      id: newId,
      age,
      ageGroup: profileData.ageGroup || ageGroup,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Importar a palavra-passe como CryptoKey PBKDF2 primária (não exportável)
    const passphraseKey = await importPassphraseKey(passphrase);

    // Limpar cache de sessão anterior se existia
    derivedKeysMapRef.current.clear();

    // 2. Cifrar perfil em formato V2 com AAD e IV novo
    const encryptedPayloadV2 = await encryptDataV2<UserProfile>(
      fullProfile,
      passphraseKey,
      newId,
      'profile',
      derivedKeysMapRef.current
    );

    // 3. Preparar metadados não-sensíveis para o ecrã de selecção
    const metadata: ProfileMetadata = {
      id: newId,
      name: fullProfile.name,
      avatarId: fullProfile.avatarId,
      ageGroup: fullProfile.ageGroup,
      isChild: fullProfile.isChild,
      caregiverName: fullProfile.caregiver?.name,
      caregiverRelation: fullProfile.caregiver?.relationship,
      createdAt: now,
      updatedAt: now,
    };

    // 4. Persistir no IndexedDB
    await saveProfileRecord(metadata, encryptedPayloadV2);
    await setAppSetting('last_active_profile_id', newId);

    // 5. Configurar sessão
    sessionPassphraseKeyRef.current = passphraseKey;
    activeProfileSaltRef.current = encryptedPayloadV2.salt;
    setActiveProfile(fullProfile);
    setIsLocked(false);
    setIsDemoActive(false);

    await refreshProfilesList();
    resetInactivityTimer();

    return fullProfile;
  };

  // Desbloquear perfil existente
  const unlockProfile = async (profileId: string, passphrase: string): Promise<void> => {
    sessionGenerationRef.current += 1;
    const currentGen = sessionGenerationRef.current;

    const encryptedRecord = await getEncryptedRecord(profileId);
    if (!encryptedRecord) {
      throw new Error('Perfil não encontrado no armazenamento local.');
    }

    // 1. Importar chave primária PBKDF2 da palavra-passe
    const passphraseKey = await importPassphraseKey(passphrase);

    // Limpar cache de perfil anterior antes de abrir o novo
    derivedKeysMapRef.current.clear();

    // 2. Decifrar perfil (valida tag GCM e AAD se V2, ou decifra V1)
    const decryptedProfile = await decryptData<UserProfile>(
      encryptedRecord,
      passphraseKey,
      profileId,
      'profile',
      derivedKeysMapRef.current
    );

    // 3. Configurar sessão activa
    sessionPassphraseKeyRef.current = passphraseKey;
    activeProfileSaltRef.current = encryptedRecord.salt;
    setActiveProfile(decryptedProfile);
    setIsLocked(false);
    setIsDemoActive(false);
    await setAppSetting('last_active_profile_id', profileId);

    // 4. Se o registo lido era V1, migrar de forma atómica para V2 em segundo plano
    if (encryptedRecord.version !== 2) {
      try {
        const metadata: ProfileMetadata = {
          id: decryptedProfile.id,
          name: decryptedProfile.name,
          avatarId: decryptedProfile.avatarId,
          ageGroup: decryptedProfile.ageGroup,
          isChild: decryptedProfile.isChild,
          caregiverName: decryptedProfile.caregiver?.name,
          caregiverRelation: decryptedProfile.caregiver?.relationship,
          createdAt: decryptedProfile.createdAt,
          updatedAt: decryptedProfile.updatedAt,
        };

        const newV2Payload = await encryptDataV2<UserProfile>(
          decryptedProfile,
          passphraseKey,
          profileId,
          'profile',
          derivedKeysMapRef.current,
          encryptedRecord.salt // Manter o salt estável
        );

        await migrateProfileRecordV1ToV2(
          metadata,
          encryptedRecord as EncryptedPayloadV1,
          newV2Payload
        );
      } catch (err) {
        console.warn('Migração V1->V2 do perfil adada para a próxima gravação:', err);
      }
    }

    resetInactivityTimer();
  };

  // Actualizar perfil activo
  const updateActiveProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!activeProfile) throw new Error('Nenhum perfil activo.');

    if (isDemoActive) {
      setActiveProfile({ ...activeProfile, ...updates });
      return;
    }

    const passphraseKey = sessionPassphraseKeyRef.current;
    if (!passphraseKey) {
      throw new Error('Sessão expirada. Por favor desbloqueie o perfil novamente.');
    }

    const updatedProfile: UserProfile = {
      ...activeProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const encryptedPayloadV2 = await encryptDataV2<UserProfile>(
      updatedProfile,
      passphraseKey,
      activeProfile.id,
      'profile',
      derivedKeysMapRef.current,
      activeProfileSaltRef.current
    );

    const metadata: ProfileMetadata = {
      id: updatedProfile.id,
      name: updatedProfile.name,
      avatarId: updatedProfile.avatarId,
      ageGroup: updatedProfile.ageGroup,
      isChild: updatedProfile.isChild,
      caregiverName: updatedProfile.caregiver?.name,
      caregiverRelation: updatedProfile.caregiver?.relationship,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt,
    };

    await saveProfileRecord(metadata, encryptedPayloadV2);
    setActiveProfile(updatedProfile);
    await refreshProfilesList();
    resetInactivityTimer();
  };

  // Eliminar perfil
  const deleteProfile = async (profileId: string): Promise<void> => {
    await deleteProfileRecord(profileId);
    if (activeProfile?.id === profileId) {
      lockSession();
    }
    await refreshProfilesList();
  };

  // Carregar perfil de demonstração
  const loadDemoProfile = () => {
    setActiveProfile(DEMO_PATIENT);
    setIsLocked(false);
    setIsDemoActive(true);
    sessionPassphraseKeyRef.current = null;
    derivedKeysMapRef.current.clear();
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        isLocked,
        isLoading,
        hasInitialized,
        createProfile,
        unlockProfile,
        lockSession,
        updateActiveProfile,
        deleteProfile,
        loadDemoProfile,
        isDemoActive,
        getSessionPassphraseKey: () => sessionPassphraseKeyRef.current,
        getDerivedKeysMap: () => derivedKeysMapRef.current,
        getSessionGeneration: () => sessionGenerationRef.current,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve ser utilizado dentro de um ProfileProvider');
  }
  return context;
}
