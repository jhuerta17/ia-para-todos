import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandMark } from '../brand-mark';

/** Presentational brand panel shared by the two independent sign-in flows. */
@Component({
  selector: 'app-auth-brand',
  imports: [RouterLink, BrandMark],
  host: { style: 'display:contents' },
  template: `<a [routerLink]="sitePath()" class="mb-4 flex items-center gap-3" [attr.aria-label]="backLabel()">
    <app-brand-mark variant="white" style="--logo-size:3rem" />
    <span class="font-display text-2xl font-bold text-white">{{brand()}}</span>
  </a><p class="text-center text-gray-400">{{description()}}</p>`,
})
export class AuthBrand {
  readonly brand = input.required<string>();
  readonly description = input.required<string>();
  readonly sitePath = input('/');
  readonly backLabel = input('Back to site');
}
