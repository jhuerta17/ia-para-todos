import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminSession } from '../session/admin-session';

interface Usage { configured: boolean; enabled: boolean; hardBudget: false }
@Component({
  selector: 'app-ai-usage',
  template: `
  <section class="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-800 dark:border-gray-800 dark:bg-white/3 dark:text-white/90" aria-label="AI usage and safety">
    <h2 class="text-lg font-semibold">AI practice</h2>
    @if (usage(); as u) {
      <p class="mt-2" role="status">{{ u.enabled && u.configured ? 'Live AI enabled' : 'Sample practice — live AI off' }}</p>
      <p class="mt-2">Basic limits: 20 requests per minute, 100 per day per IP, and 3 simultaneous requests per server instance.</p>
      <p>These limits can reset or vary across instances. No daily or monthly dollar cap is enforced.</p>
      @if (!u.configured) { <p class="mt-2">Add a production Meta API key before enabling live AI.</p> }
      <div class="mt-3 flex flex-wrap gap-3">
        <button class="rounded-lg border px-4 py-2" [disabled]="busy()" (click)="change('pause')">Turn live AI off</button>
        <button class="rounded-lg border px-4 py-2" [disabled]="busy() || !u.configured" (click)="change('enable')">Turn live AI on</button>
        <button class="rounded-lg border px-4 py-2" [disabled]="busy()" (click)="load()">Refresh status</button>
      </div>
    } @else {
      <p class="mt-2">AI controls are unavailable. Practice defaults to sample replies.</p>
      <button class="mt-3 rounded-lg border px-4 py-2" [disabled]="busy()" (click)="load()">Retry</button>
    }
    @if (error()) { <p class="mt-3" role="alert">{{ error() }}</p> }
  </section>`,
})
export class AiUsage {
  private readonly session = inject(AdminSession);
  protected readonly usage = signal<Usage | null>(null);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  constructor() { if (isPlatformBrowser(inject(PLATFORM_ID))) void this.load(); }
  protected async load(): Promise<void> { await this.request(); }
  protected async change(action: 'pause' | 'enable'): Promise<void> { await this.request({ action }); }
  private async request(body?: Record<string, unknown>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true); this.error.set('');
    try {
      const response = await fetch('/.netlify/functions/ai-control', {
        method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${await this.session.jwt()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!response.ok) throw new Error();
      this.usage.set(await response.json());
    } catch { this.usage.set(null); this.error.set('Could not reach AI controls. Try again; practice will use samples if the switch cannot be read.'); }
    finally { this.busy.set(false); }
  }
}
