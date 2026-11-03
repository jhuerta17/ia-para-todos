import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PageTransition } from './page-transition.service';

/** Full-viewport solid panel that wipes up to cover the old page on
 * navigation, then keeps rising to reveal the new one. Purely
 * decorative (aria-hidden); the PageTransition service owns its state. */
@Component({
  selector: 'app-page-transition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-transition-overlay.html',
  styleUrl: './page-transition-overlay.css',
})
export class PageTransitionOverlay {
  protected readonly transition = inject(PageTransition);

  protected onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform') return;
    if (this.transition.state() === 'covering') this.transition.markCovered();
    else if (this.transition.state() === 'revealing') this.transition.markRevealed();
  }
}
