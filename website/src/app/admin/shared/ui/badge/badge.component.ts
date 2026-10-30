import { Component, Input } from '@angular/core';
import { AdminSafeHtmlPipe } from '../../safe-html.pipe';
import { BadgeDirective } from './badge.directive';

export type { BadgeColor, BadgeSize, BadgeVariant } from './badge.directive';

@Component({
  selector: 'app-badge',
  imports: [AdminSafeHtmlPipe],
  hostDirectives: [
    { directive: BadgeDirective, inputs: ['variant', 'size', 'color', 'className'] },
  ],
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  @Input() startIcon?: string; // SVG or HTML string
  @Input() endIcon?: string; // SVG or HTML string
}
