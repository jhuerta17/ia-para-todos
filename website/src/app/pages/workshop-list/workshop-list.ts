import { ChangeDetectionStrategy, Component } from '@angular/core';
import { workshops } from '../../data/workshops';
import { WorkshopCard } from '../../shared/workshop-card/workshop-card';
import { FaqSection } from '../../shared/faq-section/faq-section';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-workshop-list',
  imports: [WorkshopCard, FaqSection, Icon],
  templateUrl: './workshop-list.html',
  styleUrl: './workshop-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkshopList {
  protected readonly workshops = workshops;
}
