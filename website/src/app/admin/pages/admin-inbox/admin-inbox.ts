import { isPlatformServer } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminBreadcrumb } from '../../layout/admin-breadcrumb/admin-breadcrumb';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DemoState } from '../../data/demo-state';
import { FORM_BADGE_COLORS, FORM_LABELS, Submission, SubmissionForm } from '../../data/submissions';
import { SubmissionsService } from '../../data/submissions.service';
import { TABLE_IMPORTS } from '../../shared/ui/table/table.directive';

interface Draft {
  status: 'loading' | 'ready' | 'error';
  text?: string;
  demo?: boolean;
}

type Filter = SubmissionForm | 'all';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'participate', label: FORM_LABELS.participate },
  { id: 'collaborate', label: FORM_LABELS.collaborate },
  { id: 'newsletter', label: FORM_LABELS.newsletter },
];

// Full submissions inbox: per-form filters plus the message table.
// Step 4 feeds `submissions` from the submissions service.
@Component({
  selector: 'app-admin-inbox',
  imports: [AdminBreadcrumb, BadgeComponent, ...TABLE_IMPORTS],
  templateUrl: './admin-inbox.html',
})
export class AdminInbox {
  protected readonly submissions = inject(SubmissionsService).rows;
  protected readonly loadError = inject(SubmissionsService).error;
  protected readonly truncated = inject(SubmissionsService).truncated;
  private readonly data = inject(SubmissionsService);
  private readonly demo = inject(DemoState);
  protected readonly filter = signal<Filter>('all');
  protected readonly filters = FILTERS;
  protected readonly drafts = signal<Record<string, Draft>>({});
  protected readonly copied = signal<string | null>(null);

  constructor() {
    // Prerendering keeps the skeleton; the browser loads real data.
    if (!isPlatformServer(inject(PLATFORM_ID))) void this.data.load();
  }

  protected retry(): void {
    void this.data.retry();
  }

  protected previewDemo(): void {
    this.demo.enable();
  }

  protected readonly visible = computed(() => {
    const rows = this.submissions() ?? [];
    const active = this.filter();
    return active === 'all' ? rows : rows.filter((row) => row.form === active);
  });

  protected countFor(id: Filter): number | null {
    const rows = this.submissions();
    if (!rows) return null;
    return id === 'all' ? rows.length : rows.filter((row) => row.form === id).length;
  }

  protected formLabel(form: SubmissionForm): string {
    return FORM_LABELS[form];
  }

  protected badgeColor(form: SubmissionForm): 'primary' | 'info' | 'success' {
    return FORM_BADGE_COLORS[form];
  }

  protected fullDate(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected excerpt(message: string | null): string {
    if (!message) return '—';
    return message.length > 120 ? `${message.slice(0, 120)}…` : message;
  }

  protected draftFor(id: string): Draft | null {
    return this.drafts()[id] ?? null;
  }

  protected async draftReply(row: Submission): Promise<void> {
    const current = this.drafts()[row.id];
    if (current?.status === 'loading') return;
    this.drafts.set({ ...this.drafts(), [row.id]: { status: 'loading' } });
    try {
      const summary = `${this.formLabel(row.form)}${row.interest ? ` (${row.interest})` : ''}: ${row.message ?? '(no message)'}`;
      const response = await fetch('/.netlify/functions/ai-assist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          task: 'triage',
          lang: row.language === 'en' ? 'en' : 'es',
          history: [],
          input: summary.slice(0, 500),
        }),
      });
      if (!response.ok) throw new Error(`triage ${response.status}`);
      const payload = (await response.json()) as { reply?: unknown; demo?: unknown };
      if (typeof payload.reply !== 'string' || payload.reply.trim() === '') throw new Error('triage empty reply');
      this.drafts.set({ ...this.drafts(), [row.id]: { status: 'ready', text: payload.reply, demo: payload.demo === true } });
    } catch {
      this.drafts.set({ ...this.drafts(), [row.id]: { status: 'error' } });
    }
  }

  protected closeDraft(id: string): void {
    const next = { ...this.drafts() };
    delete next[id];
    this.drafts.set(next);
  }

  protected async copyDraft(id: string): Promise<void> {
    const text = this.drafts()[id]?.text;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this.copied.set(id);
      window.setTimeout(() => {
        if (this.copied() === id) this.copied.set(null);
      }, 2000);
    } catch {
      // Clipboard unavailable: the draft stays visible for manual copy.
    }
  }
}
