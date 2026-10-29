import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActionLink } from '../action-link';

@Component({
  selector: 'app-community-invitation',
  imports: [ActionLink],
  templateUrl: './community-invitation.html',
  styleUrl: './community-invitation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityInvitation {
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly copy = viewChild.required<ElementRef<HTMLElement>>('copy');
  protected readonly moving = signal(false);
  protected readonly spread = signal(1);

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0;
      const update = () => {
        frame = 0;
        const offset = window.innerWidth >= 810 ? 30 : 0;
        const height = window.innerHeight - offset;
        const enabled = !preference.matches && height >= 800 && this.copy().nativeElement.offsetHeight + 380 <= height;
        this.moving.set(enabled);
        if (!enabled) { this.spread.set(0); return; }
        const section = this.section().nativeElement;
        const distance = Math.max(1, section.offsetHeight - height);
        const progress = Math.max(0, Math.min(1, (offset - section.getBoundingClientRect().top) / distance));
        this.spread.set(1 - progress);
      };
      const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      const observer = new ResizeObserver(schedule);
      observer.observe(this.section().nativeElement);
      observer.observe(this.copy().nativeElement);
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      preference.addEventListener('change', schedule);
      update();
      this.destroy.onDestroy(() => {
        observer.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        preference.removeEventListener('change', schedule);
        window.cancelAnimationFrame(frame);
      });
    });
  }

  protected readonly photographs = [
    'peer-support', 'community-group', 'everyday-phone', 'community-learning',
    'collaboration', 'family-learning', 'family-phone', 'accessible-technology',
  ];
}
