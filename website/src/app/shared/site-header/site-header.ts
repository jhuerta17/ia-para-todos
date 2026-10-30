import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon';
import { ActionLink } from '../action-link';
import { BrandMark } from '../brand-mark';
import { Language } from '../../i18n/language';
import { Lang, StaticKey } from '../../i18n/lang';

type Disclosure = 'explore' | 'contact' | null;

const copy = {
  es: { home: 'IA para todos, inicio', nav: 'Navegación principal', explore: 'Explorar', contact: 'Contacto', panel: 'Encuentra nuestros canales de contacto.', mail: 'Correo: por definir', phone: 'Teléfono: por definir', viewContact: 'Ver contacto', participate: 'Participar', openMenu: 'Abrir navegación', closeMenu: 'Cerrar navegación', mobileNav: 'Navegación móvil' },
  en: { home: 'AI for everyone, home', nav: 'Main navigation', explore: 'Explore', contact: 'Contact', panel: 'Find our contact channels.', mail: 'Email: to be defined', phone: 'Phone: to be defined', viewContact: 'View contact', participate: 'Participate', openMenu: 'Open navigation', closeMenu: 'Close navigation', mobileNav: 'Mobile navigation' },
};

const labels: Record<Lang, Record<StaticKey, string>> = {
  es: { home: 'Inicio', nosotros: 'Nosotros', talleres: 'Talleres', recursos: 'Recursos', comunidad: 'Comunidad', actividades: 'Actividades', historias: 'Historias', privacidad: 'Privacidad', terminos: 'Acerca de', seguridad: 'Seguridad', contacto: 'Contacto', participar: 'Participar', cursos: 'Cursos' },
  en: { home: 'Home', nosotros: 'About', talleres: 'Workshops', recursos: 'Resources', comunidad: 'Community', actividades: 'Activities', historias: 'Stories', privacidad: 'Privacy', terminos: 'About', seguridad: 'Safety', contacto: 'Contact', participar: 'Participate', cursos: 'Courses' },
};

const PRIMARY: StaticKey[] = ['nosotros', 'talleres', 'cursos', 'recursos'];
const EXPLORE: StaticKey[] = ['home', 'comunidad', 'actividades', 'historias', 'privacidad', 'terminos', 'seguridad'];

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
  protected readonly explore = computed(() => EXPLORE.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] })));
  protected readonly mobileLinks = computed(() => [...this.explore().slice(0, 1), ...this.primary(), ...this.explore().slice(1), { path: this.language.path('contacto'), label: labels[this.language.lang()].contacto }]);
  protected readonly alternate = signal(this.language.alternate());

  private onParticipationPage(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '/participar' || path === '/en/participate';
  }

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.dismiss();
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

  protected hoverDisclosure(name: Disclosure, trigger: HTMLButtonElement): void {
    this.activeTrigger = trigger;
    this.disclosure.set(name);
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
      if (wasExpanded) this.mobileToggle()?.nativeElement.focus();
      else if (wasDisclosure) this.activeTrigger?.focus();
    }
  }

  protected onOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.element.nativeElement.contains(event.target)) this.dismiss();
  }
}
