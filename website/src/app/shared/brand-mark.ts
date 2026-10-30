import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BrandMarkVariant = 'color' | 'white';

const variantSrc: Record<BrandMarkVariant, string> = {
  color: '/images/brand/ia-para-todos-symbol-192.png',
  white: '/images/brand/ia-para-todos-symbol-white-192.png',
};

@Component({
  selector: 'app-brand-mark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<img [src]="src()" alt="" width="192" height="192" decoding="async" />`,
  host: { 'aria-hidden': 'true' },
  styles: `
    :host { display: block; flex: none; width: var(--logo-size, 2rem); height: var(--logo-size, 2rem); }
    img { display: block; width: 100%; height: 100%; object-fit: contain; }
  `,
})
export class BrandMark {
  readonly variant = input<BrandMarkVariant>('color');
  protected readonly src = computed(() => variantSrc[this.variant()]);
}
