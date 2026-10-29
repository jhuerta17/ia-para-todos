import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Workshop } from '../../data/workshops';
import { ActionLink } from '../action-link';

@Component({
  selector: 'app-workshop-card',
  imports: [RouterLink, ActionLink],
  templateUrl: './workshop-card.html',
  styleUrl: './workshop-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.motion-ready]': 'motionReady()', '[class.entered]': 'entered()' },
})
export class WorkshopCard {
  readonly workshop = input.required<Workshop>();
  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  protected readonly motionReady = signal(false);
  protected readonly entered = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!this.document.defaultView || this.document.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.motionReady.set(true);
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.entered.set(true);
          observer.disconnect();
        }
      }, { threshold: 0.05 });
      observer.observe(this.host.nativeElement);
      this.destroy.onDestroy(() => observer.disconnect());
    });
  }
}
