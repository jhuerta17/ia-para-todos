import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminSession } from '../session/admin-session';

interface Usage {
  initialized: boolean; configured: boolean; enabled: boolean;
  dailyUsedNano: number | null; monthlyUsedNano: number | null;
  dailyStatus: string; monthlyStatus: string;
}
@Component({
  selector: 'app-ai-usage',
  template: `
  <section class="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-800 dark:border-gray-800 dark:bg-white/3 dark:text-white/90" aria-label="AI usage and safety">
    <h2 class="text-lg font-semibold">AI trial safety</h2>
    @if (usage(); as u) {
      <p class="mt-2">{{ u.enabled && u.configured ? 'Live AI enabled' : 'Sample practice — live AI paused' }}</p>
      <p>Today: {{ dollars(u.dailyUsedNano) }} / $1 · {{ u.dailyStatus }}. This month: {{ dollars(u.monthlyUsedNano) }} / $10 · {{ u.monthlyStatus }}.</p>
      <p class="mt-2">Includes reserved requests. Resets at midnight in America/Chicago. Hosting costs are separate.</p>
      @if (!u.initialized) {
        <p class="mt-2">Confirm this website’s existing Meta spending before initializing. Never reset an existing ledger to regain allowance.</p>
        <label class="mt-2 block">Today’s existing AI cost ($) <input #daily type="number" min="0" step="0.000001" class="border p-2" /></label>
        <label class="mt-2 block">This month’s existing AI cost ($) <input #monthly type="number" min="0" step="0.000001" class="border p-2" /></label>
        <label class="mt-2 block"><input #confirmed type="checkbox" /> I verified these totals in the dedicated Meta project.</label>
        <button class="mt-3 rounded-lg border px-4 py-2" [disabled]="busy()" (click)="initialize(daily.value, monthly.value, confirmed.checked)">Initialize paused budget</button>
      }
      <div class="mt-3 flex flex-wrap gap-3">
        <button class="rounded-lg border px-4 py-2" [disabled]="busy()" (click)="change('pause')">Pause live AI now</button>
        <button class="rounded-lg border px-4 py-2" [disabled]="busy() || !u.configured || !u.initialized" (click)="change('enable')">Enable protected live AI</button>
        <button class="rounded-lg border px-4 py-2" [disabled]="busy()" (click)="load()">Refresh usage</button>
      </div>
    } @else { <p class="mt-2">Live AI status unavailable. The protected service defaults to samples.</p> }
    @if (error()) { <p class="mt-3" role="alert">{{ error() }}</p> }
  </section>`,
})
export class AiUsage {
  private readonly session = inject(AdminSession);
  protected readonly usage = signal<Usage | null>(null);
  protected readonly error = signal('');
  protected readonly busy = signal(false);
  constructor() { if (isPlatformBrowser(inject(PLATFORM_ID))) void this.load(); }
  protected dollars(n: number | null): string { return n === null ? 'unavailable' : `$${(n / 1e9).toFixed(4)}`; }
  protected async load(): Promise<void> { await this.request(); }
  protected async change(action: 'pause' | 'enable'): Promise<void> { await this.request({ action }); }
  protected async initialize(daily: string, monthly: string, confirmed: boolean): Promise<void> {
    if (!daily.trim() || !monthly.trim() || !confirmed || !Number.isFinite(Number(daily)) || !Number.isFinite(Number(monthly))) {
      this.error.set('Enter both verified spending totals and acknowledge the check.'); return;
    }
    await this.request({ action: 'initialize', dailyUsedNano: Math.round(Number(daily) * 1e9), monthlyUsedNano: Math.round(Number(monthly) * 1e9), confirmedProviderUsage: confirmed });
  }
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
    } catch { this.usage.set(null); this.error.set('Could not verify AI controls. Keep live AI paused and check the setup guide.'); }
    finally { this.busy.set(false); }
  }
}
