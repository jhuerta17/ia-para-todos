import { isPlatformServer } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminBreadcrumb } from '../../layout/admin-breadcrumb/admin-breadcrumb';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DemoState } from '../../data/demo-state';
import { DemoSupporter, DemoSupporterType, demoSupporterTotal, demoSupporters } from '../../data/demo-content';
import { TABLE_IMPORTS } from '../../shared/ui/table/table.directive';

const TYPE_BADGES: Record<DemoSupporterType, 'primary' | 'info' | 'success'> = {
  Individual: 'primary',
  Business: 'info',
  Foundation: 'success',
};

const TYPE_ORDER: DemoSupporterType[] = ['Foundation', 'Business', 'Individual'];

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Supporter ledger. Demo mode shows synthetic contributions; without a
// connected store the live view is an honest empty state.
@Component({
  selector: 'app-admin-supporters',
  imports: [AdminBreadcrumb, BadgeComponent, ...TABLE_IMPORTS],
  templateUrl: './admin-supporters.html',
})
export class AdminSupporters {
  protected readonly demo = inject(DemoState).enabled;
  protected readonly ready = signal(false);
  private readonly demoState = inject(DemoState);

  protected readonly supporters = computed<DemoSupporter[]>(() => demoSupporters());
  protected readonly total = computed(() => demoSupporterTotal());

  protected readonly byType = computed(() =>
    TYPE_ORDER.map((type) => {
      const mine = this.supporters().filter((supporter) => supporter.type === type);
      const total = mine.reduce((sum, supporter) => sum + supporter.total, 0);
      return { type, count: mine.length, total, share: Math.round((total / this.total()) * 100) };
    }),
  );

  constructor() {
    if (!isPlatformServer(inject(PLATFORM_ID))) this.ready.set(true);
  }

  protected previewDemo(): void {
    this.demoState.enable();
  }

  protected typeBadge(type: DemoSupporterType): 'primary' | 'info' | 'success' {
    return TYPE_BADGES[type];
  }

  protected formatMoney(amount: number): string {
    return money.format(amount);
  }
}
