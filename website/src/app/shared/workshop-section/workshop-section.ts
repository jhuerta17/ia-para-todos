import { ChangeDetectionStrategy, Component } from '@angular/core';
import { workshops } from '../../data/workshops';
import { ActionLink } from '../action-link';
import { StackedRows } from '../motion/stacked-rows';
import { WorkshopCard } from '../workshop-card/workshop-card';

@Component({
  selector: 'app-workshop-section',
  imports: [ActionLink, WorkshopCard, StackedRows],
  templateUrl: './workshop-section.html',
  styleUrls: ['./workshop-section.css', '../motion/stacked-rows.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopSection {
  protected readonly rows = [workshops.slice(0, 2), workshops.slice(2)];
}
