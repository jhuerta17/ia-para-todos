import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BrandMark } from '../brand-mark';
import { Icon } from '../icon';
import { Language } from '../../i18n/language';
import { Lang, StaticKey } from '../../i18n/lang';

const copy = {
  es: { home: 'IA para todos, inicio', identity: 'Aprender IA en español, desde cero y en comunidad. Talleres gratuitos en español.', newsHeading: 'Sigamos aprendiendo', newsLead: 'Recibe novedades sobre talleres y recursos. Sin spam.', newsLabel: 'Correo electrónico', newsPh: 'nombre@ejemplo.com', newsError: 'Escribe un correo válido.', newsButton: 'Suscribirme', newsSending: 'Enviando…', newsResult: '¡Gracias por suscribirte! Te avisaremos de las novedades.', newsFailed: 'No pudimos completar la suscripción. Inténtalo de nuevo.', honeypot: 'No completar este campo', explore: 'Explora', exploreNav: 'Navegación del pie de página', info: 'Información', infoNav: 'Información del sitio', talk: 'Conversemos', talkLead: 'Todos los canales de contacto, en un solo lugar.', aboutContact: 'Sobre el contacto', copyright: '©2026 IA para todos. Todos los derechos reservados.' },
  en: { home: 'AI for everyone, home', identity: 'Learn AI in Spanish, from scratch and in community. Free workshops in Spanish.', newsHeading: 'Keep learning', newsLead: 'Get news about workshops and resources. No spam.', newsLabel: 'Email', newsPh: 'name@example.com', newsError: 'Write a valid email.', newsButton: 'Subscribe', newsSending: 'Sending…', newsResult: 'Thanks for subscribing! We’ll keep you posted.', newsFailed: 'We could not complete the subscription. Please try again.', honeypot: 'Do not fill in this field', explore: 'Explore', exploreNav: 'Footer navigation', info: 'Information', infoNav: 'Site information', talk: 'Let’s talk', talkLead: 'Every contact channel, in one place.', aboutContact: 'About contact', copyright: '©2026 AI for everyone. All rights reserved.' },
};

const labels: Record<Lang, Record<StaticKey, string>> = {
  es: { home: 'Inicio', nosotros: 'Nosotros', talleres: 'Talleres', cursos: 'Cursos', recursos: 'Recursos', comunidad: 'Comunidad', participar: 'Participar', actividades: 'Actividades', historias: 'Historias', contacto: 'Contacto', privacidad: 'Privacidad', terminos: 'Acerca del sitio', seguridad: 'Uso responsable' },
  en: { home: 'Home', nosotros: 'About', talleres: 'Workshops', cursos: 'Courses', recursos: 'Resources', comunidad: 'Community', participar: 'Participate', actividades: 'Activities', historias: 'Stories', contacto: 'Contact', privacidad: 'Privacy', terminos: 'About this site', seguridad: 'Responsible use' },
};

const NAVIGATION: StaticKey[] = ['home', 'nosotros', 'talleres', 'cursos', 'recursos', 'comunidad', 'participar'];
const INFO: StaticKey[] = ['privacidad', 'terminos', 'seguridad'];

@Component({selector: 'app-site-footer', imports: [RouterLink, BrandMark, Icon, ReactiveFormsModule], templateUrl: './site-footer.html', styleUrls: ['./site-footer.css', '../form-controls.css'], changeDetection: ChangeDetectionStrategy.OnPush})
export class SiteFooter {
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly complete = signal(false);
  protected readonly failed = signal(false);
  protected readonly sending = signal(false);
  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly navigation = computed(() => NAVIGATION.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] })));
  protected readonly info = computed(() => INFO.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] })));
  constructor() {
    inject(Router).events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) { this.email.reset(); this.complete.set(false); }
    });
  }
  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.complete.set(false);
    this.failed.set(false);
    this.email.markAsTouched();
    if (this.email.invalid || this.sending()) return;
    this.sending.set(true);
    try {
      const body = new URLSearchParams({ 'form-name': 'newsletter', 'bot-field': '', language: this.language.lang(), email: this.email.value.trim() });
      const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      if (!response.ok) throw new Error(`Netlify Forms responded ${response.status}`);
      this.complete.set(true);
      this.email.reset();
    } catch {
      this.failed.set(true);
    } finally {
      this.sending.set(false);
    }
  }
}
