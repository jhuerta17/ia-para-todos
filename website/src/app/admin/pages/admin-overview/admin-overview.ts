import { isPlatformServer } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminBreadcrumb } from '../../layout/admin-breadcrumb/admin-breadcrumb';
import { AdminSafeHtmlPipe } from '../../shared/safe-html.pipe';
import { ADMIN_ICONS } from '../../shared/icons';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { FORM_BADGE_COLORS, FORM_LABELS, SubmissionForm } from '../../data/submissions';
import { SubmissionsService } from '../../data/submissions.service';
import { TABLE_IMPORTS } from '../../shared/ui/table/table.directive';

interface StatCard {
  form: SubmissionForm;
  label: string;
  icon: string;
  total: number;
  recent: number;
}

// Panel overview: stat cards plus the latest submissions.
// Cards follow TailAdmin's metrics/recent-orders patterns (see
// THIRD_PARTY_NOTICES.md); data arrives from the submissions service.
@Component({
  selector: 'app-admin-overview',
  imports: [RouterModule, AdminBreadcrumb, AdminSafeHtmlPipe, BadgeComponent, ...TABLE_IMPORTS],
  templateUrl: './admin-overview.html',
})
export class AdminOverview {
  protected readonly submissions = inject(SubmissionsService).rows;
  protected readonly loadError = inject(SubmissionsService).error;
  private readonly data = inject(SubmissionsService);

  constructor() {
    // Prerendering keeps the skeleton; the browser loads real data.
    if (!isPlatformServer(inject(PLATFORM_ID))) void this.data.load();
  }

  protected retry(): void {
    void this.data.retry();
  }

  protected readonly stats = computed<StatCard[] | null>(() => {
    const rows = this.submissions();
    if (!rows) return null;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const cards: { form: SubmissionForm; icon: string }[] = [
      { form: 'participate', icon: ADMIN_ICONS.group },
      { form: 'collaborate', icon: ADMIN_ICONS.box },
      { form: 'newsletter', icon: ADMIN_ICONS.envelope },
    ];
    return cards.map(({ form, icon }) => {
      const mine = rows.filter((row) => row.form === form);
      return {
        form,
        icon,
        label: FORM_LABELS[form],
        total: mine.length,
        recent: mine.filter((row) => Date.parse(row.createdAt) >= weekAgo).length,
      };
    });
  });

  protected readonly latest = computed(() => (this.submissions() ?? []).slice(0, 5));

  protected formLabel(form: SubmissionForm): string {
    return FORM_LABELS[form];
  }

  protected badgeColor(form: SubmissionForm): 'primary' | 'info' | 'success' {
    return FORM_BADGE_COLORS[form];
  }

  protected shortDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }
}
