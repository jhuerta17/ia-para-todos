import { Component, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminAuthLayout } from '../../layout/admin-auth-layout/admin-auth-layout';
import { AdminSession } from '../../session/admin-session';
import { AdminAccessForm, AdminCredentials } from './admin-access-form';
import { AdminPasswordForm } from './admin-password-form';

type AccessMode = 'login' | 'request' | 'request-sent' | 'invite' | 'recovery' | 'confirming' | 'confirmed';

// Owner sign-in plus the Identity email flows: invite acceptance,
// password recovery, and email confirmation via URL tokens.
@Component({
  selector: 'app-admin-access',
  imports: [RouterModule, ReactiveFormsModule, AdminAuthLayout, AdminAccessForm, AdminPasswordForm],
  templateUrl: './admin-access.html',
})
export class AdminAccess {
  @ViewChild(AdminAccessForm) private readonly loginForm?: AdminAccessForm;
  @ViewChild(AdminPasswordForm) private readonly passwordForm?: AdminPasswordForm;

  protected readonly mode = signal<AccessMode>('login');
  protected readonly denied = signal(false);
  protected readonly confirmError = signal<string | null>(null);
  protected readonly requestError = signal<string | null>(null);
  protected readonly requesting = signal(false);
  protected readonly returnTarget = signal('/admin');

  protected readonly requestForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  private token = '';

  constructor(
    private readonly session: AdminSession,
    private readonly router: Router,
    route: ActivatedRoute,
  ) {
    const params = route.snapshot.queryParams;
    if (params['denied'] === '1') this.denied.set(true);
    const target = typeof params['return'] === 'string' ? params['return'] : '/admin';
    this.returnTarget.set(target.startsWith('/admin') ? target : '/admin');
    const fragment = new URLSearchParams(route.snapshot.fragment ?? '');
    const invite = fragment.get('invite_token');
    const recovery = fragment.get('recovery_token');
    const confirmation = fragment.get('confirmation_token');
    const emailChange = fragment.get('email_change_token');
    if (invite) {
      this.token = invite;
      this.mode.set('invite');
    } else if (recovery) {
      this.token = recovery;
      this.mode.set('recovery');
    } else if (confirmation || emailChange) {
      this.token = (confirmation ?? emailChange) as string;
      this.mode.set('confirming');
      void this.confirm(emailChange ? 'email_change' : 'signup');
    }
  }

  protected async authenticate(credentials: AdminCredentials): Promise<void> {
    try {
      await this.session.login(credentials.email, credentials.password);
      await this.router.navigateByUrl(this.returnTarget());
    } catch (error) {
      this.loginForm?.reportFailure(error instanceof Error ? error.message : 'No pudimos iniciar sesión.');
    }
  }

  protected async submitPassword(password: string): Promise<void> {
    try {
      if (this.mode() === 'invite') {
        await this.session.acceptInvite(this.token, password);
      } else {
        await this.session.completeRecovery(this.token, password);
      }
      await this.router.navigateByUrl(this.returnTarget());
    } catch (error) {
      this.passwordForm?.reportFailure(error instanceof Error ? error.message : 'No pudimos guardar tu contraseña.');
    }
  }

  protected async submitRecoveryRequest(): Promise<void> {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    this.requestError.set(null);
    this.requesting.set(true);
    try {
      await this.session.requestRecovery(this.requestForm.getRawValue().email);
      this.mode.set('request-sent');
    } catch {
      this.requestError.set('No pudimos enviar el correo. Inténtalo de nuevo.');
    } finally {
      this.requesting.set(false);
    }
  }

  protected showLogin(): void {
    this.clearFragment();
    this.mode.set('login');
  }

  private async confirm(type: 'signup' | 'email_change'): Promise<void> {
    try {
      await this.session.confirmEmail(this.token, type);
      this.clearFragment();
      this.mode.set('confirmed');
    } catch (error) {
      this.clearFragment();
      this.confirmError.set(error instanceof Error ? error.message : 'No pudimos confirmar tu correo.');
      this.mode.set('login');
    }
  }

  private clearFragment(): void {
    void this.router.navigate([], { fragment: undefined, replaceUrl: true });
  }
}
