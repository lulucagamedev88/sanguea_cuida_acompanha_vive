/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serviço central de áudio e música de fundo do Sanguéa.
 * Gere de forma segura e exclusiva as duas faixas da aplicação:
 *  - /audio/app-background.mp3 (Música ambiente global do Sanguéa)
 *  - /audio/game-background.mp3 (Música exclusiva do jogo Aqua Quest)
 *
 * Características e Garantias:
 * - Instâncias únicas nativas de HTMLAudioElement (sem duplicação nem recriação de objetos).
 * - Reprodução em loop contínuo e sem reinícios ao navegar entre módulos.
 * - Exclusividade mútua: nunca reproduz ambas as músicas em simultâneo.
 * - Ao entrar no Aqua Quest suspende a música do app e inicia a do jogo.
 * - Ao sair do Aqua Quest suspende a música do jogo e retoma a do app.
 * - Tratamento de restrições de autoplay dos navegadores (ativa no primeiro clique/toque).
 * - Persistência das preferências de volume e ativação no localStorage.
 * - Respeito ao ciclo de vida (pausa em background / ecrã apagado).
 */

export type MusicTrack = 'app' | 'game' | 'none';

const TRACK_PATHS: Record<'app' | 'game', string> = {
  app: '/audio/app-background.mp3',
  game: '/audio/game-background.mp3',
};

class BackgroundMusicService {
  private activeTrack: MusicTrack = 'none';
  private targetMode: 'app' | 'game' = 'app';
  private appAudio: HTMLAudioElement | null = null;
  private gameAudio: HTMLAudioElement | null = null;
  private _isEnabled: boolean = false;
  private volume: number = 0.3; // Padrão 30% (0.0 a 1.0)
  private userInteractionBound: boolean = false;
  private isPageVisible: boolean = true;
  private playPromise: Promise<void> | null = null;

  private STORAGE_KEY_ENABLED = 'sanguea_sound_enabled';
  private STORAGE_KEY_VOLUME = 'sanguea_sound_volume';

  constructor() {
    this.loadPreferences();

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('pagehide', this.handlePageHide);

      // Regista listener de primeira interação para contornar políticas de autoplay
      this.attachUserGestureListener();
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

  /**
   * Obtém ou inicializa a instância única de áudio para a faixa correspondente.
   */
  private getAudioElement(track: 'app' | 'game'): HTMLAudioElement {
    if (track === 'app') {
      if (!this.appAudio) {
        this.appAudio = new Audio(TRACK_PATHS.app);
        this.appAudio.loop = true;
        this.appAudio.preload = 'auto';
        this.appAudio.volume = this.volume;
        this.appAudio.onerror = () => {
          // Tratamento gracioso caso o ficheiro não esteja disponível
        };
      }
      return this.appAudio;
    } else {
      if (!this.gameAudio) {
        this.gameAudio = new Audio(TRACK_PATHS.game);
        this.gameAudio.loop = true;
        this.gameAudio.preload = 'auto';
        this.gameAudio.volume = this.volume;
        this.gameAudio.onerror = () => {
          // Tratamento gracioso caso o ficheiro não esteja disponível
        };
      }
      return this.gameAudio;
    }
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

    if (this.appAudio) {
      this.appAudio.volume = this.volume;
    }
    if (this.gameAudio) {
      this.gameAudio.volume = this.volume;
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this._isEnabled = enabled;
    this.savePreferences();

    if (this._isEnabled) {
      this.syncPlayback();
    } else {
      this.stop();
    }
  }

  /**
   * Define o modo de reprodução atual:
   *  - 'app'  -> Música principal do Sanguéa
   *  - 'game' -> Música do jogo Aqua Quest
   */
  public setMode(mode: 'app' | 'game') {
    if (this.targetMode === mode && this.activeTrack === mode) {
      return;
    }

    this.targetMode = mode;

    if (this._isEnabled) {
      this.syncPlayback();
    }
  }

  /**
   * Sincroniza o estado de reprodução garantindo exclusividade absoluta.
   */
  public syncPlayback() {
    if (!this._isEnabled || !this.isPageVisible) {
      this.stop();
      return;
    }

    const targetTrack = this.targetMode;
    const otherTrack = targetTrack === 'app' ? 'game' : 'app';

    // 1. Pausar e silenciar imediatamente a outra faixa
    if (otherTrack === 'game' && this.gameAudio) {
      try {
        this.gameAudio.pause();
        this.gameAudio.currentTime = 0; // Reinicia para o próximo início do jogo
      } catch {
        // Ignora
      }
    } else if (otherTrack === 'app' && this.appAudio) {
      try {
        this.appAudio.pause();
      } catch {
        // Ignora
      }
    }

    // 2. Obter a faixa alvo e atualizar volume
    const audio = this.getAudioElement(targetTrack);
    audio.volume = this.volume;

    // Se a faixa correta já estiver em reprodução ativa, nada mais é necessário
    if (this.activeTrack === targetTrack && !audio.paused) {
      return;
    }

    this.activeTrack = targetTrack;

    const promise = audio.play();
    this.playPromise = promise;

    if (promise !== undefined) {
      promise
        .then(() => {
          if (this.playPromise === promise) {
            this.playPromise = null;
          }
        })
        .catch((err) => {
          if (this.playPromise === promise) {
            this.playPromise = null;
          }
          if (err && err.name === 'AbortError') {
            // Ignora interrupção de transição intencional
            return;
          }
          // Bloqueio de autoplay do navegador: ativa listener de interação
          this.activeTrack = 'none';
          this.attachUserGestureListener();
        });
    }
  }

  private attachUserGestureListener() {
    if (this.userInteractionBound || typeof window === 'undefined') return;
    this.userInteractionBound = true;

    const onUserGesture = () => {
      // Remover os ouvintes após a primeira interação
      window.removeEventListener('click', onUserGesture, true);
      window.removeEventListener('touchstart', onUserGesture, true);
      window.removeEventListener('keydown', onUserGesture, true);
      this.userInteractionBound = false;

      if (this._isEnabled && this.isPageVisible) {
        this.syncPlayback();
      }
    };

    window.addEventListener('click', onUserGesture, true);
    window.addEventListener('touchstart', onUserGesture, true);
    window.addEventListener('keydown', onUserGesture, true);
  }

  public stop() {
    if (this.appAudio) {
      try {
        this.appAudio.pause();
      } catch {
        // Ignora
      }
    }

    if (this.gameAudio) {
      try {
        this.gameAudio.pause();
        this.gameAudio.currentTime = 0;
      } catch {
        // Ignora
      }
    }

    this.activeTrack = 'none';
  }

  public start() {
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
      if (this.appAudio) {
        try {
          this.appAudio.pause();
        } catch {
          // Ignora
        }
      }
      if (this.gameAudio) {
        try {
          this.gameAudio.pause();
        } catch {
          // Ignora
        }
      }
    } else {
      this.isPageVisible = true;
      if (this._isEnabled) {
        this.syncPlayback();
      }
    }
  };

  private handlePageHide = () => {
    this.stop();
  };
}

export const backgroundMusicService = new BackgroundMusicService();
// Exporta também com alias audioService para compatibilidade
export const audioService = backgroundMusicService;
