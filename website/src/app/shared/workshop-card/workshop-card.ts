import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Workshop } from '../../data/workshops';
import { ActionLink } from '../action-link';

@Component({
  selector: 'app-workshop-card',
  imports: [RouterLink, ActionLink],
  templateUrl: './workshop-card.html',
  styleUrl: './workshop-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopCard {
  readonly workshop = input.required<Workshop>();
}
