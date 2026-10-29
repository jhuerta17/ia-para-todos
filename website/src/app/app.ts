import { RouteMetadata } from './shared/metadata/route-metadata';
import { SiteFooter } from './shared/site-footer/site-footer';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, inject, Injector } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private initialActivation = true;
  private readonly metadata = inject(RouteMetadata);

  protected skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.querySelector<HTMLElement>('main');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  protected onPageActivated(): void {
    this.metadata.update();
    if (this.initialActivation) {
      this.initialActivation = false;
      return;
    }
    afterNextRender(() => {
      this.document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
    }, { injector: this.injector });
  }
}
