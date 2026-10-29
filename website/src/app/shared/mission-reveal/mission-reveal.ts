import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { BrandMark } from '../brand-mark';

type Token = { kind: 'word'; text: string } | { kind: 'logo' | 'portraits' | 'photo' };
const words = (text: string): Token[] => text.split(' ').map(text => ({ kind: 'word', text }));

@Component({
  selector: 'app-mission-reveal',
  imports: [BrandMark],
  templateUrl: './mission-reveal.html',
  styleUrl: './mission-reveal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissionReveal {
  private readonly document = inject(DOCUMENT);
  private readonly destroy = inject(DestroyRef);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly statement = viewChild.required<ElementRef<HTMLElement>>('statement');
  protected readonly animated = signal(false);
  protected readonly unpinned = signal(false);
  protected readonly progress = signal(1);
  protected readonly tokens: Token[] = [
    ...words('Queremos reducir la brecha digital con talleres gratuitos, accesibles y prácticos.'),
    { kind: 'logo' },
    ...words('Aprender IA en español, con palabras sencillas y ejemplos cotidianos.'),
    { kind: 'portraits' },
    ...words('En comunidad, a tu ritmo y desde cero.'),
    { kind: 'photo' },
  ];

  protected reveal(index: number): number {
    return Math.max(0, Math.min(1, (this.progress() * (this.tokens.length + 4) - index) / 4));
  }

  constructor() {
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      let frame = 0;
      const update = () => {
        frame = 0;
        const element = this.section().nativeElement;
        const statement = this.statement().nativeElement;
        const style = window.getComputedStyle(element);
        const top = parseFloat(style.getPropertyValue('--sticky-top'));
        const tooTall = statement.offsetHeight > window.innerHeight - top - 24;
        this.unpinned.set(tooTall);
        this.animated.set(!preference.matches && !tooTall);
        if (preference.matches || tooTall) {
          this.progress.set(1);
          return;
        }
        const rect = element.getBoundingClientRect();
        const paddingTop = parseFloat(style.paddingTop);
        const paddingBottom = parseFloat(style.paddingBottom);
        const stickyTravel = rect.height - paddingTop - paddingBottom - statement.offsetHeight;
        const viewportTravel = rect.height - window.innerHeight + top - paddingTop;
        const travel = Math.max(1, Math.min(stickyTravel, viewportTravel));
        this.progress.set(Math.max(0, Math.min(1, (top - paddingTop - rect.top) / travel)));
      };
      const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
      const observer = new ResizeObserver(schedule);
      observer.observe(this.section().nativeElement);
      observer.observe(this.statement().nativeElement);
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
