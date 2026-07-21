import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mocking speechSynthesis
if (typeof window !== "undefined") {
  const mockSpeechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn().mockReturnValue([
      { name: "Google Español", lang: "es-ES", default: true }
    ]),
    speaking: false
  };

  Object.defineProperty(window, "speechSynthesis", {
    value: mockSpeechSynthesis,
    writable: true
  });

  (window as any).SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    onend: null,
    onerror: null
  }));
}

// Mocking Crypto getRandomValues
if (typeof window !== "undefined" && !window.crypto) {
  (window as any).crypto = {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 100000);
      }
      return arr;
    },
    subtle: {
      digest: async () => new ArrayBuffer(32)
    }
  };
}
