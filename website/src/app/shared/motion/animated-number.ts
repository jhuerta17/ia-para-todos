import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-animated-number',
  template: `<span aria-hidden="true">{{ display() ?? value() }}</span><span class="visually-hidden">{{ value() }}</span>`,
  styles: `.visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimatedNumber {
  readonly value = input.required<number>();
  protected readonly display = signal<number | null>(null);
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (preference.matches) return;
      let frame = 0;
      const finish = () => {
        window.cancelAnimationFrame(frame);
        this.display.set(this.value());
      };
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        const start = window.performance.now();
        const tick = (time: number) => {
          const progress = Math.min(1, (time - start) / 1200);
          const eased = 1 - Math.pow(1 - progress, 3);
          this.display.set(Math.min(this.value(), Math.max(1, Math.round(this.value() * eased))));
          if (progress < 1) frame = window.requestAnimationFrame(tick);
        };
        frame = window.requestAnimationFrame(tick);
      });
      const onPreference = () => { if (preference.matches) { observer.disconnect(); finish(); } };
      const onVisibility = () => { if (this.document.hidden) { observer.disconnect(); finish(); } };
      observer.observe(this.element.nativeElement);
      preference.addEventListener('change', onPreference);
      this.document.addEventListener('visibilitychange', onVisibility);
      this.destroy.onDestroy(() => {
        observer.disconnect();
        window.cancelAnimationFrame(frame);
        preference.removeEventListener('change', onPreference);
        this.document.removeEventListener('visibilitychange', onVisibility);
      });
    });
  }
}
