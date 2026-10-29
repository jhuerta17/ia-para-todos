import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';

@Component({selector: 'app-learning-stories', imports: [Icon, RevealOnEnter], templateUrl: './learning-stories.html', styleUrl: './learning-stories.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class LearningStories {
  readonly pageHeading = input(false);
  protected readonly active = signal(0);
  private touchStart = 0;
  protected readonly stories = [
    { title: 'Tu primera idea, paso a paso', text: 'Una persona que nunca ha usado IA escribe su primer prompt con ayuda y prepara una lista de compras para una cena imaginaria.', image: 'guided-practice' },
    { title: 'Encuentra las palabras', text: 'Una persona prepara un mensaje respetuoso para la escuela, revisa el borrador y lo adapta a su propia voz.', image: 'everyday-phone' },
    { title: 'Ordena tu experiencia', text: 'Una persona practica un currículum con información ficticia, sin compartir datos sensibles ni promesas de empleo.', image: 'work-business' },
    { title: 'Aprende en familia', text: 'Una madre o padre practica con un tema escolar inventado y prepara una pregunta para conversar en casa.', image: 'family-learning' },
    { title: 'Haz una pausa y verifica', text: 'Una familia recibe un mensaje urgente ficticio. Antes de compartirlo, revisa las señales de alerta y verifica por otro medio.', image: 'family-phone' },
  ];
  protected position(index: number): number { const distance = (index - this.active() + this.stories.length) % this.stories.length; return distance > 2 ? distance - this.stories.length : distance; }
  protected move(direction: number): void { this.active.update(value => (value + direction + this.stories.length) % this.stories.length); }
  protected onKey(event: KeyboardEvent): void { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); this.move(event.key === 'ArrowRight' ? 1 : -1); } }
  protected start(event: TouchEvent): void { this.touchStart = event.changedTouches[0].clientX; }
  protected end(event: TouchEvent): void { const distance = event.changedTouches[0].clientX - this.touchStart; if (Math.abs(distance) > 50) this.move(distance < 0 ? 1 : -1); }
}
