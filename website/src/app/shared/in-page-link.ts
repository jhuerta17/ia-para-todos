import { DOCUMENT } from '@angular/common';
import { Directive, HostListener, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/** Same-page links must not resolve against the application's root base URL. */
@Directive({
  selector: 'a[appInPageLink]',
  host: { '[attr.href]': 'href' },
})
export class InPageLink {
  readonly target = input.required<string>({ alias: 'appInPageLink' });
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  protected get href(): string { return `${this.router.url.split('#')[0]}#${this.target()}`; }

  @HostListener('click', ['$event'])
  protected follow(event: MouseEvent): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = this.document.getElementById(this.target());
    if (!section) return;
    event.preventDefault();
    const control = section.querySelector<HTMLElement>('input:not([type="hidden"]):not([tabindex="-1"]), button, select, textarea');
    control?.focus({ preventScroll: true });
    section.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
