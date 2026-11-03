import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Lang } from '../../i18n/lang';

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

type GoTrueClient = import('gotrue-js').default;
type GoTrueUser = import('gotrue-js').User;

const copy = {
  es: {
    loginFailed: 'Correo o contraseña incorrectos.',
    signupFailed: 'No pudimos crear tu cuenta. Inténtalo de nuevo.',
    exists: 'Esa cuenta ya existe. Inicia sesión o recupera tu contraseña.',
    unconfirmed: 'Confirma tu correo con el enlace que te enviamos antes de entrar.',
    unreachable: 'No pudimos contactar el servicio de acceso. Inténtalo de nuevo.',
    linkExpired: 'Este enlace venció o ya se usó. Pide uno nuevo e inténtalo de nuevo.',
    sent: 'Revisa tu correo para continuar.',
  },
  en: {
    loginFailed: 'Incorrect email or password.',
    signupFailed: 'We could not create your account. Try again.',
    exists: 'That account already exists. Sign in or recover your password.',
    unconfirmed: 'Confirm your email with the link we sent before signing in.',
    unreachable: 'Could not reach the sign-in service. Try again.',
    linkExpired: 'This link expired or was already used. Request a new one and try again.',
    sent: 'Check your email to continue.',
  },
} satisfies Record<Lang, Record<string, string>>;

const serverText = (error: unknown): string => {
  const json = (error as { json?: { msg?: string; error_description?: string; error?: string } })?.json;
  return `${json?.msg ?? ''} ${json?.error_description ?? ''} ${json?.error ?? ''}`.toLowerCase();
};

/**
 * Shared Netlify Identity session for portal and admin.
 * The gotrue-js client loads lazily so public visitors never
 * download it, and `setCookie` keeps the `nf_jwt` cookie fresh. Any
 * authenticated user (any role, including admins) may use the portal;
 * only the `admin` role additionally opens `/admin`.
 */
@Injectable({ providedIn: 'root' })
export class UserSession {
  readonly user = signal<PortalUser | null>(null);
  readonly ready = signal(false);

  private auth: GoTrueClient | null = null;
  private current: GoTrueUser | null = null;
  private restorePromise: Promise<boolean> | null = null;
  private readonly document = inject(DOCUMENT);

  constructor(private readonly router: Router) {}

  /** Restore saved credentials, refreshing expired tokens before admitting a user. */
  restore(): Promise<boolean> {
    if (!this.restorePromise) {
      this.restorePromise = this.doRestore().finally(() => { this.restorePromise = null; });
    }
    return this.restorePromise;
  }

  async signup(name: string, email: string, password: string, lang: Lang): Promise<void> {
    const auth = await this.client();
    try {
      await auth.signup(email, password, { full_name: name, adult: true, privacy_version: '2026-11-03' });
    } catch (error) {
      throw new Error(this.signupMessage(error, lang));
    }
  }

  async login(email: string, password: string, lang: Lang): Promise<void> {
    const auth = await this.client();
    try {
      this.current = await auth.login(email, password, true);
    } catch (error) {
      throw new Error(this.loginMessage(error, lang));
    }
    this.afterAuth();
  }

  async signOut(navigate = true): Promise<void> {
    try {
      await this.current?.logout();
    } catch {
      // The local session clears even when the network call fails.
    }
    this.current = null;
    this.user.set(null);
    this.restorePromise = null;
    if (navigate) await this.router.navigate(['/portal/sign-in']);
  }

  /** Fresh JWT for portal API calls; clears the session when unrefreshable. */
  async jwt(): Promise<string> {
    if (!this.current) throw new Error('NO_SESSION');
    try {
      return await this.current.jwt();
    } catch {
      await this.signOut(false);
      throw new Error('SESSION_EXPIRED');
    }
  }

  async requestRecovery(email: string, lang: Lang): Promise<void> {
    const auth = await this.client();
    try {
      await auth.requestPasswordRecovery(email);
    } catch (error) {
      throw new Error(this.tokenMessage(error, lang));
    }
  }

  async completeRecovery(token: string, password: string): Promise<void> {
    try {
      const auth = await this.client();
      const user = await auth.recover(token, true);
      await user.update({ password });
      this.current = user;
      this.afterAuth();
    } catch (error) {
      throw new Error(this.tokenMessage(error, this.currentLang()));
    }
  }

