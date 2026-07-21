export class SoundService {
  private static ctx: AudioContext | null = null;
  private static masterVolume: number = 0.5;

  private static initContext(): void {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  static setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  private static playTone(
    freqs: number[],
    duration: number,
    type: OscillatorType = "sine",
    ramp: boolean = true
  ): void {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.type = type;

      const now = this.ctx.currentTime;
      gainNode.gain.setValueAtTime(this.masterVolume, now);

      if (freqs.length === 1) {
        osc.frequency.setValueAtTime(freqs[0], now);
      } else {
        // Play chord or arpeggio sequence
        freqs.forEach((freq, index) => {
          osc.frequency.setValueAtTime(freq, now + (index * duration) / freqs.length);
        });
      }

      if (ramp) {
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else {
        gainNode.gain.setValueAtTime(this.masterVolume, now + duration - 0.05);
        gainNode.gain.linearRampToValueAtTime(0.001, now + duration);
      }

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Failed to play synthesis tone", e);
    }
  }

  static playNewBall(): void {
    // Elegant synth chime ascending
    this.playTone([523.25, 659.25, 783.99], 0.35, "sine");
  }

  static playPause(): void {
    // Warm warning sound
    this.playTone([440, 349.23], 0.4, "triangle");
  }

  static playResume(): void {
    // High confirmation beep
    this.playTone([587.33, 880], 0.25, "sine");
  }

  static playLineWinner(): void {
    // Happy fanfare (Major chord arpeggio)
    this.playTone([523.25, 659.25, 783.99, 1046.5], 0.6, "sine");
  }

  static playBingoWinner(): void {
    // Grand celebration arpeggio
    this.playTone([523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98], 0.9, "triangle");
  }

  static playError(): void {
    // Low buzzer
    this.playTone([150, 120], 0.5, "sawtooth", false);
  }

  static playFinished(): void {
    // End fanfare
    this.playTone([523.25, 783.99, 523.25, 1046.5], 0.8, "sine");
  }

  static triggerVibration(pattern: number | number[]): void {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}
