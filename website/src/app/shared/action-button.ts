import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from './icon';

/** Shared decoration on native controls preserves links, forms, and accessible labels. */
@Component({
  selector: 'button[appActionButton], a[appActionButton]',
  imports: [Icon],
  host: { class: 'site-action' },
  template: `<span class="action-label"><ng-content /></span><span class="action-icon" aria-hidden="true"><app-icon name="arrow-right" /></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButton {}
