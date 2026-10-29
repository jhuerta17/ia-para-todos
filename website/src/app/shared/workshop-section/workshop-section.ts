import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { workshops } from '../../data/workshops';
import { ActionLink } from '../action-link';
import { StackedRows } from '../motion/stacked-rows';
import { WorkshopCard } from '../workshop-card/workshop-card';
import { Language } from '../../i18n/language';

const copy = {
  es: { heading: 'Talleres', lead: 'Aprende desde cero, con práctica y a tu ritmo.', viewAll: 'Ver todos' },
  en: { heading: 'Workshops', lead: 'Learn from scratch, with practice and at your pace.', viewAll: 'View all' },
};

@Component({
  selector: 'app-workshop-section',
  imports: [ActionLink, WorkshopCard, StackedRows],
  templateUrl: './workshop-section.html',
  styleUrls: ['./workshop-section.css', '../motion/stacked-rows.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopSection {
  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly rows = computed(() => {
    const entries = workshops[this.language.lang()];
    return [entries.slice(0, 2), entries.slice(2)];
  });
}
