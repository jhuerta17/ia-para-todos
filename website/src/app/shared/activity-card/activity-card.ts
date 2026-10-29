import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlannedActivity } from '../../data/activities';
import { ActionLink } from '../action-link';

@Component({
  selector: 'app-activity-card',
  imports: [RouterLink, ActionLink],
  templateUrl: './activity-card.html',
  styleUrls: ['../content-card.css', './activity-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityCard {
  readonly activity = input.required<PlannedActivity>();
}
