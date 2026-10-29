import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, ElementRef, inject, signal } from '@angular/core';

@Directive({
  selector: '[appRevealOnEnter]',
  host: { '[class.motion-ready]': 'ready()', '[class.entered]': 'entered()' },
})
export class RevealOnEnter {
  private readonly document = inject(DOCUMENT);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroy = inject(DestroyRef);
  protected readonly ready = signal(false);
  protected readonly entered = signal(false);

  constructor() {
    afterNextRender(() => {
      if (!this.document.defaultView || this.document.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.ready.set(true);
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.entered.set(true);
          observer.disconnect();
        }
      }, { threshold: .05 });
      observer.observe(this.element.nativeElement);
      this.destroy.onDestroy(() => observer.disconnect());
    });
  }
}
