import { numberToWordsES } from "../../domain/bingo/numberWords";
import { BingoLetter } from "../../domain/bingo/types";

export class SpeechService {
  private static synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  private static currentVoiceName: string | null = localStorage.getItem("bt_selected_voice");

  static isSupported(): boolean {
    return !!this.synth;
  }

  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  static selectVoice(name: string): void {
    this.currentVoiceName = name;
    localStorage.setItem("bt_selected_voice", name);
  }

  static getSelectedVoiceName(): string | null {
    return this.currentVoiceName;
  }

  static cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  static isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  private static findVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (voices.length === 0) return null;
    
    // 1. Precise match
    if (this.currentVoiceName) {
      const match = voices.find((v) => v.name === this.currentVoiceName);
      if (match) return match;
    }

    // 2. Spanish locales exact
    const preferredLocales = ["es-VE", "es-ES", "es-MX", "es-CO", "es-AR", "es-US"];
    for (const locale of preferredLocales) {
      const match = voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase());
      if (match) return match;
    }

    // 3. Any Spanish locale
    const esMatch = voices.find((v) => v.lang.toLowerCase().startsWith("es"));
    if (esMatch) return esMatch;

    // 4. Default
    return voices.find((v) => v.default) || voices[0];
  }

  static testVoice(
    settings: { rate: number; pitch: number; volume: number },
    onEnd?: () => void
  ): void {
    if (!this.synth) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance("Audio activado y voz de prueba lista.");
    const voices = this.getAvailableVoices();
    const voice = this.findVoice(voices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    this.synth.speak(utterance);
  }

  static announceBall(
    letter: BingoLetter,
    num: number,
    settings: { rate: number; pitch: number; volume: number },
    format: string = "letra_numero" // "letra_numero", "numero_letra", "ha_salido", "corto"
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel();

      const numWords = numberToWordsES(num);
      let text = `Letra ${letter}, ${numWords}.`;

      if (format === "numero_letra") {
        text = `Bola número ${numWords}, letra ${letter}.`;
      } else if (format === "ha_salido") {
        text = `Ha salido la ${letter}, ${numWords}.`;
      } else if (format === "corto") {
        text = `${letter}, ${numWords}.`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = this.getAvailableVoices();
      const voice = this.findVoice(voices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      // Safe timeout fallback (in case onend does not fire)
      const timeoutId = setTimeout(() => {
        resolve();
      }, 7000);

      utterance.onend = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      utterance.onerror = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }

  static announceWinner(
    winnerName: string,
    prizeName: string,
    ballLetter: BingoLetter,
    ballNumber: number,
    settings: { rate: number; pitch: number; volume: number }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synth) {
        resolve();
        return;
      }

      this.synth.cancel();
      const numWords = numberToWordsES(ballNumber);
      const text = `Ganador de ${prizeName}: ${winnerName}. Premio completado con la ${ballLetter}, ${numWords}.`;

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = this.getAvailableVoices();
      const voice = this.findVoice(voices);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }

      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      const timeoutId = setTimeout(() => {
        resolve();
      }, 9000);

      utterance.onend = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      utterance.onerror = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      this.synth.speak(utterance);
    });
  }
}
