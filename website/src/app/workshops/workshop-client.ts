import { Injectable, inject } from '@angular/core';
import { UserSession } from '../portal/session/user-session';
@Injectable({providedIn:'root'})
export class WorkshopClient {
  readonly session = inject(UserSession);
  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const token = this.session.user() ? await this.session.jwt() : null;
    const response = await fetch(`/api/workshops/${path}`, {method,
      headers:{...(token ? {Authorization:`Bearer ${token}`} : {}),...(body === undefined ? {} : {'Content-Type':'application/json'})},
      ...(body === undefined ? {} : {body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
    if (!response.ok) { const b=await response.json().catch(()=>({reason:'workshops_unavailable'})); throw new Error(b.reason); }
    return response.json();
  }
}
export function bookingToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join('');
}
