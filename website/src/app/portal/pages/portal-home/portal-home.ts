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
    lead: 'Tu espacio personal de aprendizaje está en construcción. Ya puedes entrar y salir de tu cuenta; los cursos y la práctica guardada llegan en los próximos pasos.',
    coming: 'Lo que llegará:',
    courses: 'Cursos prediseñados para seguir a tu ritmo',
    tutor: 'Práctica con el tutor de IA dentro de tu portal',
    history: 'Tus conversaciones guardadas para retomarlas cuando quieras',
    signIn: 'Iniciar sesión',
    signUp: 'Crear cuenta',
    home: 'Volver al sitio',
    note: 'Paso 2 de 7: cuentas y acceso. Los cursos llegan en el paso 3.',
  },
  en: {
    greeting: 'Hi',
    title: 'Student portal',
    lead: 'Your personal learning space is under construction. You can already sign in and out; courses and saved practice arrive in the next steps.',
    coming: 'What is coming:',
    courses: 'Ready-made courses to follow at your own pace',
    tutor: 'Practice with the AI tutor inside your portal',
    history: 'Your saved conversations, ready to resume anytime',
    signIn: 'Sign in',
    signUp: 'Create account',
    home: 'Back to the site',
    note: 'Step 2 of 7: accounts and access. Courses arrive in step 3.',
  },
} satisfies Record<Lang, Record<string, string>>;

// Step-2 home: session-aware greeting, course content still ahead.
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
