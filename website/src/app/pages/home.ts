import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActionLink } from '../shared/action-link';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ActionLink, Icon],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly introductions = [
    { title: 'Empieza desde cero', image: 'guided-practice', alt: 'Personas adultas practicando con una computadora y apoyo cercano.' },
    { title: 'IA para tu día a día', image: 'everyday-phone', alt: 'Tres mujeres mirando juntas la pantalla de un teléfono.' },
    { title: 'Con cuidado y sin miedo', image: 'family-learning', alt: 'Una madre y su hija usando una computadora en casa.' },
  ];
}
