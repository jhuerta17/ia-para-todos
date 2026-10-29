import { afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Icon } from '../icon';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const copy = {
  es: { region: 'Roles de colaboración', carousel: 'carrusel', track: 'Cuatro roles. Usa las flechas del teclado o desliza para explorar. Inicio y Fin van a los extremos.', eyebrow: 'Rol', note: 'Retratos ilustrativos de archivo; no representan a personas del equipo.', prev: 'Ver rol anterior', next: 'Ver siguiente rol' },
  en: { region: 'Collaboration roles', carousel: 'carousel', track: 'Four roles. Use the keyboard arrows or swipe to explore. Home and End go to the extremes.', eyebrow: 'Role', note: 'Illustrative stock portraits; they do not depict team members.', prev: 'View previous role', next: 'View next role' },
};

const roles: Record<Lang, { title: string; description: string; portrait: string }[]> = {
  es: [
    { title: 'Facilitar talleres', description: 'Explicar con palabras sencillas y guiar ejercicios paso a paso.', portrait: '01' },
    { title: 'Acompañar prácticas', description: 'Escuchar preguntas y apoyar a cada persona a su ritmo.', portrait: '02' },
    { title: 'Traducir contenidos', description: 'Ayudar a que las instrucciones sean claras y accesibles.', portrait: '03' },
    { title: 'Compartir la iniciativa', description: 'Acercar la iniciativa a vecinos, familias y espacios comunitarios.', portrait: '04' },
  ],
  en: [
    { title: 'Facilitate workshops', description: 'Explain in simple words and guide step-by-step exercises.', portrait: '01' },
    { title: 'Guide practice', description: 'Listen to questions and support each person at their pace.', portrait: '02' },
    { title: 'Translate content', description: 'Help keep instructions clear and accessible.', portrait: '03' },
    { title: 'Share the initiative', description: 'Bring the initiative to neighbors, families, and community spaces.', portrait: '04' },
  ],
};

@Component({
  selector: 'app-collaboration-carousel',
  imports: [Icon],
  templateUrl: './collaboration-carousel.html',
  styleUrl: './collaboration-carousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaborationCarousel {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly destroyRef = inject(DestroyRef);
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly roles = computed(() => roles[this.language.lang()]);

  constructor() {
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.updateEdges());
      observer.observe(this.track().nativeElement);
      this.updateEdges();
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected updateEdges(): void {
    const element = this.track().nativeElement;
    this.atStart.set(element.scrollLeft <= 2);
    this.atEnd.set(element.scrollLeft + element.clientWidth >= element.scrollWidth - 2);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.move(event.key === 'ArrowLeft' ? -1 : 1);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const element = this.track().nativeElement;
      element.scrollTo({ left: event.key === 'Home' ? 0 : element.scrollWidth,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }

  protected move(direction: number): void {
    const element = this.track().nativeElement;
    const card = element.querySelector('li');
    element.scrollBy({ left: direction * ((card?.getBoundingClientRect().width ?? 303) + 20),
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
}
