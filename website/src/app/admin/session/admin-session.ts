import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserSession } from '../../portal/session/user-session';

export interface AdminUser {
  name: string;
  email: string;
}

/** Admin authorization over the same Identity session used by the portal. */
@Injectable({ providedIn: 'root' })
export class AdminSession {
  private readonly session = inject(UserSession);
  private readonly router = inject(Router);
  readonly user = computed<AdminUser | null>(() => this.session.user());
  readonly ready = this.session.ready;

  async restore(): Promise<boolean> {
    return await this.session.restore() && this.session.isAdmin();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await this.session.login(email, password, 'en');
    } catch (error) {
      if (error instanceof Error && error.message === 'Confirm your email with the link we sent before signing in.') {
        throw new Error('Accept the invitation from your email before signing in.');
      }
      throw error;
    }
    if (!this.session.isAdmin()) {
      await this.signOut(false);
      throw new Error('This account does not have admin access.');
    }
  }

  async signOut(navigate = true): Promise<void> {
    await this.session.signOut(false);
    if (navigate) await this.router.navigate(['/admin/sign-in']);
  }

  jwt(): Promise<string> { return this.session.jwt(); }
  requestRecovery(email: string): Promise<void> { return this.session.requestRecovery(email, 'en'); }
  completeRecovery(token: string, password: string): Promise<void> { return this.session.completeRecovery(token, password); }
  acceptInvite(token: string, password: string): Promise<void> { return this.session.acceptInvite(token, password); }
  confirmEmail(token: string, type: 'signup' | 'email_change' = 'signup'): Promise<void> {
    return this.session.confirmEmail(token, type);
  }
}
