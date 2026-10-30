import { isPlatformServer } from '@angular/common';
import { inject, Injectable, effect, PLATFORM_ID, signal, untracked } from '@angular/core';
import { AdminSession } from '../session/admin-session';
import { generateDemoSubmissions } from './demo-generator';
import { DemoState } from './demo-state';
import { Submission, SubmissionForm } from './submissions';

const ENDPOINT = '/.netlify/functions/submissions';
const KNOWN_FORMS: readonly string[] = ['participate', 'collaborate', 'newsletter'];

const isRow = (value: unknown): value is Submission => {
  if (typeof value !== 'object' || value === null) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row['id'] === 'string' &&
    typeof row['form'] === 'string' &&
    KNOWN_FORMS.includes(row['form']) &&
    typeof row['createdAt'] === 'string'
  );
};

/**
 * Submissions inbox data. Loads once per session from the admin-only
 * Function; an expired or revoked session bounces back to sign-in.
 */
@Injectable({ providedIn: 'root' })
export class SubmissionsService {
  readonly rows = signal<Submission[] | null>(null);
  readonly truncated = signal(false);
  readonly error = signal<string | null>(null);

  private flight: Promise<void> | null = null;

  constructor(
    private readonly session: AdminSession,
    private readonly demo: DemoState,
  ) {
    const platform = inject(PLATFORM_ID);
    effect(() => {
      if (!this.session.user()) {
        this.rows.set(null);
        this.truncated.set(false);
        this.error.set(null);
      }
    });
    effect(() => {
      if (this.demo.enabled()) {
        this.rows.set(generateDemoSubmissions(Date.now()));
        this.truncated.set(false);
        this.error.set(null);
      } else if (!isPlatformServer(platform)) {
        this.rows.set(null);
        untracked(() => void this.load());
      }
    });
  }

  load(): Promise<void> {
    if (this.rows() !== null) return Promise.resolve();
    if (this.demo.enabled()) {
      this.rows.set(generateDemoSubmissions(Date.now()));
      return Promise.resolve();
    }
    if (!this.flight) this.flight = this.doLoad().finally(() => (this.flight = null));
    return this.flight;
  }

  retry(): Promise<void> {
    this.error.set(null);
    return this.load();
  }

  private async doLoad(): Promise<void> {
    let token: string;
    try {
      token = await this.session.jwt();
    } catch {
      await this.session.signOut();
      return;
    }
    let response: Response;
    try {
      response = await fetch(ENDPOINT, { headers: { Authorization: `Bearer ${token}` } });
    } catch {
      this.error.set('Could not reach the server. Try again.');
      return;
    }
    if (response.status === 401 || response.status === 403) {
      await this.session.signOut();
      return;
    }
    if (!response.ok) {
      this.error.set('Could not load the requests. Try again.');
      return;
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      this.error.set('The server returned an invalid response. Try again.');
      return;
    }
    const list = (payload as { submissions?: unknown })?.submissions;
    if (!Array.isArray(list)) {
      this.error.set('The server returned an invalid response. Try again.');
      return;
    }
    const rows = list.filter(isRow).map((row) => ({
      ...row,
      name: typeof row.name === 'string' ? row.name : null,
      email: typeof row.email === 'string' ? row.email : null,
      phone: typeof row.phone === 'string' ? row.phone : null,
      interest: typeof row.interest === 'string' ? row.interest : null,
      message: typeof row.message === 'string' ? row.message : null,
      language: typeof row.language === 'string' ? row.language : null,
      form: row.form as SubmissionForm,
    }));
    rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    this.truncated.set((payload as { truncated?: unknown })?.truncated === true);
    this.rows.set(rows);
  }
}
