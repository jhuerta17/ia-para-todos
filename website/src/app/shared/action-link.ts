import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';

@Component({
  selector: 'app-action-link',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="action" [class.warm]="tone() === 'warm'" [routerLink]="to()" [attr.aria-label]="accessibleLabel()"><span>{{ label() }}</span><span class="arrow"><app-icon name="arrow-up-right" /></span></a>`,
  styleUrl: './action-link.css',
})
export class ActionLink {
  readonly to = input.required<string>();
  readonly label = input.required<string>();
  readonly accessibleLabel = input<string>();
  readonly tone = input<'brown' | 'warm'>('brown');
}
