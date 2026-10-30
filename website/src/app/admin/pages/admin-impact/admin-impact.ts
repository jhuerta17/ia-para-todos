import { isPlatformServer } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminBreadcrumb } from '../../layout/admin-breadcrumb/admin-breadcrumb';
import { DemoState } from '../../data/demo-state';
import { DemoImpactMonth, demoImpactMonths, demoWorkshops } from '../../data/demo-content';
import { TABLE_IMPORTS } from '../../shared/ui/table/table.directive';

// Impact report. Demo mode shows synthetic outcomes; without a
// connected store the live view is an honest empty state.
@Component({
  selector: 'app-admin-impact',
  imports: [AdminBreadcrumb, ...TABLE_IMPORTS],
  templateUrl: './admin-impact.html',
})
export class AdminImpact {
  protected readonly demo = inject(DemoState).enabled;
  protected readonly ready = signal(false);
  private readonly demoState = inject(DemoState);
  private readonly now = Date.now();

  protected readonly months = computed<DemoImpactMonth[]>(() => demoImpactMonths(demoWorkshops(this.now), this.now));

  protected readonly summary = computed(() => {
    const months = this.months();
    const attendees = months.reduce((sum, month) => sum + month.attendees, 0);
    const completed = demoWorkshops(this.now).filter((workshop) => Date.parse(workshop.startsAt) <= this.now).length;
    const satisfaction = Math.round(months.reduce((sum, month) => sum + month.satisfaction, 0) / Math.max(1, months.length));
    return { attendees, completed, volunteers: months[months.length - 1]?.volunteers ?? 0, satisfaction };
  });

  protected readonly maxAttendees = computed(() => Math.max(1, ...this.months().map((month) => month.attendees)));

  constructor() {
    if (!isPlatformServer(inject(PLATFORM_ID))) this.ready.set(true);
  }

  protected previewDemo(): void {
    this.demoState.enable();
  }

  protected barPct(attendees: number): number {
    return Math.round((attendees / this.maxAttendees()) * 100);
  }
}
