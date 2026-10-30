import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icon, IconName } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
import { Language } from '../../i18n/language';
@Component({ selector: 'app-page-cover', imports: [Icon, RevealOnEnter], templateUrl: './page-cover.html', styleUrl: './page-cover.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class PageCover {
  readonly image = input.required<string>();
  readonly alt = input<string>();
  readonly title = input('');
  readonly summary = input('');
  readonly icon = input<IconName>('book');
  private readonly language = inject(Language);
  protected readonly resolvedAlt = computed(() => this.alt() ?? '');
}
