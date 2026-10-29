import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AnimatedNumber } from '../motion/animated-number';
import { StackedRows } from '../motion/stacked-rows';
import { activities } from '../../data/activities';
import { ActionLink } from '../action-link';
import { ActivityCard } from '../activity-card/activity-card';
import { Language } from '../../i18n/language';

const copy = {
  es: { heading: 'actividades', lead: 'Ideas para practicar con ejemplos cotidianos, a tu ritmo.', viewAll: 'Ver todas' },
  en: { heading: 'activities', lead: 'Ideas for practicing with everyday examples, at your pace.', viewAll: 'View all' },
};

@Component({
  selector: 'app-activity-section',
  imports: [ActionLink, ActivityCard, StackedRows, AnimatedNumber],
  templateUrl: './activity-section.html',
  styleUrls: ['./activity-section.css', '../motion/stacked-rows.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitySection {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly activities = computed(() => activities[this.language.lang()]);
  protected readonly rows = computed(() => {
    const entries = this.activities();
    return [entries.slice(0, 2), entries.slice(2)];
  });
}
