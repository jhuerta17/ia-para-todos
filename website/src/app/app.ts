import { WhatsappLink } from './shared/whatsapp-link';
import { RouteMetadata } from './shared/metadata/route-metadata';
import { PageTransition } from './shared/page-transition/page-transition.service';
import { PageTransitionOverlay } from './shared/page-transition/page-transition-overlay';
import { SiteFooter } from './shared/site-footer/site-footer';
import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, computed, inject, Injector, signal } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router, RouterOutlet } from '@angular/router';
import { SiteHeader } from './shared/site-header/site-header';
import { DemoState } from './admin/data/demo-state';
import { Language } from './i18n/language';
import { Lang } from './i18n/lang';

@Component({
  selector: 'app-root',
  imports: [WhatsappLink, RouterOutlet, SiteHeader, SiteFooter, PageTransitionOverlay],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private initialActivation = true;
  private readonly metadata = inject(RouteMetadata);
  // Constructed on every load so ?demo=1 is captured before guards redirect.
  protected readonly demoState = inject(DemoState);
  private readonly router = inject(Router);
  private readonly transition = inject(PageTransition);
  private readonly language = inject(Language);
  protected readonly skipLabel = computed(() => this.language.lang() === 'es' ? 'Saltar al contenido' : 'Skip to content');
  protected readonly isAdmin = signal(false);
  protected readonly isPortal = signal(false);

  constructor() {
    // The first client render lands before the initial navigation
    // completes, when the router snapshot is still empty: seed from the
    // URL so admin/portal loads never flash the public header/footer (and
    // the client render matches the prerendered shell for hydration).
    this.isAdmin.set(this.detectAdminRoute());
    this.isPortal.set(this.detectPortalRoute());
    // Root outlives the app; no teardown needed.
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isAdmin.set(this.detectAdminRoute());
        this.isPortal.set(this.detectPortalRoute());
        this.transition.reveal();
      } else if (event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isAdmin.set(this.detectAdminRoute());
        this.isPortal.set(this.detectPortalRoute());
        this.transition.reset();
      }
    });
  }

  private detectAdminRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    if (route.data['admin'] === true) return true;
    const path = this.document.defaultView?.location.pathname ?? this.router.url.split(/[?#]/)[0];
    return path === '/admin' || path.startsWith('/admin/');
  }

  private detectPortalRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    if (route.data['portal'] === true) return true;
    const path = this.document.defaultView?.location.pathname ?? this.router.url.split(/[?#]/)[0];
    return path === '/portal' || path.startsWith('/portal/');
  }

  private isAdminLoginRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['adminLogin'] === true;
  }

  private isPortalAuthRoute(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['portalAuth'] === true;
  }

  private routeLanguage(): Lang {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const lang = route.data['lang'] as Lang | undefined;
    if (lang === 'es' || lang === 'en') {
      // Portal routes honor the visitor's persisted ES/EN choice so the
      // shell toggle survives navigation; everywhere else the route wins.
      if (route.data['portal'] === true) {
        try {
          const saved = this.document.defaultView?.localStorage.getItem('portal-lang');
          if (saved === 'es' || saved === 'en') return saved;
        } catch {
          // Private mode: fall through to the route default.
        }
      }
      return lang;
    }
    return this.router.url.split(/[?#]/)[0].startsWith('/en') ? 'en' : 'es';
  }

  protected skipToContent(event: Event): void {
    event.preventDefault();
    const main = this.document.querySelector<HTMLElement>('main');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  protected onPageActivated(): void {
    // Identity emails land on the site root with a token fragment. Only
    // admins receive invites, so invite tokens go to /admin/sign-in;
    // recovery and confirmation tokens go to /portal/sign-in, which
    // consumes them and lands admins on /admin, students on /portal.
    // Server prerendering never sees a fragment.
    const hash = this.document.defaultView?.location.hash ?? '';
    if (hash.includes('_token=') && !this.isAdminLoginRoute() && !this.isPortalAuthRoute()) {
      const target = hash.includes('invite_token=') ? '/admin/sign-in' : '/portal/sign-in';
      this.router.navigate([target], { fragment: hash.replace(/^#/, '') });
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
