import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActionButton } from './action-button';
import { Language } from '../i18n/language';

@Component({
  selector: 'app-action-link',
  imports: [RouterLink, ActionButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a appActionButton [class.action-warm]="tone() === 'warm'" [routerLink]="href()" [attr.aria-label]="accessibleLabel()">{{ label() }}</a>`,
  styleUrl: './action-link.css',
})
export class ActionLink {
  /** Spanish-section absolute path (static, or detail with a localized slug); resolved to the current language. */
  readonly to = input.required<string>();
  readonly label = input.required<string>();
  readonly accessibleLabel = input<string>();
  readonly tone = input<'brown' | 'warm'>('brown');
  private readonly language = inject(Language);
  protected readonly href = computed(() => this.language.localize(this.to()));
}
