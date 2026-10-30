import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon';
import { ActionLink } from '../action-link';
import { BrandMark } from '../brand-mark';
import { Language } from '../../i18n/language';
import { Lang, StaticKey } from '../../i18n/lang';

type Disclosure = 'learn' | 'community' | null;

const copy = {
  es: { home: 'IA para todos, inicio', nav: 'Navegación principal', learn: 'Aprender', community: 'Comunidad', participate: 'Participar', openMenu: 'Abrir navegación', closeMenu: 'Cerrar navegación', mobileNav: 'Navegación móvil', language: 'Idioma' },
  en: { home: 'AI for everyone, home', nav: 'Main navigation', learn: 'Learn', community: 'Community', participate: 'Participate', openMenu: 'Open navigation', closeMenu: 'Close navigation', mobileNav: 'Mobile navigation', language: 'Language' },
};

const labels: Record<Lang, Record<StaticKey, string>> = {
  es: { home: 'Inicio', nosotros: 'Nosotros', talleres: 'Talleres', recursos: 'Recursos', comunidad: 'Comunidad', actividades: 'Actividades', historias: 'Historias', privacidad: 'Privacidad', terminos: 'Acerca de', seguridad: 'Seguridad', contacto: 'Contacto', participar: 'Participar', cursos: 'Cursos' },
  en: { home: 'Home', nosotros: 'About', talleres: 'Workshops', recursos: 'Resources', comunidad: 'Community', actividades: 'Activities', historias: 'Stories', privacidad: 'Privacy', terminos: 'About', seguridad: 'Safety', contacto: 'Contact', participar: 'Participate', cursos: 'Courses' },
};

const PRIMARY: StaticKey[] = ['nosotros', 'contacto'];
const LEARN: StaticKey[] = ['talleres', 'cursos', 'recursos', 'actividades'];
const COMMUNITY: StaticKey[] = ['comunidad', 'historias'];

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Icon, BrandMark, ActionLink],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onOutsideClick($event)',
    '(document:keydown.escape)': 'dismiss(true)',
    '(window:resize)': 'dismiss()',
  },
})
export class SiteHeader {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  private readonly mobileToggle = viewChild<ElementRef<HTMLButtonElement>>('mobileToggle');
  private activeTrigger: HTMLButtonElement | null = null;
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly expanded = signal(false);
  protected readonly disclosure = signal<Disclosure>(null);
  protected readonly participationPage = signal(this.onParticipationPage(this.router.url));
  protected readonly primary = computed(() => PRIMARY.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] })));
  protected readonly currentUrl = signal(this.router.url);
  protected readonly groups = computed(() => [
    { id: 'learn' as const, label: this.c().learn, links: this.links(LEARN), active: this.isGroupActive(LEARN) },
    { id: 'community' as const, label: this.c().community, links: this.links(COMMUNITY), active: this.isGroupActive(COMMUNITY) },
  ]);
  protected readonly alternate = signal(this.language.alternate());

  private onParticipationPage(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '/participar' || path === '/en/participate';
  }

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.dismiss();
        this.currentUrl.set(event.urlAfterRedirects);
        this.participationPage.set(this.onParticipationPage(event.urlAfterRedirects));
        this.alternate.set(this.language.alternate());
      }
    });
  }

  protected toggleMobile(): void {
    this.disclosure.set(null);
    this.expanded.update(value => !value);
  }

  protected toggleDisclosure(name: Disclosure, trigger: HTMLButtonElement): void {
    this.activeTrigger = trigger;
    this.disclosure.update(value => value === name ? null : name);
  }

  private links(keys: StaticKey[]) {
    return keys.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] }));
  }

  private isGroupActive(keys: StaticKey[]): boolean {
    const url = this.currentUrl().split(/[?#]/)[0];
    return keys.some(key => url === this.language.path(key) || url.startsWith(`${this.language.path(key)}/`));
  }

  protected leaveDisclosure(event: FocusEvent): void {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget ||
      !(event.currentTarget as HTMLElement).contains(event.relatedTarget)) this.disclosure.set(null);
  }

  protected dismiss(restoreFocus = false): void {
    const wasExpanded = this.expanded();
    const wasDisclosure = this.disclosure();
    this.expanded.set(false);
    this.disclosure.set(null);
    if (restoreFocus) {
      if (wasDisclosure) {
        this.activeTrigger?.focus();
        if (wasExpanded) this.expanded.set(true);
      } else if (wasExpanded) this.mobileToggle()?.nativeElement.focus();
    }
  }

  protected onOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.element.nativeElement.contains(event.target)) this.dismiss();
  }
}
