import { DOCUMENT } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActionLink } from '../action-link';
import { Icon } from '../icon';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';
import { LearningComparison } from '../learning-comparison/learning-comparison';

const copy = {
  es: { section: 'Un programa pensado para ti', pause: 'Pausar movimiento del programa', resume: 'Reanudar movimiento del programa', topics: 'Temas', fromScratch: 'Para aprender desde cero.', portraits: 'Retratos ilustrativos', photo: 'Fotografía ilustrativa de una práctica con acompañamiento.', duration: 'Duración', free: 'Sin costo', participation: 'Participación', noPaidTools: 'Sin herramientas de pago.', participate: 'Participar', examples: 'Ejemplos de práctica, no testimonios', practiceExample: 'Ejemplo de práctica' },
  en: { section: 'A program designed for you', pause: 'Pause program movement', resume: 'Resume program movement', topics: 'Topics', fromScratch: 'To learn from scratch.', portraits: 'Illustrative portraits', photo: 'Illustrative photo of guided practice with support.', duration: 'Duration', free: 'Free', participation: 'Participation', noPaidTools: 'No paid tools.', participate: 'Participate', examples: 'Practice examples, not testimonials', practiceExample: 'Practice example' },
};

const examples: Record<Lang, { text: string; category: string }[]> = {
  es: [
    { text: 'Explícame este aviso con palabras sencillas.', category: 'Vida diaria' },
    { text: 'Ayúdame a organizar una semana de estudio.', category: 'Primeros pasos' },
    { text: '¿Qué debería verificar antes de compartir esto?', category: 'Uso responsable' },
  ],
  en: [
    { text: 'Explain this notice to me in simple words.', category: 'Everyday life' },
    { text: 'Help me organize a study week.', category: 'First steps' },
    { text: 'What should I verify before sharing this?', category: 'Responsible use' },
  ],
};

@Component({
  selector: 'app-program-facts',
  imports: [ActionLink, Icon, LearningComparison],
  templateUrl: './program-facts.html',
  styleUrls: ['./program-facts.css', './program-facts-motion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramFacts {
  private readonly document = inject(DOCUMENT);
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly examples = computed(() => examples[this.language.lang()]);
  private readonly destroy = inject(DestroyRef);
  private readonly orbit = viewChild.required<ElementRef<HTMLElement>>('orbit');
  private readonly examplePanel = viewChild.required<ElementRef<HTMLElement>>('examplePanel');
  private elapsed = 0;
  protected readonly paused = signal(false);
  protected readonly motionReady = signal(false);
  protected readonly orbitVisible = signal(false);
  protected readonly examplesVisible = signal(false);
  protected readonly pageHidden = signal(false);
  protected readonly count = signal(4);

  protected readonly portraits = Array.from({ length: 9 }, (_, i) => ({
    image: `/images/portrait-${String(i + 1).padStart(2, '0')}-256.webp`,
    start: i * 100 / 9,
    x: 50 + 35 * Math.cos(i * 2 * Math.PI / 9),
    y: 50 + 39 * Math.sin(i * 2 * Math.PI / 9),
  }));
  protected toggleMotion(): void {
    this.elapsed = 1200;
    this.count.set(4);
    this.paused.update(value => !value);
  }

  constructor() {
    effect(onCleanup => {
      if (!this.motionReady() || !this.orbitVisible() || this.pageHidden() || this.paused()) return;
      const window = this.document.defaultView;
      if (!window || this.elapsed >= 1200) return;
      let frame = 0;
      let previous = 0;
      const tick = (time: number) => {
        if (previous) this.elapsed += time - previous;
        previous = time;
        this.count.set(Math.min(4, 1 + Math.floor(this.elapsed / 400)));
        if (this.elapsed < 1200) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
      onCleanup(() => window.cancelAnimationFrame(frame));
    });
    afterNextRender(() => {
      const window = this.document.defaultView;
      if (!window) return;
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      const updatePreference = () => {
        this.motionReady.set(!preference.matches);
        if (preference.matches) { this.elapsed = 1200; this.count.set(4); }
      };
      const updateVisibility = () => this.pageHidden.set(this.document.hidden);
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const visible = entry.intersectionRatio > .01;
          if (entry.target === this.orbit().nativeElement) this.orbitVisible.set(visible);
          else this.examplesVisible.set(visible);
        }
      }, { threshold: .01 });
      observer.observe(this.orbit().nativeElement);
      observer.observe(this.examplePanel().nativeElement);
      updatePreference();
      updateVisibility();
      preference.addEventListener('change', updatePreference);
      this.document.addEventListener('visibilitychange', updateVisibility);
      this.destroy.onDestroy(() => {
        observer.disconnect();
        preference.removeEventListener('change', updatePreference);
        this.document.removeEventListener('visibilitychange', updateVisibility);
      });
    });
  }

}
