import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionLink } from '../action-link';
import { Icon } from '../icon';
import { LearningComparison } from '../learning-comparison/learning-comparison';

@Component({
  selector: 'app-program-facts',
  imports: [ActionLink, Icon, LearningComparison],
  templateUrl: './program-facts.html',
  styleUrl: './program-facts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramFacts {
  protected readonly portraits = Array.from({ length: 9 }, (_, i) => ({
    image: `/images/portrait-${String(i + 1).padStart(2, '0')}-256.webp`,
    x: 50 + 35 * Math.cos(i * 2 * Math.PI / 9),
    y: 50 + 39 * Math.sin(i * 2 * Math.PI / 9),
  }));
  protected readonly examples = [
    { text: 'Explícame este aviso con palabras sencillas.', category: 'Vida diaria' },
    { text: 'Ayúdame a organizar una semana de estudio.', category: 'Primeros pasos' },
    { text: '¿Qué debería verificar antes de compartir esto?', category: 'Uso responsable' },
  ];
}
