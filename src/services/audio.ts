/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serviço central de música ambiente do Sanguea.
 * Reproduz música ambiente suave, contínua e discreta em todo o aplicativo:
 *  - ${BASE_URL}audio/app-background.mp3
 *
 * Características e Garantias:
 * - Instância única nativa de HTMLAudioElement (sem duplicação nem recriação).
 * - Reprodução em loop contínuo e sem reinícios ao navegar entre módulos (incluindo Mossangue).
 * - Transição suave de volume (fade-in/fade-out sem cortes bruscos).
 * - Compatibilidade com restrições de autoplay em Android WebView e navegadores.
 * - Persistência das preferências de volume e ativação no localStorage.
 * - Pausa automática ao colocar a aplicação em segundo plano / ecrã apagado.
 */

export type MusicTrack = 'app' | 'none';

const BASE_PATH =
  typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL
    : '/';

const APP_AUDIO_SRC = `${BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`}audio/app-background.mp3`;

class BackgroundMusicService {
  private activeTrack: MusicTrack = 'none';
  private appAudio: HTMLAudioElement | null = null;
  private _isEnabled: boolean = true;
  private volume: number = 0.28; // Suave e discreta por omissão (28%)
  private userInteractionBound: boolean = false;
  private isPageVisible: boolean = true;
  private playbackAllowed: boolean = false;
  private pendingFadeInMs: number = 650;
  private playPromise: Promise<void> | null = null;
  private fadeTimer: number | null = null;

  private STORAGE_KEY_ENABLED = 'sanguea_sound_enabled';
  private STORAGE_KEY_VOLUME = 'sanguea_sound_volume';

  constructor() {
    this.loadPreferences();

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('pagehide', this.handlePageHide);
    }
  }

  private loadPreferences() {
    try {
      const savedEnabled = localStorage.getItem(this.STORAGE_KEY_ENABLED);
      const savedVolume = localStorage.getItem(this.STORAGE_KEY_VOLUME);

      if (savedEnabled !== null) {
        this._isEnabled = savedEnabled === 'true';
      }
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
    } catch {
      // Ignora falhas de localStorage
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem(this.STORAGE_KEY_ENABLED, String(this._isEnabled));
      localStorage.setItem(this.STORAGE_KEY_VOLUME, String(this.volume));
    } catch {
      // Ignora falhas de localStorage
    }
  }

  private clearFadeTimer() {
    if (this.fadeTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private rampVolume(audio: HTMLAudioElement, targetVolume: number, durationMs = 500, onDone?: () => void) {
    this.clearFadeTimer();
    const clampedTarget = Math.max(0, Math.min(1, targetVolume));
    const startVol = audio.volume;
    const diff = clampedTarget - startVol;

    if (Math.abs(diff) < 0.002 || durationMs <= 0 || typeof window === 'undefined') {
      audio.volume = clampedTarget;
      onDone?.();
      return;
    }

    const steps = Math.max(20, Math.min(120, Math.round(durationMs / 30)));
    const stepMs = Math.max(16, Math.floor(durationMs / steps));
    let currentStep = 0;

    this.fadeTimer = window.setInterval(() => {
      currentStep += 1;
      const progress = Math.min(1, currentStep / steps);
      // Suave curva coseno para entrada e saída ainda mais naturais
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress);
      audio.volume = Math.max(0, Math.min(1, startVol + diff * eased));

      if (currentStep >= steps) {
        this.clearFadeTimer();
        audio.volume = clampedTarget;
        onDone?.();
      }
    }, stepMs);
  }

  /**
   * Obtém ou inicializa a instância única de áudio ambiente.
   */
  private getAudioElement(): HTMLAudioElement {
    if (!this.appAudio) {
      const audio = new Audio(APP_AUDIO_SRC);
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.onerror = () => {
        this.activeTrack = 'none';
      };
      this.appAudio = audio;
    }
    return this.appAudio;
  }

  public getMusicEnabled(): boolean {
    return this._isEnabled;
  }

  public isEnabled(): boolean {
    return this._isEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    this.savePreferences();

    if (this.appAudio && !this.appAudio.paused) {
      this.clearFadeTimer();
      this.appAudio.volume = this.volume;
    }
  }

  public setPlaybackAllowed(allowed: boolean) {
    this.playbackAllowed = allowed;
    if (!allowed) {
      this.stop();
    }
  }

  public setMusicEnabled(enabled: boolean) {
    const changed = this._isEnabled !== enabled;
    this._isEnabled = enabled;
    this.savePreferences();

    if (this._isEnabled) {
      if (this.playbackAllowed && (changed || this.activeTrack !== 'app' || this.appAudio?.paused)) {
        this.syncPlayback();
      }
    } else {
      this.stop();
    }
  }

  /**
   * Inicia o som ambiente com fade-in suave durante a tela de boas-vindas
   * (tanto no primeiro registo como na tela do logótipo a pulsar após palavra-passe).
   */
  public startWelcomeFadeIn(durationMs = 3000) {
    this.playbackAllowed = true;
    this.pendingFadeInMs = durationMs;

    if (!this._isEnabled || !this.isPageVisible) {
      this.stop();
      return;
    }

    const audio = this.getAudioElement();
    this.clearFadeTimer();

    if (audio.paused || this.activeTrack !== 'app') {
      try {
        if (audio.paused) {
          audio.currentTime = 0;
        }
      } catch {
        // Ignora se media ainda não carregou metadata
      }
      this.syncPlayback(durationMs);
    } else {
      // Se já estava a tocar (ex: troca de perfil), garante transição suave até ao volume configurado
      this.rampVolume(audio, this.volume, Math.min(durationMs, 1200));
    }
  }

  /**
   * Pausa suavemente ao bloquear a sessão, preservando a preferência do utilizador
   * para voltar a iniciar em fade-in no próximo desbloqueio.
   */
  public pauseForLock() {
    this.playbackAllowed = false;
    this.stop();
  }

  /**
   * Mantém reprodução contínua da música ambiente global em todos os módulos.
   */
  public setMode(_mode: 'app' | 'game') {
    if (this._isEnabled && this.playbackAllowed && this.isPageVisible && this.activeTrack !== 'app') {
      this.syncPlayback();
    }
  }

  /**
   * Sincroniza a reprodução de forma contínua e sem cliques bruscos.
   */
  public syncPlayback(fadeInDurationMs = 900) {
    if (!this._isEnabled || !this.playbackAllowed || !this.isPageVisible) {
      this.stop();
      return;
    }

    this.pendingFadeInMs = fadeInDurationMs;
    const audio = this.getAudioElement();

    if (this.activeTrack === 'app' && !audio.paused) {
      this.rampVolume(audio, this.volume, 400);
      return;
    }

    this.activeTrack = 'app';
    audio.volume = 0;

    const promise = audio.play();
    this.playPromise = promise;

    if (promise !== undefined) {
      promise
        .then(() => {
          if (this.playPromise === promise) {
            this.playPromise = null;
          }
          if (this._isEnabled && this.playbackAllowed && this.isPageVisible) {
            this.rampVolume(audio, this.volume, fadeInDurationMs);
          } else {
            audio.pause();
          }
        })
        .catch((err) => {
          if (this.playPromise === promise) {
            this.playPromise = null;
          }
          if (err && err.name === 'AbortError') {
            return;
          }
          this.activeTrack = 'none';
          this.attachUserGestureListener();
        });
    } else {
      this.rampVolume(audio, this.volume, fadeInDurationMs);
    }
  }

  private attachUserGestureListener() {
    if (this.userInteractionBound || typeof window === 'undefined') return;
    this.userInteractionBound = true;

    const onUserGesture = () => {
      window.removeEventListener('pointerdown', onUserGesture, true);
      window.removeEventListener('touchstart', onUserGesture, true);
      window.removeEventListener('click', onUserGesture, true);
      window.removeEventListener('keydown', onUserGesture, true);
      this.userInteractionBound = false;

      if (this._isEnabled && this.playbackAllowed && this.isPageVisible) {
        this.syncPlayback(this.pendingFadeInMs);
      }
    };

    window.addEventListener('pointerdown', onUserGesture, true);
    window.addEventListener('touchstart', onUserGesture, true);
    window.addEventListener('click', onUserGesture, true);
    window.addEventListener('keydown', onUserGesture, true);
  }

  public stop() {
    this.activeTrack = 'none';
    if (!this.appAudio) return;

    const audio = this.appAudio;
    if (audio.paused) {
      this.clearFadeTimer();
      audio.volume = 0;
      return;
    }

    this.rampVolume(audio, 0, 450, () => {
      try {
        if (!this._isEnabled || !this.playbackAllowed || !this.isPageVisible) {
          audio.pause();
        }
      } catch {
        // Ignora
      }
    });
  }

  public start() {
    this.playbackAllowed = true;
    this.setMusicEnabled(true);
  }

  public toggle(): boolean {
    this.setMusicEnabled(!this._isEnabled);
    return this._isEnabled;
  }

  public isPlayingTrack(): MusicTrack {
    return this.activeTrack;
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.isPageVisible = false;
      this.clearFadeTimer();
      if (this.appAudio) {
        try {
          this.appAudio.pause();
        } catch {
          // Ignora
        }
      }
      this.activeTrack = 'none';
    } else {
      this.isPageVisible = true;
      if (this._isEnabled && this.playbackAllowed) {
        this.syncPlayback();
      }
    }
  };

  private handlePageHide = () => {
    this.clearFadeTimer();
    this.activeTrack = 'none';
    if (this.appAudio) {
      try {
        this.appAudio.pause();
      } catch {
        // Ignora
      }
    }
  };
}

export const backgroundMusicService = new BackgroundMusicService();
export const audioService = backgroundMusicService;
