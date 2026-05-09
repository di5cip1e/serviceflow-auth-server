import * as Tone from "tone";
import { ASSETS } from "../manifest.js";

export class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.isMuted = false;
    this.initialized = false;
    this.isInitializing = false;

    // Synth for build sounds
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.synth.volume.value = -10;

    // Synth for UI sounds - using PolySynth to handle rapid clicks without scheduling errors
    this.uiSynth = new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: { type: "square" },
      envelope: { attack: 0.01, release: 0.1 },
    }).toDestination();
    this.uiSynth.volume.value = -15;

    // Background Music
    this.bgMusicPlayer = new Tone.Player({
      url: ASSETS.audio.bgMusic,
      loop: true,
      autostart: false,
      fadeOut: 1,
    }).toDestination();
    this.bgMusicPlayer.volume.value = -10;
  }

  async init() {
    if (this.initialized || this.isInitializing) return;
    this.isInitializing = true;

    try {
      // Resume audio context - required for mobile browsers
      if (Tone.context.state !== "running") {
        await Tone.context.resume();
      }
      await Tone.start();
      this.initialized = true;

      // Wait for player to load, then start
      await Tone.loaded();
      if (this.bgMusicPlayer.buffer.loaded && !this.isMuted) {
        this.bgMusicPlayer.start();
      }
    } finally {
      this.isInitializing = false;
    }
  }

  async toggleMute() {
    // Initialize audio on first interaction (mobile support)
    if (!this.initialized) {
      await this.init();
    }
    this.isMuted = !this.isMuted;
    Tone.getDestination().mute = this.isMuted;
    this.playUISound();
    return this.isMuted;
  }

  playBuildSound() {
    if (!this.initialized || this.isMuted) return;
    const now = Tone.now();
    this.synth.triggerAttackRelease("C4", "8n", now);
    this.synth.triggerAttackRelease("E4", "8n", now + 0.05);
  }

  playUISound() {
    if (!this.initialized || this.isMuted) return;
    // Explicitly using Tone.now() to ensure the scheduling is based on the current context time
    this.uiSynth.triggerAttackRelease("G5", "16n", Tone.now());
  }
}
