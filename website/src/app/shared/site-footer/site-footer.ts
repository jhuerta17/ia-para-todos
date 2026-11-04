import { WhatsappLink } from '../whatsapp-link';
import { ActionButton } from '../action-button';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BrandMark } from '../brand-mark';
import { Language } from '../../i18n/language';
import { Lang, StaticKey } from '../../i18n/lang';

const copy = {
  es: { home: 'IA para todos, inicio', identity: 'Talleres gratuitos para aprender IA en español, desde cero y en comunidad.', newsHeading: 'Sigamos aprendiendo', newsLead: 'Recibe novedades sobre talleres y recursos. Sin spam.', newsLabel: 'Correo electrónico', newsPh: 'nombre@ejemplo.com', newsError: 'Escribe un correo válido.', newsButton: 'Suscribirme', newsSending: 'Enviando…', newsResult: '¡Gracias por suscribirte! Te avisaremos de las novedades.', newsFailed: 'No pudimos completar la suscripción. Inténtalo de nuevo.', honeypot: 'No completar este campo', learn: 'Aprender', account: 'Mi cuenta', accountNav: 'Cuenta de estudiante', community: 'Comunidad', communityNav: 'Comunidad y organización', language: 'Idioma', exploreNav: 'Navegación del pie de página', infoNav: 'Información del sitio', admin: 'Administración', copyright: '©2026 IA para todos. Todos los derechos reservados.' },
  en: { home: 'AI for everyone, home', identity: 'Free workshops to learn AI in Spanish, from scratch and in community.', newsHeading: 'Keep learning', newsLead: 'Get news about workshops and resources. No spam.', newsLabel: 'Email', newsPh: 'name@example.com', newsError: 'Write a valid email.', newsButton: 'Subscribe', newsSending: 'Sending…', newsResult: 'Thanks for subscribing! We’ll keep you posted.', newsFailed: 'We could not complete the subscription. Please try again.', honeypot: 'Do not fill in this field', learn: 'Learn', account: 'My account', accountNav: 'Student account', community: 'Community', communityNav: 'Community and organization', language: 'Language', exploreNav: 'Footer navigation', infoNav: 'Site information', admin: 'Admin', copyright: '©2026 AI for everyone. All rights reserved.' },
};

const labels: Record<Lang, Record<StaticKey, string>> = {
  es: { home: 'Inicio', nosotros: 'Nosotros', talleres: 'Talleres', cursos: 'Cursos', recursos: 'Recursos', comunidad: 'Comunidad', participar: 'Participar', actividades: 'Actividades', contacto: 'Contacto', donar: 'Donar', privacidad: 'Privacidad', terminos: 'Acerca del sitio', seguridad: 'Uso responsable' },
  en: { home: 'Home', nosotros: 'About', talleres: 'Workshops', cursos: 'Courses', recursos: 'Resources', comunidad: 'Community', participar: 'Participate', actividades: 'Activities', contacto: 'Contact', donar: 'Donate', privacidad: 'Privacy', terminos: 'About this site', seguridad: 'Responsible use' },
};

const flowLabels = {
  es: { agenda: 'Próximos talleres', preparacion: 'Antes de tu taller' },
  en: { agenda: 'Upcoming workshops', preparacion: 'Before your workshop' },
} satisfies Record<Lang, Record<string, string>>;

const accountLabels = {
  es: { signIn: 'Iniciar sesión', signUp: 'Crear cuenta', courses: 'Mis cursos', chats: 'Práctica guardada', booking: 'Mi reserva' },
  en: { signIn: 'Sign in', signUp: 'Create account', courses: 'My courses', chats: 'Saved practice', booking: 'My reservation' },
} satisfies Record<Lang, Record<string, string>>;

const LEARN: StaticKey[] = ['talleres', 'cursos', 'recursos', 'actividades'];
const COMMUNITY: StaticKey[] = ['nosotros', 'comunidad', 'contacto', 'participar', 'donar'];
const INFO: StaticKey[] = ['privacidad', 'terminos', 'seguridad'];

@Component({selector: 'app-site-footer', imports: [WhatsappLink, ActionButton, RouterLink, BrandMark, ReactiveFormsModule], templateUrl: './site-footer.html', styleUrls: ['./site-footer.css', '../form-controls.css'], changeDetection: ChangeDetectionStrategy.OnPush})
export class SiteFooter {
  protected readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly complete = signal(false);
  protected readonly failed = signal(false);
  protected readonly sending = signal(false);
  protected readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  protected readonly learning = computed(() => {
    const lang = this.language.lang();
    const entries = LEARN.map(key => ({ path: this.language.path(key), label: labels[lang][key] }));
    entries.splice(1, 0, { path: this.language.workshop('agenda'), label: flowLabels[lang].agenda });
    entries.push({ path: this.language.workshop('preparacion'), label: flowLabels[lang].preparacion });
    return entries;
  });
  protected readonly account = computed(() => {
    const text = accountLabels[this.language.lang()];
    return [
      { path: '/portal/sign-in', label: text.signIn },
      { path: '/portal/sign-up', label: text.signUp },
      { path: '/portal/courses', label: text.courses },
      { path: '/portal/chats', label: text.chats },
      { path: this.language.workshop('reservas'), label: text.booking },
    ];
  });
  protected readonly community = computed(() => COMMUNITY.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] })));
  protected readonly alternate = signal(this.language.alternate());
  protected readonly info = computed(() => INFO.map(key => ({ path: this.language.path(key), label: labels[this.language.lang()][key] })));
  constructor() {
    inject(Router).events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) { this.email.reset(); this.complete.set(false); this.failed.set(false); this.alternate.set(this.language.alternate()); }
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
