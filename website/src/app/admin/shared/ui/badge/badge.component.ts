import { Component, Input } from '@angular/core';
import { Icon, IconName } from '../../../../shared/icon';
import { BadgeDirective } from './badge.directive';

export type { BadgeColor, BadgeSize, BadgeVariant } from './badge.directive';

@Component({
  selector: 'app-badge',
  imports: [Icon],
  hostDirectives: [
    { directive: BadgeDirective, inputs: ['variant', 'size', 'color', 'className'] },
  ],
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  @Input() startIcon?: IconName;
  @Input() endIcon?: IconName;
}
