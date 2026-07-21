export class WakeLockService {
  private static sentinel: WakeLockSentinel | null = null;
  private static enabled: boolean = true;

  static isSupported(): boolean {
    return typeof navigator !== "undefined" && "wakeLock" in navigator;
  }

  static setEnabled(val: boolean): void {
    this.enabled = val;
    if (!val) {
      this.release();
    }
  }

  static isEnabled(): boolean {
    return this.enabled;
  }

  static async request(): Promise<boolean> {
    if (!this.isSupported() || !this.enabled) return false;
    try {
      this.sentinel = await navigator.wakeLock.request("screen");
      this.sentinel.addEventListener("release", () => {
        // Sentinel released
      });
      return true;
    } catch (err) {
      console.warn("Screen Wake Lock request failed:", err);
      return false;
    }
  }

  static async release(): Promise<void> {
    if (this.sentinel) {
      try {
        await this.sentinel.release();
        this.sentinel = null;
      } catch (err) {
        console.warn("Screen Wake Lock release failed:", err);
      }
    }
  }

  static isActive(): boolean {
    return !!this.sentinel;
  }

  static reacquireIfNeeded(): void {
    if (this.enabled && !this.sentinel && typeof document !== "undefined" && document.visibilityState === "visible") {
      this.request();
    }
  }
}

// Add lifecycle listener for tab visibility change
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      WakeLockService.reacquireIfNeeded();
    }
  });
}
