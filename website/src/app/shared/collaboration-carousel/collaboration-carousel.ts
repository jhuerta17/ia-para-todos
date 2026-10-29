import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Icon } from '../icon';

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
  protected readonly roles = [
    { title: 'Facilitar talleres', description: 'Explicar con palabras sencillas y guiar ejercicios paso a paso.', portrait: '01' },
    { title: 'Acompañar prácticas', description: 'Escuchar preguntas y apoyar a cada persona a su ritmo.', portrait: '02' },
    { title: 'Traducir contenidos', description: 'Ayudar a que las instrucciones sean claras y accesibles.', portrait: '03' },
    { title: 'Compartir la iniciativa', description: 'Acercar la propuesta a vecinos, familias y espacios comunitarios.', portrait: '04' },
  ];

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
