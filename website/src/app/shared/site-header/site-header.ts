import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../icon';
import { ActionLink } from '../action-link';
import { LogoPlaceholder } from '../logo-placeholder';

type Disclosure = 'explore' | 'contact' | null;

@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, Icon, LogoPlaceholder, ActionLink],
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
  protected readonly expanded = signal(false);
  protected readonly disclosure = signal<Disclosure>(null);
  protected readonly participationPage = signal(this.router.url.split(/[?#]/)[0] === '/participar');
  protected readonly primary = [
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/talleres', label: 'Talleres' },
    { path: '/recursos', label: 'Recursos' },
  ];
  protected readonly explore = [
    { path: '/', label: 'Inicio' },
    { path: '/comunidad', label: 'Comunidad' },
    { path: '/actividades', label: 'Actividades' },
    { path: '/historias', label: 'Historias' },
    { path: '/privacidad', label: 'Privacidad' },
    { path: '/terminos', label: 'Términos' },
    { path: '/seguridad', label: 'Seguridad' },
  ];
  protected readonly mobileLinks = [this.explore[0], ...this.primary, ...this.explore.slice(1), { path: '/contacto', label: 'Contacto' }];

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.dismiss();
        this.participationPage.set(event.urlAfterRedirects.split(/[?#]/)[0] === '/participar');
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
