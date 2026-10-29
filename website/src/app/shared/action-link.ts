import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from './icon';
import { Language } from '../i18n/language';

@Component({
  selector: 'app-action-link',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<a class="action" [class.warm]="tone() === 'warm'" [routerLink]="href()" [attr.aria-label]="accessibleLabel()"><span>{{ label() }}</span><span class="arrow"><app-icon name="arrow-up-right" /></span></a>`,
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
