import { DOCUMENT, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

/** Wipe panel lifecycle: rest, rising to cover, fully covered (the route
 * swaps underneath), rising away to reveal, then back to rest. */
export type PageTransitionState = 'idle' | 'covering' | 'covered' | 'revealing';

/** Pause on full cover so the swap and scroll reset stay hidden. */
const HOLD_MS = 120;
/** Failsafes bound every wait so navigation never hangs behind the panel,
 * even if a transitionend is lost (background tab, interrupted style). */
const SETTLE_FAILSAFE_MS = 1500;

/**
 * Owns the full-page wipe shown between public routes. The guard awaits
 * beginCover so the old page stays mounted under the rising panel; the
 * shell calls reveal once the new route activates and reset when a
 * navigation is cancelled or fails. Motion runs only in the browser
 * when the user has not asked to reduce it; everywhere else every call
 * is an instant no-op and the panel stays hidden.
 */
@Injectable({ providedIn: 'root' })
export class PageTransition {
  private readonly document = inject(DOCUMENT);
  private readonly server = isPlatformServer(inject(PLATFORM_ID));
  private readonly stateSignal = signal<PageTransitionState>('idle');
  readonly state = this.stateSignal.asReadonly();

  private coverTimer: ReturnType<typeof setTimeout> | undefined;
  private holdTimer: ReturnType<typeof setTimeout> | undefined;
  private revealTimer: ReturnType<typeof setTimeout> | undefined;
  private coverResolve: (() => void) | undefined;

  get enabled(): boolean {
    if (this.server) return false;
    return this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches !== true;
  }

  /**
   * Slides the panel up to full cover; resolves once covered. A repeated
   * call while covered resolves at once (rapid navigation during the
   * hold); a call mid-reveal turns the panel back down into cover.
   */
  beginCover(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    this.releaseCoverWaiter();
    this.clearTimers();
    if (this.stateSignal() === 'covered') return Promise.resolve();
    this.setState('covering');
    return new Promise<void>((resolve) => {
      this.coverResolve = resolve;
      this.coverTimer = setTimeout(() => this.markCovered(), SETTLE_FAILSAFE_MS);
    });
  }

  /** Called when the cover animation lands (or its failsafe fires). */
  markCovered(): void {
    if (this.stateSignal() !== 'covering') return;
    this.clearCoverTimer();
    this.setState('covered');
    this.releaseCoverWaiter();
  }

  /** After activation, holds full cover briefly, then slides the panel up
   * and away to reveal the new page. No-op at rest. */
  reveal(): void {
    if (!this.enabled || this.stateSignal() === 'idle') {
      this.reset();
      return;
    }
    this.releaseCoverWaiter();
    this.clearTimers();
    this.holdTimer = setTimeout(() => {
      this.holdTimer = undefined;
      this.setState('revealing');
      this.revealTimer = setTimeout(() => this.markRevealed(), SETTLE_FAILSAFE_MS);
    }, HOLD_MS);
  }

  /** Called when the reveal animation clears (or its failsafe fires). */
  markRevealed(): void {
    if (this.stateSignal() !== 'revealing') return;
    this.clearRevealTimer();
    this.setState('idle');
  }

  /** Abandons the wipe (cancelled or failed navigation): hides the panel. */
  reset(): void {
    this.releaseCoverWaiter();
    this.clearTimers();
    this.setState('idle');
  }

  /** Mirrors the state onto <body> so page content can slideshow with the
   * panel (see styles.css); removed at rest. Never touches the server DOM. */
  private setState(state: PageTransitionState): void {
    this.stateSignal.set(state);
    if (this.server) return;
    if (state === 'idle') this.document.body.removeAttribute('data-page-transition');
    else this.document.body.setAttribute('data-page-transition', state);
  }

  private releaseCoverWaiter(): void {
    this.coverResolve?.();
    this.coverResolve = undefined;
  }

  private clearCoverTimer(): void {
    if (this.coverTimer !== undefined) {
      clearTimeout(this.coverTimer);
      this.coverTimer = undefined;
    }
  }

  private clearRevealTimer(): void {
    if (this.revealTimer !== undefined) {
      clearTimeout(this.revealTimer);
      this.revealTimer = undefined;
    }
  }

  private clearTimers(): void {
    this.clearCoverTimer();
    if (this.holdTimer !== undefined) {
      clearTimeout(this.holdTimer);
      this.holdTimer = undefined;
    }
    this.clearRevealTimer();
  }
}
