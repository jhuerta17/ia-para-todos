import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { workshops } from '../../data/workshops';
import { ActionLink } from '../action-link';
import { WorkshopCard } from '../workshop-card/workshop-card';

@Component({
  selector: 'app-workshop-section',
  imports: [ActionLink, WorkshopCard],
  templateUrl: './workshop-section.html',
  styleUrl: './workshop-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopSection {
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly rowElements = viewChildren<ElementRef<HTMLElement>>('row');
  protected readonly stackEnabled = signal(false);
  protected readonly scale = signal(1);
  protected readonly rows = [workshops.slice(0, 2), workshops.slice(2)];

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0;
      const update = () => {
        frame = 0;
        const [first, second] = this.rowElements().map(row => row.nativeElement);
        const enabled = !preference.matches && window.innerWidth >= 810 && first.offsetHeight + 92 <= window.innerHeight;
        this.stackEnabled.set(enabled);
        const progress = Math.max(0, Math.min(1, (window.innerHeight - second.getBoundingClientRect().top) / (window.innerHeight * .35)));
        this.scale.set(enabled ? 1 - .1 * progress : 1);
      };
      const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      const observer = new ResizeObserver(schedule);
      this.rowElements().forEach(row => observer.observe(row.nativeElement));
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
}
