import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { BrandMark } from '../brand-mark';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

type Token = { kind: 'word'; text: string } | { kind: 'logo' | 'portraits' | 'photo' };
const words = (text: string): Token[] => text.split(' ').map(text => ({ kind: 'word', text }));

const sentences: Record<Lang, string[]> = {
  es: [
    'Queremos reducir la brecha digital con talleres gratuitos, accesibles y prácticos.',
    'Aprender IA en español, con palabras sencillas y ejemplos cotidianos.',
    'En comunidad, a tu ritmo y desde cero.',
  ],
  en: [
    'We want to close the digital divide with free, accessible, hands-on workshops.',
    'Learn AI in Spanish, with simple words and everyday examples.',
    'In community, at your pace, from scratch.',
  ],
};

const chrome = {
  es: { mission: 'Nuestra misión', portraits: 'Retratos', photo: 'Personas adultas alrededor de una computadora.' },
  en: { mission: 'Our mission', portraits: 'Portraits', photo: 'Adults around a computer.' },
};

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
  private readonly language = inject(Language);
  protected readonly c = computed(() => chrome[this.language.lang()]);
  protected readonly tokens = computed(() => {
    const lines = sentences[this.language.lang()];
    return [
      ...words(lines[0]),
      { kind: 'logo' },
      ...words(lines[1]),
      { kind: 'portraits' },
      ...words(lines[2]),
      { kind: 'photo' },
    ] as Token[];
  });

  protected reveal(index: number): number {
    return Math.max(0, Math.min(1, (this.progress() * (this.tokens().length + 4) - index) / 4));
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
