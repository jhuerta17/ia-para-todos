import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { Lang, PHOTO_NOTE } from '../../i18n/lang';

const copy = {
  es: { pageTitle: 'Historias ilustrativas', sectionTitle: 'Cómo podría ayudarte la IA', lead: 'Ejemplos inventados para imaginar lo que podrías practicar. No son testimonios ni describen resultados reales.', region: 'Ejemplos de aprendizaje', carousel: 'carrusel', badge: 'Ejemplo ilustrativo', of: 'de', prev: 'Ejemplo anterior', next: 'Ejemplo siguiente', show: 'Mostrar ejemplo', example: 'Ejemplo' },
  en: { pageTitle: 'Illustrated stories', sectionTitle: 'How AI could help you', lead: 'Made-up examples to imagine what you could practice. Not testimonials, and they describe no real results.', region: 'Learning examples', carousel: 'carousel', badge: 'Illustrative example', of: 'of', prev: 'Previous example', next: 'Next example', show: 'Show example', example: 'Example' },
};

const stories: Record<Lang, { title: string; text: string; image: string }[]> = {
  es: [
    { title: 'Tu primera idea, paso a paso', text: 'Una persona que nunca ha usado IA escribe su primer prompt con ayuda y prepara una lista de compras para una cena imaginaria.', image: 'guided-practice' },
    { title: 'Encuentra las palabras', text: 'Una persona prepara un mensaje respetuoso para la escuela, revisa el borrador y lo adapta a su propia voz.', image: 'everyday-phone' },
    { title: 'Ordena tu experiencia', text: 'Una persona practica un currículum con información ficticia, sin compartir datos sensibles ni promesas de empleo.', image: 'work-business' },
    { title: 'Aprende en familia', text: 'Una madre o padre practica con un tema escolar inventado y prepara una pregunta para conversar en casa.', image: 'family-learning' },
    { title: 'Haz una pausa y verifica', text: 'Una familia recibe un mensaje urgente ficticio. Antes de compartirlo, revisa las señales de alerta y verifica por otro medio.', image: 'family-phone' },
  ],
  en: [
    { title: 'Your first idea, step by step', text: 'A person who has never used AI writes their first prompt with help and prepares a shopping list for an imaginary dinner.', image: 'guided-practice' },
    { title: 'Find the words', text: 'A person prepares a respectful message for the school, reviews the draft, and adapts it to their own voice.', image: 'everyday-phone' },
    { title: 'Organize your experience', text: 'A person practices a résumé with fictional information, sharing no sensitive data and no job promises.', image: 'work-business' },
    { title: 'Learn as a family', text: 'A mother or father practices with a made-up school topic and prepares a question to discuss at home.', image: 'family-learning' },
    { title: 'Pause and verify', text: 'A family receives a fictional urgent message. Before sharing it, they review the warning signs and verify another way.', image: 'family-phone' },
  ],
};

@Component({selector: 'app-learning-stories', imports: [Icon, RevealOnEnter], templateUrl: './learning-stories.html', styleUrl: './learning-stories.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class LearningStories {
  readonly pageHeading = input(false);
  protected readonly active = signal(0);
  private touchStart = 0;
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly caption = computed(() => PHOTO_NOTE[this.language.lang()].plural);
  protected readonly stories = computed(() => stories[this.language.lang()]);
  protected position(index: number): number { const distance = (index - this.active() + this.stories().length) % this.stories().length; return distance > 2 ? distance - this.stories().length : distance; }
  protected move(direction: number): void { this.active.update(value => (value + direction + this.stories().length) % this.stories().length); }
  protected onKey(event: KeyboardEvent): void { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); this.move(event.key === 'ArrowRight' ? 1 : -1); } }
  protected start(event: TouchEvent): void { this.touchStart = event.changedTouches[0].clientX; }
  protected end(event: TouchEvent): void { const distance = event.changedTouches[0].clientX - this.touchStart; if (Math.abs(distance) > 50) this.move(distance < 0 ? 1 : -1); }
}
