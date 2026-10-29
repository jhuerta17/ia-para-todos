import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Workshop } from '../../data/workshops';
import { ActionLink } from '../action-link';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';

const copy = {
  es: { kind: 'Taller', view: 'Ver taller', duration: 'Duración', device: 'Dispositivo', phone: 'Teléfono' },
  en: { kind: 'Workshop', view: 'View workshop', duration: 'Duration', device: 'Device', phone: 'Phone' },
};

@Component({
  selector: 'app-workshop-card',
  imports: [RouterLink, ActionLink],
  hostDirectives: [RevealOnEnter],
  templateUrl: './workshop-card.html',
  styleUrls: ['../content-card.css', '../motion/card-motion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopCard {
  readonly workshop = input.required<Workshop>();
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}
