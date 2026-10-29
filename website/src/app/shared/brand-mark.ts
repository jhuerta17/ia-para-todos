import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img src="/images/brand/ia-para-todos-symbol-color.png" alt="" width="1254" height="1254" decoding="async" />`,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: block; flex: none; width: var(--logo-size, 2rem); height: var(--logo-size, 2rem); }
    img { display: block; width: 100%; height: 100%; object-fit: contain; }
  `,
})
export class BrandMark {}
