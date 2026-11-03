import { afterNextRender, Component, computed, inject, effect, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BrandMark } from '../../../shared/brand-mark';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';
import { RouteMetadata } from '../../../shared/metadata/route-metadata';
import { PortalClient } from '../../store/portal-client';
import { UserSession } from '../../session/user-session';

const copy = {
  es: { signIn: 'Iniciar sesión', signOut: 'Cerrar sesión', language: 'Idioma' },
  en: { signIn: 'Sign in', signOut: 'Sign out', language: 'Language' },
} satisfies Record<Lang, Record<string, string>>;

// Student portal shell: the public site's own visual language (warm
// panel, brand accent, site fonts) with app behavior (no public
// header/footer, noindex). No admin-theme dependency: portal pages
// must feel like part of the site, not a separate webapp. The ES/EN
// choice persists per browser (route activation honors it for portal
// routes; see App.routeLanguage).
export const PORTAL_LANG_KEY = 'portal-lang';

@Component({
  selector: 'app-portal-layout',
  imports: [BrandMark, RouterModule],
  templateUrl: './portal-layout.html',
  styleUrl: './portal-layout.css',
})
export class PortalLayout {
  protected readonly language = inject(Language);
  protected readonly session = inject(UserSession);
  protected readonly c = computed(() => copy[this.language.lang()]);
  private readonly router = inject(Router);
  protected readonly client = inject(PortalClient);
  private readonly metadata = inject(RouteMetadata);
  protected readonly profileError = signal(false);
  protected readonly accepting = signal(false);
  protected readonly accountPage = signal(false);
  protected readonly adult = signal(false);
  protected readonly acceptError = signal(false);
  protected async loadProfile(): Promise<void> {
    this.profileError.set(false);
    try { await this.client.profile(); } catch { this.profileError.set(true); }
  }
  protected async accept(): Promise<void> {
    if (!this.adult() || this.accepting()) return;
    this.accepting.set(true); this.acceptError.set(false);
    try { await this.client.consent(); } catch { this.acceptError.set(true); }
    finally { this.accepting.set(false); }
  }

  constructor() {
    this.accountPage.set(this.router.url.split(/[?#]/)[0] === '/portal/account');
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) this.accountPage.set(event.urlAfterRedirects.split(/[?#]/)[0] === '/portal/account');
    });
    let profileUserId: string | undefined;
    effect(() => {
      const userId = this.session.user()?.id;
      if (userId === profileUserId) return;
      profileUserId = userId;
      this.client.consented.set(null);
      if (userId) void this.loadProfile();
    });
    afterNextRender(() => {
      try {
        const saved = localStorage.getItem(PORTAL_LANG_KEY);
        if (saved === 'es' || saved === 'en') this.language.set(saved);
      } catch {
        // Private mode: keep the route default.
      }
    });
  }

  protected setLang(lang: Lang): void {
    this.language.set(lang);
    this.metadata.update();
    try {
      localStorage.setItem(PORTAL_LANG_KEY, lang);
    } catch {
      // Private mode: the choice lasts until the next navigation.
    }
  }

  protected async signOut(): Promise<void> {
    await this.session.signOut(false);
    await this.router.navigate(['/portal/sign-in']);
  }
}
