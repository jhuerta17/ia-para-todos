import { ChangeDetectionStrategy, Component } from '@angular/core';
import { workshops } from '../../data/workshops';
import { ActionLink } from '../action-link';
import { WorkshopCard } from '../workshop-card/workshop-card';

@Component({
  selector: 'app-workshop-section',
  imports: [ActionLink, WorkshopCard],
  templateUrl: './workshop-section.html',
  styleUrl: './workshop-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopSection {
  protected readonly rows = [workshops.slice(0, 2), workshops.slice(2)];
}
