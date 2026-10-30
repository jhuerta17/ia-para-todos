import { isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const STORAGE_KEY = 'admin-demo';

/**
 * Demo mode: swaps live data for deterministic synthetic data so the
 * dashboard can be evaluated before real operations accumulate.
 * Off by default; enabled via `?demo=1` or the account menu, persisted
 * per browser. Always paired with the visible demo banner.
 */
@Injectable({ providedIn: 'root' })
export class DemoState {
  readonly enabled = signal(false);

  constructor() {
    if (isPlatformServer(inject(PLATFORM_ID))) return;
    const params = new URLSearchParams(window.location.search);
    const param = params.get('demo');
    let on = localStorage.getItem(STORAGE_KEY) === '1';
    if (param !== null) {
      on = param !== '0';
      if (on) localStorage.setItem(STORAGE_KEY, '1');
      else localStorage.removeItem(STORAGE_KEY);
    }
    this.enabled.set(on);
  }

  enable(): void {
    this.enabled.set(true);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  disable(): void {
    this.enabled.set(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  toggle(): void {
    if (this.enabled()) this.disable();
    else this.enable();
  }
}
