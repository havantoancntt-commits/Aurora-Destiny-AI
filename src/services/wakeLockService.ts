// ==========================================================
// AURORA DESTINY AI — SCREEN WAKE LOCK API SERVICE
// Prevents device screen from dimming/sleeping during
// Sacred 432Hz/528Hz Meditation & Live Celestial Observation
// ==========================================================

export type WakeLockStateListener = (isActive: boolean) => void;

class WakeLockService {
  private sentinel: any = null;
  private isRequested: boolean = false;
  private listeners: Set<WakeLockStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isRequested && !this.sentinel) {
          // Re-acquire lock on tab focus
          this.requestLock().catch(() => {});
        }
      });
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public isActive(): boolean {
    return this.sentinel !== null && !this.sentinel.released;
  }

  public async requestLock(): Promise<boolean> {
    if (!this.isSupported()) return false;
    this.isRequested = true;

    try {
      if (this.sentinel && !this.sentinel.released) {
        return true;
      }
      this.sentinel = await (navigator as any).wakeLock.request('screen');
      this.sentinel.addEventListener('release', () => {
        this.notifyListeners(false);
      });
      this.notifyListeners(true);
      return true;
    } catch (err) {
      console.warn('⚠️ [Wake Lock API] Could not acquire screen wake lock:', err);
      this.sentinel = null;
      this.notifyListeners(false);
      return false;
    }
  }

  public async releaseLock(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {}
      this.sentinel = null;
    }
    this.notifyListeners(false);
  }

  public async toggle(): Promise<boolean> {
    if (this.isActive()) {
      await this.releaseLock();
      return false;
    } else {
      return await this.requestLock();
    }
  }

  public subscribe(listener: WakeLockStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isActive());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(active: boolean) {
    this.listeners.forEach((fn) => {
      try {
        fn(active);
      } catch {}
    });
  }
}

export const wakeLockService = new WakeLockService();
