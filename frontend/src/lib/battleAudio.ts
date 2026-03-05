/**
 * Battle Audio Manager
 * Handles battle music, victory fanfares, and defeat sounds using Web Audio API
 * 
 * Research specs:
 * - Battle loop: 130-160 BPM, intense, driving
 * - Victory fanfare: 8-20 sec, triumphant
 * - Use OGG format (best for web)
 */

// Audio file paths (placeholders - replace with actual OGG files)
const AUDIO_BASE_URL = "/audio";

interface AudioConfig {
  battle: string;
  victory: string;
  defeat: string;
}

const DEFAULT_AUDIO: AudioConfig = {
  battle: `${AUDIO_BASE_URL}/battle.ogg`,
  victory: `${AUDIO_BASE_URL}/victory.ogg`,
  defeat: `${AUDIO_BASE_URL}/defeat.ogg`,
};

type AudioType = "battle" | "victory" | "defeat";

class BattleAudioManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  private fadeTimeout: ReturnType<typeof setTimeout> | null = null;
  
  // Audio buffers for preloading
  private buffers: Map<AudioType, AudioBuffer> = new Map();
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    this.initContext();
  }

  private initContext(): void {
    if (typeof window === "undefined") return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      
      // Preload audio files
      this.loadingPromise = this.preloadAudio();
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  private async preloadAudio(): Promise<void> {
    const audioTypes: AudioType[] = ["battle", "victory", "defeat"];
    
    await Promise.all(
      audioTypes.map(async (type) => {
        try {
          const buffer = await this.loadAudioFile(DEFAULT_AUDIO[type]);
          if (buffer) {
            this.buffers.set(type, buffer);
          }
        } catch (error) {
          console.warn(`Failed to load ${type} audio:`, error);
        }
      })
    );
  }

  private async loadAudioFile(url: string): Promise<AudioBuffer | null> {
    if (!this.audioContext) return null;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Audio file not found: ${url}`);
        return null;
      }
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn(`Failed to load audio from ${url}:`, error);
      return null;
    }
  }

  private ensureContext(): void {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }
  }

  /**
   * Play battle loop music (130-160 BPM, intense, driving)
   * Loops until stopped
   */
  async playBattleMusic(): Promise<void> {
    this.ensureContext();
    
    if (!this.audioContext || !this.gainNode) {
      console.warn("Audio context not initialized");
      return;
    }

    // Stop any currently playing music
    this.stopMusic();

    // Try to get preloaded buffer or load on demand
    let buffer = this.buffers.get("battle");
    if (!buffer) {
      buffer = await this.loadAudioFile(DEFAULT_AUDIO.battle);
      if (buffer) this.buffers.set("battle", buffer);
    }

    if (!buffer) {
      console.warn("Battle music not available - using placeholder");
      return;
    }

    this.playBuffer(buffer, true);
  }

  /**
   * Play victory fanfare (8-20 sec, triumphant)
   */
  async playVictory(): Promise<void> {
    this.ensureContext();
    
    if (!this.audioContext || !this.gainNode) return;

    // Stop battle music
    this.stopMusic();

    let buffer = this.buffers.get("victory");
    if (!buffer) {
      buffer = await this.loadAudioFile(DEFAULT_AUDIO.victory);
      if (buffer) this.buffers.set("victory", buffer);
    }

    if (!buffer) {
      console.warn("Victory audio not available");
      return;
    }

    this.playBuffer(buffer, false);
  }

  /**
   * Play defeat/game over sound
   */
  async playDefeat(): Promise<void> {
    this.ensureContext();
    
    if (!this.audioContext || !this.gainNode) return;

    // Stop battle music
    this.stopMusic();

    let buffer = this.buffers.get("defeat");
    if (!buffer) {
      buffer = await this.loadAudioFile(DEFAULT_AUDIO.defeat);
      if (buffer) this.buffers.set("defeat", buffer);
    }

    if (!buffer) {
      console.warn("Defeat audio not available");
      return;
    }

    this.playBuffer(buffer, false);
  }

  private playBuffer(buffer: AudioBuffer, loop: boolean): void {
    if (!this.audioContext || !this.gainNode) return;

    // Create new source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(this.gainNode);
    
    source.onended = () => {
      if (!loop) {
        this.isPlaying = false;
      }
    };

    source.start(0);
    this.currentSource = source;
    this.currentBuffer = buffer;
    this.isPlaying = true;
  }

  /**
   * Stop music with fade out
   * @param fadeDuration - Fade out duration in ms (default 500ms)
   */
  stopMusic(fadeDuration: number = 500): void {
    if (!this.audioContext || !this.gainNode || !this.currentSource) {
      return;
    }

    // Clear any existing fade timeout
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }

    const source = this.currentSource;
    const currentTime = this.audioContext.currentTime;
    
    // Fade out
    this.gainNode.gain.cancelScheduledValues(currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeDuration / 1000);

    // Stop after fade
    this.fadeTimeout = setTimeout(() => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
      this.currentSource = null;
      this.isPlaying = false;
    }, fadeDuration);
  }

  /**
   * Set volume level
   * @param level - Volume between 0 and 1
   */
  setVolume(level: number): void {
    this.volume = Math.max(0, Math.min(1, level));
    
    if (this.audioContext && this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
  }

  /**
   * Get current volume level
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Check if music is currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Wait for audio files to be preloaded
   */
  async waitForLoad(): Promise<void> {
    if (this.loadingPromise) {
      await this.loadingPromise;
    }
  }

  /**
   * Cleanup - call when unmounting
   */
  dispose(): void {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) {
        // Already stopped
      }
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.buffers.clear();
  }
}

// Singleton instance
let battleAudioInstance: BattleAudioManager | null = null;

/**
 * Get the singleton BattleAudioManager instance
 */
export function getBattleAudio(): BattleAudioManager {
  if (!battleAudioInstance) {
    battleAudioInstance = new BattleAudioManager();
  }
  return battleAudioInstance;
}

// Export singleton directly for convenience
export const battleAudio = getBattleAudio();

// Export for use in React components
export default BattleAudioManager;
