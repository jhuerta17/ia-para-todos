import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Icon } from '../icon';

@Component({
  selector: 'app-learning-comparison',
  imports: [Icon],
  templateUrl: './learning-comparison.html',
  styleUrl: './learning-comparison.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LearningComparison {
  protected readonly position = signal(50);

  protected update(event: Event): void {
    this.position.set((event.target as HTMLInputElement).valueAsNumber);
  }
}
