import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, inject, Injector } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private initialActivation = true;

  protected onPageActivated(): void {
    if (this.initialActivation) {
      this.initialActivation = false;
      return;
    }
    afterNextRender(() => {
      this.document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
    }, { injector: this.injector });
  }
}
