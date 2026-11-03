import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon';
import { ActionLink } from '../action-link';
import { BrandMark } from '../brand-mark';
import { Language } from '../../i18n/language';
import { Lang, StaticKey, WorkshopKey } from '../../i18n/lang';

type Disclosure = 'workshops' | 'learn' | 'community' | null;

const copy = {
  es: { home: 'IA para todos, inicio', nav: 'Navegación principal', workshops: 'Talleres', learn: 'Aprender', community: 'Comunidad', reserve: 'Reservar lugar', openMenu: 'Abrir navegación', closeMenu: 'Cerrar navegación', mobileNav: 'Navegación móvil', language: 'Idioma' },
  en: { home: 'AI for everyone, home', nav: 'Main navigation', workshops: 'Workshops', learn: 'Learn', community: 'Community', reserve: 'Reserve a place', openMenu: 'Open navigation', closeMenu: 'Close navigation', mobileNav: 'Mobile navigation', language: 'Language' },
};

const labels: Record<Lang, Record<StaticKey, string>> = {
  es: { home: 'Inicio', nosotros: 'Nosotros', talleres: 'Talleres', recursos: 'Recursos', comunidad: 'Comunidad', actividades: 'Actividades', privacidad: 'Privacidad', terminos: 'Acerca de', seguridad: 'Seguridad', contacto: 'Contacto', participar: 'Participar', cursos: 'Cursos', donar: 'Donar' },
  en: { home: 'Home', nosotros: 'About', talleres: 'Workshops', recursos: 'Resources', comunidad: 'Community', actividades: 'Activities', privacidad: 'Privacy', terminos: 'About', seguridad: 'Safety', contacto: 'Contact', participar: 'Participate', cursos: 'Courses', donar: 'Donate' },
};

const workshopLabels: Record<Lang, Record<'catalog' | WorkshopKey, string>> = {
  es: { catalog: 'Catálogo', agenda: 'Próximos talleres', preparacion: 'Antes de tu taller', reservas: 'Mi reserva' },
  en: { catalog: 'Catalog', agenda: 'Upcoming workshops', preparacion: 'Before your workshop', reservas: 'My reservation' },
};

const PRIMARY: StaticKey[] = ['nosotros', 'contacto'];
const LEARN: StaticKey[] = ['cursos', 'recursos', 'actividades'];
const COMMUNITY: StaticKey[] = ['comunidad', 'participar', 'donar'];
const FLOWS: WorkshopKey[] = ['agenda', 'preparacion', 'reservas'];

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
  protected readonly schedulePage = signal(this.onSchedulePage(this.router.url));
  protected readonly primary = computed(() => PRIMARY.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] })));
  protected readonly currentUrl = signal(this.router.url);
  protected readonly groups = computed(() => {
    const workshops = [
      { path: this.language.path('talleres'), label: workshopLabels[this.language.lang()].catalog },
      ...FLOWS.map(key => ({ path: this.language.workshop(key), label: workshopLabels[this.language.lang()][key] })),
    ];
    const learn = this.links(LEARN);
    const community = this.links(COMMUNITY);
    return [
      { id: 'workshops' as const, label: this.c().workshops, links: workshops, active: this.isGroupActive(workshops) },
      { id: 'learn' as const, label: this.c().learn, links: learn, active: this.isGroupActive(learn) },
      { id: 'community' as const, label: this.c().community, links: community, active: this.isGroupActive(community) },
    ];
  });
  protected readonly alternate = signal(this.language.alternate());

  private onSchedulePage(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '/agenda' || path === '/en/schedule';
  }

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.dismiss();
        this.currentUrl.set(event.urlAfterRedirects);
        this.schedulePage.set(this.onSchedulePage(event.urlAfterRedirects));
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

  private isGroupActive(links: { path: string }[]): boolean {
    const url = this.currentUrl().split(/[?#]/)[0];
    return links.some(link => url === link.path || url.startsWith(`${link.path}/`));
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
