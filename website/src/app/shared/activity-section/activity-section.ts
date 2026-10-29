import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AnimatedNumber } from '../motion/animated-number';
import { StackedRows } from '../motion/stacked-rows';
import { activities } from '../../data/activities';
import { ActionLink } from '../action-link';
import { ActivityCard } from '../activity-card/activity-card';

@Component({
  selector: 'app-activity-section',
  imports: [ActionLink, ActivityCard, StackedRows, AnimatedNumber],
  templateUrl: './activity-section.html',
  styleUrls: ['./activity-section.css', '../motion/stacked-rows.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitySection {
  protected readonly activities = activities;
  protected readonly rows = [activities.slice(0, 2), activities.slice(2)];
}
