import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BRAND_NAME, DetailKind, Lang, PATHS, StaticKey, detailUrl, sectionUrl, staticPeer } from './lang';

/**
 * Current content language, set by the root component on every page
 * activation (including prerendering) from the route `lang` data.
 * Components read `lang()` and pick their language copy; links resolve
 * through the helpers so templates never hard-code a language prefix.
 */
@Injectable({ providedIn: 'root' })
export class Language {
  private readonly router = inject(Router);
  readonly lang = signal<Lang>('es');
  readonly brand = computed(() => BRAND_NAME[this.lang()]);

  set(lang: Lang): void {
    this.lang.set(lang);
  }

  /** Localized absolute URL for a static section. */
  path(key: StaticKey): string {
    return sectionUrl(key, this.lang());
  }

  /** Localized absolute URL for a detail page (slug already localized). */
  detail(kind: DetailKind, slug: string): string {
    return detailUrl(kind, slug, this.lang());
  }

  /**
   * Localize a Spanish-section absolute path (`/`, `/talleres`, or
   * `/talleres/<slug>` with an already-localized slug) to the current
   * language. Used by ActionLink so callers keep writing Spanish paths.
   */
  localize(esPath: string): string {
    if (this.lang() === 'es') return esPath;
    if (esPath === '/') return '/en';
    for (const key of ['talleres', 'actividades', 'recursos'] as const) {
      const prefix = `/${PATHS[key].es}`;
      if (esPath === prefix || esPath.startsWith(`${prefix}/`)) {
        return `/${PATHS[key].en}${esPath.slice(prefix.length)}`;
      }
    }
    return `/en${esPath}`;
  }

  /** Alternate-language peer of the current URL, for the switcher and SEO. */
  alternate(): { url: string; label: string; aria: string } {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    const pair = typeof route.data['pair'] === 'string'
      ? route.data['pair'] as string
      : staticPeer(route.routeConfig?.path === '**' ? this.router.url.split(/[?#]/)[0] : sectionUrl('home', 'es'));
    const lang = this.lang();
    return lang === 'es'
      ? { url: pair, label: 'English', aria: 'View this page in English' }
      : { url: pair, label: 'Español', aria: 'Ver esta página en español' };
  }
}
