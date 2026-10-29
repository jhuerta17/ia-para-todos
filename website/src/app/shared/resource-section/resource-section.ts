import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resources } from '../../data/resources';
import { ActionLink } from '../action-link';
import { Icon } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
import { PHOTO_NOTE } from '../../i18n/lang';

const copy = {
  es: { heading: 'Aprende a tu ritmo', lead: 'Guías sencillas para descubrir la IA y seguir aprendiendo a tu ritmo.', viewAll: 'Ver todos', kind: 'Recurso', read: 'Leer recurso' },
  en: { heading: 'Learn at your pace', lead: 'Simple guides to discover AI, practice carefully, and keep learning at your pace.', viewAll: 'View all', kind: 'Resource', read: 'Read resource' },
};

@Component({selector: 'app-resource-section', imports: [RouterLink, ActionLink, Icon, RevealOnEnter], templateUrl: './resource-section.html', styleUrl: './resource-section.css', changeDetection: ChangeDetectionStrategy.OnPush})
export class ResourceSection {
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly caption = computed(() => PHOTO_NOTE[this.language.lang()].plural);
  protected readonly resources = computed(() => resources[this.language.lang()]);
}
