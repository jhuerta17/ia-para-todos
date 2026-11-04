import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';
import { UserSession } from '../../session/user-session';
import { PortalSignup, PortalSignupForm } from '../portal-access/portal-signup-form';

const copy = {
  es: {
    title: 'Crear cuenta',
    privacy: 'Aviso de privacidad',
    lead: 'Crea tu cuenta gratuita para entrar a tu portal. Te enviamos un correo para confirmarla.',
    sentTitle: 'Confirma tu correo',
    sentLead: 'Te enviamos un enlace de confirmación. Ábrelo y entrarás directo a tu portal.',
    haveAccount: '¿Ya tienes cuenta? Entra aquí.',
    backToLogin: 'Volver a iniciar sesión',
    free: 'Siempre gratis para la comunidad.',
  },
  en: {
    title: 'Create account',
    privacy: 'Privacy notice',
    lead: 'Create your free account to enter your portal. We will email you a link to confirm it.',
    sentTitle: 'Confirm your email',
    sentLead: 'We sent a confirmation link. Open it and you will land straight in your portal.',
    haveAccount: 'Already have an account? Sign in here.',
    backToLogin: 'Back to sign in',
    free: 'Always free for the community.',
  },
} satisfies Record<Lang, Record<string, string>>;

// Student registration. Success shows a confirm-email state; the
// confirmation link lands on sign-in, which consumes it and opens
// the portal. Signed-in visitors never see this page (portal guard).
@Component({
  selector: 'app-portal-sign-up',
  imports: [PortalSignupForm, RouterModule],
  templateUrl: './portal-sign-up.html',
  styleUrls: ['./portal-sign-up.css', '../portal-card.css'],
})
export class PortalSignUp {
  @ViewChild(PortalSignupForm) private readonly signupForm?: PortalSignupForm;

  private readonly language = inject(Language);
  protected readonly privacyPath = computed(() => this.language.path('privacidad'));
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly sent = signal(false);
  protected readonly sentEmail = signal('');

  constructor(private readonly session: UserSession) {}

  protected async register(signup: PortalSignup): Promise<void> {
    try {
      await this.session.signup(signup.name, signup.email, signup.password, this.language.lang());
      this.sentEmail.set(signup.email);
      this.sent.set(true);
    } catch (error) {
      this.signupForm?.reportFailure(error instanceof Error ? error.message : 'Could not create your account.');
    }
  }
}
