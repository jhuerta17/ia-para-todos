import { isPlatformServer } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminBreadcrumb } from '../../layout/admin-breadcrumb/admin-breadcrumb';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import type { BadgeColor } from '../../shared/ui/badge/badge.component';
import { PLAN_GROUPS, PlanGroup, PlanStatus } from '../../data/plans';
import { PlansState } from '../../data/plans-state';

type PlanFilter = 'all' | PlanStatus;

const STATUS_META: Record<PlanStatus, { label: string; color: BadgeColor; next: string }> = {
  todo: { label: 'Not started', color: 'gray', next: 'Start' },
  doing: { label: 'In progress', color: 'info', next: 'Mark done' },
  done: { label: 'Done', color: 'success', next: 'Reopen' },
};

// Business roadmap tracker: every strategy goal as a checkable plan.
// Progress persists per browser (localStorage); the prerender is a shell.
@Component({
  selector: 'app-admin-plans',
  imports: [AdminBreadcrumb, BadgeComponent],
  templateUrl: './admin-plans.html',
})
export class AdminPlans {
  private readonly state = inject(PlansState);

  protected readonly ready = signal(false);
  protected readonly groups: PlanGroup[] = PLAN_GROUPS;
  protected readonly filter = signal<PlanFilter>('all');
  protected readonly overall = this.state.overall;

  protected readonly visibleGroups = computed(() =>
    this.groups
      .map((group) => ({
        group,
        items: group.items.filter((item) => this.filter() === 'all' || this.state.status(item.id) === this.filter()),
      }))
      .filter(({ items }) => items.length > 0),
  );

  constructor() {
    if (!isPlatformServer(inject(PLATFORM_ID))) this.ready.set(true);
  }

  protected statusOf(id: string): PlanStatus {
    return this.state.status(id);
  }

  protected meta(status: PlanStatus): { label: string; color: BadgeColor; next: string } {
    return STATUS_META[status];
  }

  protected progressOf(groupId: string): { total: number; done: number; pct: number } {
    return this.state.groupProgress(groupId);
  }

  protected advance(id: string): void {
    this.state.advance(id);
  }

  protected setFilter(filter: PlanFilter): void {
    this.filter.set(filter);
  }

  protected resetAll(): void {
    this.state.resetAll();
  }
}
