import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon';
import { Language } from '../../i18n/language';
import { Lang } from '../../i18n/lang';

const introductions: Record<Lang, { title: string; image: string; alt: string }[]> = {
  es: [
    { title: 'Empieza desde cero', image: 'guided-practice', alt: 'Personas adultas practicando con una computadora y apoyo cercano.' },
    { title: 'IA para tu día a día', image: 'everyday-phone', alt: 'Tres mujeres mirando juntas la pantalla de un teléfono.' },
    { title: 'Con cuidado y sin miedo', image: 'family-learning', alt: 'Una madre y su hija usando una computadora en casa.' },
  ],
  en: [
    { title: 'Start from zero', image: 'guided-practice', alt: 'Adults practicing with a computer and close support.' },
    { title: 'AI for your day to day', image: 'everyday-phone', alt: 'Three women looking together at a phone screen.' },
    { title: 'Carefully and without fear', image: 'family-learning', alt: 'A mother and daughter using a computer at home.' },
  ],
};

const copy = {
  es: { list: 'Temas de talleres', kind: 'Taller' },
  en: { list: 'Workshop topics', kind: 'Workshop' },
};

@Component({
  selector: 'app-intro-cards',
  imports: [RouterLink, Icon],
  templateUrl: './intro-cards.html',
  styleUrl: './intro-cards.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroCards {
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly introductions = computed(() => introductions[this.language.lang()]);
}
