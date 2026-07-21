export class AutoDrawScheduler {
  private static timerId: any = null;
  private static startTime: number = 0;
  private static delayMs: number = 5000;
  private static onDrawCallback: () => void = () => {};
  private static isPaused: boolean = false;
  private static remainingMs: number = 0;

  static start(delaySeconds: number, onDraw: () => void): void {
    this.cancel();
    this.delayMs = delaySeconds * 1000;
    this.onDrawCallback = onDraw;
    this.isPaused = false;
    this.scheduleNext(this.delayMs);
  }

  private static scheduleNext(delay: number): void {
    this.cancelTimerOnly();
    this.startTime = performance.now();
    this.remainingMs = delay;

    this.timerId = setTimeout(() => {
      this.timerId = null;
      if (!this.isPaused) {
        this.onDrawCallback();
      }
    }, delay);
  }

  static pause(): void {
    if (this.isPaused || !this.timerId) return;
    this.isPaused = true;

    const elapsed = performance.now() - this.startTime;
    this.remainingMs = Math.max(0, this.remainingMs - elapsed);
    this.cancelTimerOnly();
  }

  static resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.scheduleNext(this.remainingMs);
  }

  static cancel(): void {
    this.cancelTimerOnly();
    this.isPaused = false;
    this.remainingMs = 0;
  }

  private static cancelTimerOnly(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  static getRemainingTime(): number {
    if (!this.timerId && !this.isPaused) return 0;
    if (this.isPaused) return this.remainingMs / 1000;
    const elapsed = performance.now() - this.startTime;
    return Math.max(0, this.remainingMs - elapsed) / 1000;
  }
}
