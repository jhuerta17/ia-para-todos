import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActionButton } from '../../../shared/action-button';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';
import { UserSession } from '../../session/user-session';

const copy = {
  es: {
    greeting: 'Hola',
    title: 'Portal del estudiante',
    lead: 'Comienza con Tu primer prompt: tres lecciones cortas para aprender a pedir, mejorar y verificar respuestas.',
    coming: 'Más adelante',
    courses: 'Explorar mis cursos',
    tutor: 'Práctica con el tutor de IA dentro de tu portal',
    history: 'Tus conversaciones guardadas para retomarlas cuando quieras',
    signIn: 'Iniciar sesión',
    signUp: 'Crear cuenta',
    home: 'Volver al sitio',
    note: 'Gratis y a tu ritmo.',
  },
  en: {
    greeting: 'Hi',
    title: 'Student portal',
    lead: 'Start with Your first prompt: three short lessons to learn to ask, improve, and verify responses.',
    coming: 'Coming later',
    courses: 'Explore my courses',
    tutor: 'Practice with the AI tutor inside your portal',
    history: 'Your saved conversations, ready to resume anytime',
    signIn: 'Sign in',
    signUp: 'Create account',
    home: 'Back to the site',
    note: 'Free and at your own pace.',
  },
} satisfies Record<Lang, Record<string, string>>;

// Session-aware landing page for the learning portal.
@Component({
  selector: 'app-portal-home',
  imports: [ActionButton, RouterModule],
  templateUrl: './portal-home.html',
  styleUrls: ['./portal-home.css', '../portal-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortalHome {
  private readonly language = inject(Language);
  protected readonly session = inject(UserSession);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected homePath(): string {
    return this.language.path('home');
  }
}
