import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';

@Directive({
  selector: '[appStackedRows]',
  host: { '[class.stack-enabled]': 'enabled()', '[style.--stack-scale]': 'scale()' },
})
export class StackedRows {
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  protected readonly enabled = signal(false);
  protected readonly scale = signal(1);

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      const [first, second] = Array.from(this.element.nativeElement.children) as HTMLElement[];
      if (!window || !first || !second) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0;
      const update = () => {
        frame = 0;
        const enabled = !preference.matches && window.innerWidth >= 810 && first.offsetHeight + 92 <= window.innerHeight;
        this.enabled.set(enabled);
        const progress = Math.max(0, Math.min(1, (window.innerHeight - second.getBoundingClientRect().top) / (window.innerHeight * .35)));
        this.scale.set(enabled ? 1 - .1 * progress : 1);
      };
      const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      const observer = new ResizeObserver(schedule);
      observer.observe(first);
      observer.observe(second);
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
