import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlannedActivity } from '../../data/activities';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { ActionLink } from '../action-link';
import { Language } from '../../i18n/language';

const copy = {
  es: { kind: 'Actividad', view: 'Ver actividad', focus: 'Enfoque', practice: 'Práctica', guided: 'Guiada' },
  en: { kind: 'Activity', view: 'View activity', focus: 'Focus', practice: 'Practice', guided: 'Guided' },
};

@Component({
  selector: 'app-activity-card',
  imports: [RouterLink, ActionLink],
  hostDirectives: [RevealOnEnter],
  templateUrl: './activity-card.html',
  styleUrls: ['../content-card.css', './activity-card.css', '../motion/card-motion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityCard {
  readonly activity = input.required<PlannedActivity>();
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
}
