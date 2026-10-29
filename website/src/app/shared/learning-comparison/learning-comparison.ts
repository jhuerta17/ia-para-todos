import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Icon } from '../icon';
import { Language } from '../../i18n/language';

const copy = {
  es: { community: 'En comunidad', home: 'En casa', and: 'y', compare: 'Comparar escenas de aprendizaje', help: 'Fotografías ilustrativas de aprendizaje en comunidad y en casa. Arrastra el control o usa las flechas. Inicio y Fin muestran cada escena completa. No representa resultados antes y después.' },
  en: { community: 'In community', home: 'At home', and: 'and', compare: 'Compare learning scenes', help: 'Illustrative photos of learning in community and at home. Drag the control or use the arrows. Home and End show each full scene. It does not show before-and-after results.' },
};

@Component({
  selector: 'app-learning-comparison',
  imports: [Icon],
  templateUrl: './learning-comparison.html',
  styleUrl: './learning-comparison.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningComparison {
  protected readonly position = signal(50);
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly valueText = computed(() => `${this.position()}% ${this.c().community.toLowerCase()} ${this.c().and} ${100 - this.position()}% ${this.c().home.toLowerCase()}`);

  protected update(event: Event): void {
    this.position.set((event.target as HTMLInputElement).valueAsNumber);
  }
}
