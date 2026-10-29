import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Workshop } from '../../data/workshops';
import { ActionLink } from '../action-link';
import { RevealOnEnter } from '../motion/reveal-on-enter';

@Component({
  selector: 'app-workshop-card',
  imports: [RouterLink, ActionLink],
  hostDirectives: [RevealOnEnter],
  templateUrl: './workshop-card.html',
  styleUrls: ['../content-card.css', '../motion/card-motion.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopCard {
  readonly workshop = input.required<Workshop>();
}
