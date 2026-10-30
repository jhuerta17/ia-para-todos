import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface AdminUser {
  name: string;
  email: string;
}

type GoTrueClient = import('gotrue-js').default;
type GoTrueUser = import('gotrue-js').User;

const LOGIN_FAILED = 'El correo o la contraseña no son correctos.';
const UNCONFIRMED = 'Debes aceptar la invitación desde tu correo antes de entrar.';
const FORBIDDEN = 'Esta cuenta no tiene permisos de administración.';
const UNREACHABLE = 'No pudimos conectar con el servicio de acceso. Inténtalo de nuevo.';
const LINK_EXPIRED = 'Este enlace caducó o ya se usó. Pide uno nuevo e inténtalo de nuevo.';

const isAdmin = (user: GoTrueUser | null): boolean => !!user?.app_metadata?.roles?.includes('admin');

const serverText = (error: unknown): string => {
  const json = (error as { json?: { msg?: string; error_description?: string; error?: string } })?.json;
  return `${json?.msg ?? ''} ${json?.error_description ?? ''} ${json?.error ?? ''}`.toLowerCase();
};

/**
 * Netlify Identity session for the admin dashboard. The gotrue-js client
 * loads lazily so public visitors never download it; with `setCookie`
 * the Identity service keeps the `nf_jwt` cookie fresh for the
 * edge role rules in netlify.toml.
 */
@Injectable({ providedIn: 'root' })
export class AdminSession {
  readonly user = signal<AdminUser | null>(null);
  readonly ready = signal(false);

  private auth: GoTrueClient | null = null;
  private current: GoTrueUser | null = null;
  private restorePromise: Promise<boolean> | null = null;

  constructor(private readonly router: Router) {}

  /** Restore a saved session; resolves true for admin users. Offline-safe. */
  restore(): Promise<boolean> {
    if (!this.restorePromise) this.restorePromise = this.doRestore();
    return this.restorePromise;
  }

  async login(email: string, password: string): Promise<void> {
    const auth = await this.client();
    try {
      this.current = await auth.login(email, password, true);
    } catch (error) {
      throw new Error(this.loginMessage(error));
    }
    if (!isAdmin(this.current)) {
      await this.signOut(false);
      throw new Error(FORBIDDEN);
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
    this.restorePromise = Promise.resolve(false);
    if (navigate) await this.router.navigate(['/admin/acceso']);
  }

  /** Fresh JWT for admin API calls; clears the session when unrefreshable. */
  async jwt(): Promise<string> {
    if (!this.current) throw new Error('NO_SESSION');
    try {
      return await this.current.jwt();
    } catch {
      await this.signOut(false);
      throw new Error('SESSION_EXPIRED');
    }
  }

  async requestRecovery(email: string): Promise<void> {
    const auth = await this.client();
    try {
      await auth.requestPasswordRecovery(email);
    } catch (error) {
      throw new Error(this.tokenMessage(error));
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
      throw new Error(this.tokenMessage(error));
    }
  }

  async acceptInvite(token: string, password: string): Promise<void> {
    try {
      const auth = await this.client();
      this.current = await auth.acceptInvite(token, password, true);
      this.afterAuth();
    } catch (error) {
      throw new Error(this.tokenMessage(error));
    }
  }

  async confirmEmail(token: string, type: 'signup' | 'email_change' = 'signup'): Promise<void> {
    try {
      const auth = await this.client();
      this.current = type === 'signup' ? await auth.confirm(token, true) : await auth.verify(type, token, true);
      this.afterAuth();
    } catch (error) {
      throw new Error(this.tokenMessage(error));
    }
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
      this.current = (await this.client()).currentUser();
    } catch {
      this.current = null;
    }
    this.user.set(this.current ? this.toAdminUser(this.current) : null);
    this.ready.set(true);
    return isAdmin(this.current);
  }

  private afterAuth(): void {
    this.restorePromise = Promise.resolve(isAdmin(this.current));
    this.user.set(this.current ? this.toAdminUser(this.current) : null);
    this.ready.set(true);
  }

  private toAdminUser(user: GoTrueUser): AdminUser {
    const fullName = user.user_metadata?.['full_name'];
    const name = typeof fullName === 'string' && fullName.trim() !== '' ? fullName.trim() : user.email.split('@')[0] || user.email;
    return { name, email: user.email };
  }

  private loginMessage(error: unknown): string {
    if (error instanceof TypeError) return UNREACHABLE;
    const text = serverText(error);
    if (text.includes('confirm')) return UNCONFIRMED;
    const status = (error as { status?: number })?.status;
    if (status === 400 || status === 401 || status === 422 || /invalid|incorrect|credential|password|not found|no user/i.test(text)) {
      return LOGIN_FAILED;
    }
    return UNREACHABLE;
  }

  private tokenMessage(error: unknown): string {
    if (error instanceof TypeError) return UNREACHABLE;
    const status = (error as { status?: number })?.status;
    if (status === 400 || status === 401 || status === 404 || status === 422) return LINK_EXPIRED;
    return UNREACHABLE;
  }
}
