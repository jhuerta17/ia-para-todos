import { ChangeDetectionStrategy, Component } from '@angular/core';
import { learningBenefits } from '../../data/learning-benefits';
import { Icon } from '../icon';

@Component({
  selector: 'app-learning-benefits',
  imports: [Icon],
  templateUrl: './learning-benefits.html',
  styleUrl: './learning-benefits.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningBenefits {
  protected readonly benefits = learningBenefits;
}
