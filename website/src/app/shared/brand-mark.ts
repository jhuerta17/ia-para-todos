import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img src="/images/brand/ia-para-todos-symbol-192.png" alt="" width="192" height="192" decoding="async" />`,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: block; flex: none; width: var(--logo-size, 2rem); height: var(--logo-size, 2rem); }
    img { display: block; width: 100%; height: 100%; object-fit: contain; }
  `,
})
export class BrandMark {}
