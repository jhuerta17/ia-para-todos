import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlannedActivity } from '../../data/activities';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { ActionLink } from '../action-link';

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
}
