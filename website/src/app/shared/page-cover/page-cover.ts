import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icon, IconName } from '../icon';
import { RevealOnEnter } from '../motion/reveal-on-enter';
@Component({ selector: 'app-page-cover', imports: [Icon, RevealOnEnter], templateUrl: './page-cover.html', styleUrl: './page-cover.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class PageCover {
  readonly image = input.required<string>();
  readonly alt = input('Fotografía ilustrativa de archivo.');
  readonly title = input('');
  readonly summary = input('');
  readonly icon = input<IconName>('book');
}
