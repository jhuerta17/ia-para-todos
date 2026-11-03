import { Injectable, inject, signal } from '@angular/core';
import { UserSession } from '../session/user-session';

export interface PortalMessage { role: 'user' | 'assistant'; content: string; demo: boolean }
export interface PortalChat { id: string; title: string; createdAt: string; expiresAt: string; messages?: PortalMessage[] }
export class PortalError extends Error {
  readonly status: number;
  constructor(reason: string, status: number) { super(reason); this.status = status; }
}
@Injectable({ providedIn: 'root' })
export class PortalClient {
  private readonly session = inject(UserSession);
  readonly consented = signal<boolean | null>(null);
  readonly privacyVersion = signal('2026-11-03');
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const token = await this.session.jwt();
    const response = await fetch(`/api/portal/${path}`, {
      method, headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ reason: 'portal_unavailable' }));
      if (response.status === 428) this.consented.set(false);
      if (response.status === 401) await this.session.signOut();
      throw new PortalError(error.reason ?? 'portal_unavailable', response.status);
    }
    return response.json() as Promise<T>;
  }
  async profile(): Promise<void> {
    const userId = this.session.user()?.id;
    const profile = await this.request<{ consented: boolean; privacyVersion: string }>('profile');
    if (this.session.user()?.id !== userId) return;
    this.privacyVersion.set(profile.privacyVersion);
    this.consented.set(profile.consented);
  }
  async consent(): Promise<void> {
    await this.request('profile', 'POST', { adult: true, privacyVersion: this.privacyVersion() });
    this.consented.set(true);
  }
}
