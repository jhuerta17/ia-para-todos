import { Icon, type IconName } from '../../../shared/icon';
import { AuthBrand } from '../../../shared/dashboard/auth-brand';
import { NgTemplateOutlet } from '@angular/common';
import { ensureDashboardTheme } from '../../../shared/dashboard/dashboard-theme';
import { afterNextRender, Component, computed, inject, effect, signal, HostListener, ElementRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { BrandMark } from '../../../shared/brand-mark';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';
import { RouteMetadata } from '../../../shared/metadata/route-metadata';
import { PortalClient, PortalError } from '../../store/portal-client';
import { UserSession } from '../../session/user-session';

const copy = {
  es: { signIn: 'Iniciar sesión', signOut: 'Cerrar sesión', language: 'Idioma' },
  en: { signIn: 'Sign in', signOut: 'Sign out', language: 'Language' },
} satisfies Record<Lang, Record<string, string>>;

// Student app shell; authentication and authorization remain portal-specific.
export const PORTAL_LANG_KEY = 'portal-lang';

@Component({
  selector: 'app-portal-layout',
  imports: [Icon, BrandMark, RouterModule, NgTemplateOutlet, AuthBrand],
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
  protected readonly confirmationRequired = signal(false);
  protected readonly accepting = signal(false);
  protected readonly accountPage = signal(false);
  protected readonly workshopHome = computed(() => this.currentPath() === '/portal');
  protected readonly adult = signal(false);
  protected readonly acceptError = signal(false);
  protected async loadProfile(): Promise<void> {
    this.profileError.set(false);
    this.confirmationRequired.set(false);
    try { await this.client.profile(); } catch (error) {
      this.confirmationRequired.set(error instanceof PortalError && error.message === 'email_confirmation_required');
      this.profileError.set(true);
    }
  }
  protected async accept(): Promise<void> {
    if (!this.adult() || this.accepting()) return;
    this.accepting.set(true); this.acceptError.set(false);
    try { await this.client.consent(); } catch { this.acceptError.set(true); }
    finally { this.accepting.set(false); }
  }

  protected readonly smallScreen = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly mobileOpen = signal(false);
  protected toggleMobile(): void {
    this.mobileOpen.set(!this.mobileOpen());
    if (this.mobileOpen()) requestAnimationFrame(() => this.host.nativeElement.querySelector<HTMLElement>('.sidebar nav a')?.focus());
  }
  @HostListener('window:resize')
  protected resize(): void {
    this.smallScreen.set(window.innerWidth < 1280);
    if (!this.smallScreen()) this.mobileOpen.set(false);
  }
  @HostListener('keydown.escape')
  protected escape(): void {
    if (this.mobileOpen()) {
      this.mobileOpen.set(false);
      this.host.nativeElement.querySelector<HTMLElement>('.mobile-toggle')?.focus();
    }
    this.host.nativeElement.querySelector('details')?.removeAttribute('open');
  }
  protected readonly collapsed = signal(false);
  protected readonly authPage = signal(false);
  protected readonly currentPath = signal('/portal');
  protected readonly nav = computed(() => this.language.lang() === 'es'
    ? [{path:'/portal',label:'Resumen',icon:'calendar-event' as IconName}, {path:'/portal/courses',label:'Mis cursos',icon:'book' as IconName}, {path:'/portal/chats',label:'Práctica',icon:'sparkles' as IconName}, {path:'/portal/account',label:'Mi cuenta',icon:'users' as IconName}]
    : [{path:'/portal',label:'Overview',icon:'calendar-event' as IconName}, {path:'/portal/courses',label:'My courses',icon:'book' as IconName}, {path:'/portal/chats',label:'Practice',icon:'sparkles' as IconName}, {path:'/portal/account',label:'My account',icon:'users' as IconName}]);
  protected readonly pageLabel = computed(() => [...this.nav()].reverse().find(item => this.currentPath() === item.path || this.currentPath().startsWith(item.path + '/'))?.label);
  private updateRoute(url: string): void {
    const path = url.split(/[?#]/)[0]!;
    this.currentPath.set(path);
    this.authPage.set(path === '/portal/sign-in' || path === '/portal/sign-up');
    this.accountPage.set(path === '/portal/account');
    this.mobileOpen.set(false);
  }
  constructor() {
    ensureDashboardTheme();
    this.updateRoute(this.router.url);
    this.accountPage.set(this.router.url.split(/[?#]/)[0] === '/portal/account');
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) this.updateRoute(event.urlAfterRedirects);
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
      this.resize();
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
