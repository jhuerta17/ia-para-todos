import { RouteMetadata } from './shared/metadata/route-metadata';
import { SiteFooter } from './shared/site-footer/site-footer';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, computed, inject, Injector } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/site-header/site-header';
import { Language } from './i18n/language';
import { Lang } from './i18n/lang';

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
  private readonly router = inject(Router);
  private readonly language = inject(Language);
  protected readonly skipLabel = computed(() => this.language.lang() === 'es' ? 'Saltar al contenido' : 'Skip to content');

  protected isAdminRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['admin'] === true;
  }

  private isAdminLoginRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['adminLogin'] === true;
  }

  private routeLanguage(): Lang {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const lang = route.data['lang'] as Lang | undefined;
    if (lang === 'es' || lang === 'en') return lang;
    return this.router.url.split(/[?#]/)[0].startsWith('/en') ? 'en' : 'es';
  }

  protected skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.querySelector<HTMLElement>('main');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  protected onPageActivated(): void {
    // Identity emails land on the site root with a token fragment; route
    // them to the access page, which consumes invite, recovery, and
    // confirmation tokens. Server prerendering never sees a fragment.
    const hash = this.document.defaultView?.location.hash ?? '';
    if (hash.includes('_token=') && !this.isAdminLoginRoute()) {
      this.router.navigate(['/admin/acceso'], { fragment: hash.replace(/^#/, '') });
      return;
    }
    this.language.set(this.routeLanguage());
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
