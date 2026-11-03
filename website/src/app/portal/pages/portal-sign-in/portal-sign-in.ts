import { portalReturn } from '../../auth/portal-return';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ActionButton } from '../../../shared/action-button';
import { Language } from '../../../i18n/language';
import type { Lang } from '../../../i18n/lang';
import { UserSession } from '../../session/user-session';
import { PortalCredentials, PortalLoginForm } from '../portal-access/portal-login-form';
import { PortalPasswordForm } from '../portal-access/portal-password-form';

type SignInMode = 'login' | 'request' | 'request-sent' | 'recovery' | 'confirming';

const copy = {
  es: {
    loginTitle: 'Iniciar sesión', loginLead: 'Entra a tu portal para seguir aprendiendo.',
    forgot: '¿Olvidaste tu contraseña?', noAccount: '¿Sin cuenta? Créala aquí.',
    requestTitle: 'Recuperar contraseña', requestLead: 'Escribe tu correo y te enviamos un enlace para crear una contraseña nueva.',
    email: 'Correo electrónico', emailRequired: 'Escribe un correo válido.', send: 'Enviar enlace', sending: 'Enviando…', backToLogin: 'Volver a iniciar sesión',
    sentTitle: 'Revisa tu correo', sentLead: 'Si esa cuenta existe, te enviamos un enlace para recuperar tu contraseña.',
    recoveryTitle: 'Nueva contraseña', recoveryLead: 'Crea una contraseña nueva para tu cuenta.',
    confirmingTitle: 'Confirmando tu cuenta…', confirmingLead: 'Un momento mientras activamos tu cuenta.',
    failedTitle: 'Ese enlace ya no funciona', failedLead: 'Venció o ya se usó. Pide un enlace nuevo para entrar.',
  },
  en: {
    loginTitle: 'Sign in', loginLead: 'Enter your portal to keep learning.',
    forgot: 'Forgot your password?', noAccount: 'No account? Create one here.',
    requestTitle: 'Recover password', requestLead: 'Enter your email and we will send a link to create a new password.',
    email: 'Email', emailRequired: 'Enter a valid email.', send: 'Send link', sending: 'Sending…', backToLogin: 'Back to sign in',
    sentTitle: 'Check your email', sentLead: 'If that account exists, we sent a password-recovery link.',
    recoveryTitle: 'New password', recoveryLead: 'Create a new password for your account.',
    confirmingTitle: 'Confirming your account…', confirmingLead: 'One moment while we activate your account.',
    failedTitle: 'That link no longer works', failedLead: 'It expired or was already used. Request a fresh link to sign in.',
  },
} satisfies Record<Lang, Record<string, string>>;

// Student sign-in plus the Identity email flows: password recovery and
// email confirmation via URL tokens. Invite tokens belong to admins and
// are handed to /admin/sign-in untouched. After a token flow, admins
// land on /admin and students on /portal.
@Component({
  selector: 'app-portal-sign-in',
  imports: [ActionButton, PortalLoginForm, PortalPasswordForm, ReactiveFormsModule, RouterModule],
  templateUrl: './portal-sign-in.html',
  styleUrls: ['./portal-sign-in.css', '../portal-card.css', '../../../shared/form-controls.css'],
})
export class PortalSignIn {
  @ViewChild(PortalLoginForm) private readonly loginForm?: PortalLoginForm;
  @ViewChild(PortalPasswordForm) private readonly passwordForm?: PortalPasswordForm;

  private readonly language = inject(Language);
  protected readonly c = computed(() => copy[this.language.lang()]);
  protected readonly mode = signal<SignInMode>('login');
  protected readonly failed = signal(false);
  protected readonly requestError = signal<string | null>(null);
  protected readonly requesting = signal(false);
  protected readonly returnTarget = signal('/portal');

  protected readonly requestForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  private token = '';

  constructor(
    private readonly session: UserSession,
    private readonly router: Router,
    route: ActivatedRoute,
  ) {
    const params = route.snapshot.queryParams;
    const target = typeof params['return'] === 'string' ? params['return'] : '/portal';
    this.returnTarget.set(portalReturn(target));
    const fragment = new URLSearchParams(route.snapshot.fragment ?? '');
    if (fragment.has('recovery_token') || fragment.has('confirmation_token') || fragment.has('email_change_token')) {
      void this.router.navigate([], { relativeTo: route, queryParamsHandling: 'preserve', fragment: undefined, replaceUrl: true });
    }
    if (fragment.get('invite_token')) {
      void this.router.navigate(['/admin/sign-in'], { fragment: route.snapshot.fragment ?? '' });
    } else if (fragment.get('recovery_token')) {
      this.token = fragment.get('recovery_token') as string;
      this.mode.set('recovery');
    } else if (fragment.get('confirmation_token') || fragment.get('email_change_token')) {
      this.token = (fragment.get('confirmation_token') ?? fragment.get('email_change_token')) as string;
      this.mode.set('confirming');
      void this.confirm(fragment.get('email_change_token') ? 'email_change' : 'signup');
    }
  }

  protected async authenticate(credentials: PortalCredentials): Promise<void> {
    try {
      await this.session.login(credentials.email, credentials.password, this.language.lang());
      await this.router.navigateByUrl(this.returnTarget());
    } catch (error) {
      this.loginForm?.reportFailure(error instanceof Error ? error.message : 'Could not sign in.');
    }
  }

  protected async requestLink(): Promise<void> {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      this.requestError.set(this.c().emailRequired ?? '');
      return;
    }
    this.requestError.set(null);
    this.requesting.set(true);
    try {
      await this.session.requestRecovery(this.requestForm.get('email')?.value ?? '', this.language.lang());
      this.mode.set('request-sent');
    } catch (error) {
      this.requestError.set(error instanceof Error ? error.message : 'Could not send the link.');
    } finally {
      this.requesting.set(false);
    }
  }

  protected async submitPassword(password: string): Promise<void> {
    try {
      await this.session.completeRecovery(this.token, password);
      await this.afterToken();
    } catch (error) {
      this.passwordForm?.reportFailure(error instanceof Error ? error.message : 'Could not save your password.');
    }
  }

  private async confirm(type: 'signup' | 'email_change'): Promise<void> {
    try {
      await this.session.confirmEmail(this.token, type);
      await this.afterToken();
    } catch {
      this.failed.set(true);
    }
  }

  private async afterToken(): Promise<void> {
    if (this.session.isAdmin()) await this.router.navigateByUrl('/admin');
    else await this.router.navigateByUrl(this.returnTarget());
  }

  protected requestInvalid(): boolean {
    const control = this.requestForm.get('email');
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