  async acceptInvite(token: string, password: string): Promise<void> {
    try {
      this.current = await (await this.client()).acceptInvite(token, password, true);
      this.afterAuth();
    } catch (error) {
      throw new Error(this.tokenMessage(error, 'en'));
    }
  }

  async confirmEmail(token: string, type: 'signup' | 'email_change' = 'signup'): Promise<void> {
    try {
      const auth = await this.client();
      this.current = type === 'signup' ? await auth.confirm(token, true) : await auth.verify(type, token, true);
      this.afterAuth();
    } catch (error) {
      throw new Error(this.tokenMessage(error, this.currentLang()));
    }
  }

  isAdmin(): boolean {
    return this.user()?.roles.includes('admin') ?? false;
  }

  private currentLang(): Lang {
    return this.document.documentElement.lang === 'en' ? 'en' : 'es';
  }

  private async client(): Promise<GoTrueClient> {
    if (!this.auth) {
      const { default: GoTrue } = await import('gotrue-js');
      this.auth = new GoTrue({ APIUrl: '/.netlify/identity', setCookie: true });
    }
    return this.auth;
  }

  private async doRestore(): Promise<boolean> {
    try {
      // Reject incomplete browser state before gotrue attempts to parse it.
      const saved = this.document.defaultView?.localStorage.getItem('gotrue.user');
      if (saved) {
        const value = JSON.parse(saved);
        if (!value || typeof value.id !== 'string' || typeof value.email !== 'string' ||
            !value.email || typeof value.token?.access_token !== 'string' ||
            value.token.access_token.split('.').length !== 3 ||
            typeof value.token.refresh_token !== 'string' ||
            (value.app_metadata?.roles !== undefined &&
             (!Array.isArray(value.app_metadata.roles) || !value.app_metadata.roles.every((role: unknown) => typeof role === 'string')))) {
          throw new Error('INVALID_SAVED_SESSION');
        }
      }
      this.current = (await this.client()).currentUser();
      // Refresh expired credentials before a guard admits the saved session.
      if (this.current && !await this.current.jwt()) throw new Error('INVALID_SAVED_SESSION');
      this.user.set(this.current ? this.toPortalUser(this.current) : null);
    } catch {
      this.current?.clearSession();
      this.current = null;
      this.user.set(null);
      try { this.document.defaultView?.localStorage.removeItem('gotrue.user'); } catch { /* Storage may be unavailable. */ }
    }
    this.ready.set(true);
    return this.current !== null;
  }

  private afterAuth(): void {
    this.restorePromise = null;
    this.user.set(this.current ? this.toPortalUser(this.current) : null);
    this.ready.set(true);
  }

  private toPortalUser(user: GoTrueUser): PortalUser {
    const fullName = user.user_metadata?.['full_name'];
    const name = typeof fullName === 'string' && fullName.trim() !== '' ? fullName.trim() : user.email.split('@')[0] || user.email;
    return { id: user.id, name, email: user.email, roles: user.app_metadata?.roles ?? [] };
  }

  private loginMessage(error: unknown, lang: Lang): string {
    if (error instanceof TypeError) return copy[lang].unreachable;
    const text = serverText(error);
    if (text.includes('confirm')) return copy[lang].unconfirmed;
    const status = (error as { status?: number })?.status;
    if (status === 400 || status === 401 || status === 422 || /invalid|incorrect|credential|password|not found|no user/i.test(text)) {
      return copy[lang].loginFailed;
    }
    return copy[lang].unreachable;
  }

  private signupMessage(error: unknown, lang: Lang): string {
    if (error instanceof TypeError) return copy[lang].unreachable;
    const text = serverText(error);
    if (/already|exists|registered|duplicate|taken/i.test(text)) return copy[lang].exists;
    return copy[lang].signupFailed;
  }

  private tokenMessage(error: unknown, lang: Lang): string {
    if (error instanceof TypeError) return copy[lang].unreachable;
    const status = (error as { status?: number })?.status;
    if (status === 400 || status === 401 || status === 404 || status === 422) return copy[lang].linkExpired;
    return copy[lang].unreachable;
  }
}
