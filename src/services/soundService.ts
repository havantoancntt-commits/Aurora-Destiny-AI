// ==========================================================
// SACRED CELESTIAL SOUND ENGINE (WEB AUDIO API)
// 100% Pure Client-side Synthesis — Zero External Network Dependencies
// Solfeggio 432Hz/528Hz Meditation Drones, Tibetan Singing Bowl & Chimes
// ==========================================================

class SacredSoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private currentMode: '432hz' | '528hz' | 'zen' = '432hz';

  constructor() {
    // Lazy audio context initialization on first user interaction
    try {
      const savedMute = localStorage.getItem('aurora_sound_muted');
      if (savedMute === 'true') {
        this.isMuted = true;
      }
    } catch {
      // Ignore storage errors
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
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

  // Tibetan Singing Bowl (Bát Nhã Chuông Ngân)
  public playTibetanBowl(baseFreq: number = 432) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
      masterGain.connect(ctx.destination);

      // Harmonics of Tibetan singing bowl (fundamental, octave, perfect fifth, minor 7th)
      const harmonics = [
        { freq: baseFreq, gain: 0.6 },
        { freq: baseFreq * 2.01, gain: 0.28 },
        { freq: baseFreq * 3.02, gain: 0.14 },
        { freq: baseFreq * 4.53, gain: 0.08 },
      ];

      harmonics.forEach((h) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(h.freq, now);

        // Subtle slow pitch vibrato / pulsation
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(4.2, now); // 4.2Hz sacred beating
        lfoGain.gain.setValueAtTime(1.8, now);
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + 5.5);

        oscGain.gain.setValueAtTime(h.gain, now);
        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 5.5);
      });
    } catch (e) {
      console.warn('Sacred Sound: Bowl failed', e);
    }
  }

  // Celestial Wind Chime / Star Sparkle Bell (Chuông Gió Thiên Không)
  public playCelestialChime(frequency: number = 864) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      master.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.4);

      osc.connect(master);
      osc.start(now);
      osc.stop(now + 2.2);
    } catch {
      // Ignore
    }
  }

  // Sacred Gentle Tap / Lotus Droplet (Tiếng Chạm Thanh Tịnh Khi Bấm Mục Điền Thông Tin)
  public playSacredTap(frequency: number = 528) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.05, now + 0.1);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // Safe fallback
    }
  }

  // Sacred Ascending Triad / Milestone Chime (Chuông Tam Hợp Hoàn Mãn)
  public playSacredSuccess() {
    if (this.isMuted) return;
    const notes = [528, 660, 792]; // Solfeggio 528Hz major triad
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playSacredTap(freq);
      }, idx * 120);
    });
  }

  // Sacred Temple Gong / Đại Hồng Chung (Tiếng Chuông Chùa Trầm Hùng Khai Quang)
  public playTempleGong(baseFreq: number = 108) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 7.0); // 7s long sacred reverberation
      master.connect(ctx.destination);

      // Deep temple bell harmonic overtones
      const partials = [
        { f: baseFreq, g: 0.5 },
        { f: baseFreq * 2.12, g: 0.28 },
        { f: baseFreq * 3.41, g: 0.16 },
        { f: baseFreq * 4.76, g: 0.08 }
      ];

      partials.forEach((p) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.f, now);

        gain.gain.setValueAtTime(p.g, now);
        osc.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 7.0);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Ancient Bronze Coin Toss (Tiếng 3 Đồng Tiền Xu Cổ Gieo Quẻ)
  public playCoinToss() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const notes = [1420, 1680, 1940];
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.08;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        gain.connect(ctx.destination);

        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + Math.random() * 40 - 20, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } catch {
      // Ignore
    }
  }

  // Solfeggio 432Hz / 528Hz Ambient Drone (Sóng Thiền Vũ Trụ Dài Lắng Đọng)
  public startAmbient(mode: '432hz' | '528hz' | 'zen' = '432hz') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.stopAmbient();
    this.currentMode = mode;

    try {
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.06, now + 3.0); // Soft fade-in

      // Lowpass filter for warm, velvety meditation vibe
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);
      this.ambientGain.connect(filter);
      filter.connect(ctx.destination);

      const base = mode === '528hz' ? 132 : 108; // sub-harmonics of 528Hz / 432Hz
      const freqs = [base, base * 1.5, base * 2, base * 3];

      this.ambientOscillators = freqs.map((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f + (i === 1 ? 0.3 : 0), now); // Binaural beating 0.3Hz Theta wave

        const individualGain = ctx.createGain();
        individualGain.gain.setValueAtTime(0.25 / (i + 1), now);
        osc.connect(individualGain);
        individualGain.connect(this.ambientGain!);

        osc.start(now);
        return osc;
      });

      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Sacred Sound: Ambient failed', e);
    }
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        setTimeout(() => {
          this.ambientOscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
          this.ambientOscillators = [];
          this.isAmbientPlaying = false;
        }, 1250);
      } catch {
        this.ambientOscillators = [];
        this.isAmbientPlaying = false;
      }
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('aurora_sound_muted', this.isMuted ? 'true' : 'false');
    } catch {}

    if (this.isMuted) {
      this.stopAmbient();
    } else {
      this.playTibetanBowl(432);
      this.startAmbient(this.currentMode);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }

  public getCurrentMode(): '432hz' | '528hz' | 'zen' {
    return this.currentMode;
  }
}

export const sacredSound = new SacredSoundEngine();
