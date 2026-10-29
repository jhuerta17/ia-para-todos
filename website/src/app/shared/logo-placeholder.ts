import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-logo-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  host: { 'aria-hidden': 'true' },
  styles: `:host { display: block; flex: none; width: var(--logo-size, 2rem); height: var(--logo-size, 2rem); border: 1px dashed var(--color-border-strong); border-radius: .25rem; background: var(--color-warm); }`,
})
export class LogoPlaceholder {}
