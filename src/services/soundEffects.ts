// ==========================================
// AURORA CELESTIAL WEB AUDIO ENGINE
// Generates ethereal acoustic chimes & harmonic solfeggio frequencies
// ==========================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play an ethereal Solfeggio 528Hz (Transformation & Positive Clarity) chime
   */
  public playHarmonicChime(frequency: number = 528, duration: number = 1.6) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine wave with overtone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      // Gentle subtle vibrato
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.002, now + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(frequency, now + duration);

      // Smooth attack and exponential decay (no clicks)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio fallback gracefully
    }
  }

  /**
   * Play a dual harmonic alert for high opportunity or golden window entry
   */
  public playGoldenWindowAlert() {
    if (this.isMuted) return;
    this.playHarmonicChime(528, 1.2);
    setTimeout(() => {
      this.playHarmonicChime(792, 1.5); // Perfect fifth harmonic
    }, 180);
  }

  /**
   * Play a subtle deep low-frequency warning chime for Clash/Anomaly window
   */
  public playClashWarningChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now); // A3 calm grounding tone
      osc.frequency.exponentialRampToValueAtTime(196, now + 0.8); // G3 gentle slide

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // Graceful ignore
    }
  }

  /**
   * Subtle tactile haptic click
   */
  public playRadarTick() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Safe fallback
    }
  }
}

export const soundEngine = new SoundEngine();
