import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon';

@Component({
  selector: 'app-intro-cards',
  imports: [RouterLink, Icon],
  templateUrl: './intro-cards.html',
  styleUrl: './intro-cards.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroCards {
  protected readonly introductions = [
    { title: 'Empieza desde cero', image: 'guided-practice', alt: 'Personas adultas practicando con una computadora y apoyo cercano.' },
    { title: 'IA para tu día a día', image: 'everyday-phone', alt: 'Tres mujeres mirando juntas la pantalla de un teléfono.' },
    { title: 'Con cuidado y sin miedo', image: 'family-learning', alt: 'Una madre y su hija usando una computadora en casa.' },
  ];
}
