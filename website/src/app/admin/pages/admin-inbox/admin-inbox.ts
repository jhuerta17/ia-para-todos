import { isPlatformServer } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminBreadcrumb } from '../../layout/admin-breadcrumb/admin-breadcrumb';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { FORM_BADGE_COLORS, FORM_LABELS, SubmissionForm } from '../../data/submissions';
import { SubmissionsService } from '../../data/submissions.service';
import { TABLE_IMPORTS } from '../../shared/ui/table/table.directive';

type Filter = SubmissionForm | 'all';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todas' },
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
  protected readonly filter = signal<Filter>('all');
  protected readonly filters = FILTERS;

  constructor() {
    // Prerendering keeps the skeleton; the browser loads real data.
    if (!isPlatformServer(inject(PLATFORM_ID))) void this.data.load();
  }

  protected retry(): void {
    void this.data.retry();
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
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected excerpt(message: string | null): string {
    if (!message) return '—';
    return message.length > 120 ? `${message.slice(0, 120)}…` : message;
  }
}
