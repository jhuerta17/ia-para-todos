import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild, viewChildren } from '@angular/core';
import { learningBenefits } from '../../data/learning-benefits';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Icon } from '../icon';
import { Language } from '../../i18n/language';

const copy = {
  es: { heading: 'Lo que te llevas de cada taller' },
  en: { heading: 'What you take from each workshop' },
};

@Component({
  selector: 'app-learning-benefits',
  imports: [Icon, RevealOnEnter],
  templateUrl: './learning-benefits.html',
  styleUrl: './learning-benefits.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningBenefits {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly benefits = computed(() => learningBenefits[this.language.lang()]);
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly panels = viewChildren<ElementRef<HTMLElement>>('panel');
  protected readonly pinned = signal(false);
  protected readonly nearby = signal(false);
  private readonly lower = signal(0);
  private readonly blend = signal(0);

  protected imageOpacity(index: number): number {
    if (index === this.lower()) return 1;
    return index === this.lower() + 1 ? this.blend() : 0;
  }

  protected currentAlt(): string {
    const index = this.lower() + (this.blend() > .5 ? 1 : 0);
    return this.benefits()[index]?.alt ?? '';
  }

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0;
      const update = () => {
        frame = 0;
        const tallest = Math.max(0, ...this.panels().map(panel => panel.nativeElement.querySelector<HTMLElement>('.benefit-copy')?.offsetHeight ?? 0));
        const enabled = !preference.matches && window.innerWidth >= 810 && window.innerHeight >= 600 && tallest + 128 <= window.innerHeight;
        this.pinned.set(enabled);
        if (!enabled) { this.lower.set(0); this.blend.set(0); return; }
        const progress = Math.max(0, Math.min(this.benefits().length - 1, -this.section().nativeElement.getBoundingClientRect().top / window.innerHeight));
        const lower = Math.floor(progress);
        this.lower.set(lower);
        this.blend.set(Math.max(0, Math.min(1, (progress - lower - .35) / .6)));
      };
      const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      const preloadObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.nearby.set(true);
          preloadObserver.disconnect();
        }
      }, { rootMargin: '1000px 0px' });
      preloadObserver.observe(this.section().nativeElement);
      const observer = new ResizeObserver(schedule);
      observer.observe(this.section().nativeElement);
      this.panels().forEach(panel => {
        const copy = panel.nativeElement.querySelector('.benefit-copy');
        if (copy) observer.observe(copy);
      });
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);
      preference.addEventListener('change', schedule);
      update();
      this.destroy.onDestroy(() => {
        observer.disconnect();
        preloadObserver.disconnect();
        window.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
        preference.removeEventListener('change', schedule);
        window.cancelAnimationFrame(frame);
      });
    });
  }
}
