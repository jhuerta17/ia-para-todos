import { ChangeDetectionStrategy, Component } from '@angular/core';
import { activities } from '../../data/activities';
import { ActionLink } from '../action-link';
import { ActivityCard } from '../activity-card/activity-card';

@Component({
  selector: 'app-activity-section',
  imports: [ActionLink, ActivityCard],
  templateUrl: './activity-section.html',
  styleUrl: './activity-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitySection {
  protected readonly activities = activities;
  protected readonly rows = [activities.slice(0, 2), activities.slice(2)];
}
