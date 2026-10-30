import { isPlatformServer } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { AdminBreadcrumb } from '../../layout/admin-breadcrumb/admin-breadcrumb';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { DemoState } from '../../data/demo-state';
import { DemoWorkshop, demoWorkshops } from '../../data/demo-content';
import { TABLE_IMPORTS } from '../../shared/ui/table/table.directive';

// Workshop schedule. Demo mode shows synthetic sessions; without a
// connected store the live view is an honest empty state.
@Component({
  selector: 'app-admin-workshops',
  imports: [AdminBreadcrumb, BadgeComponent, ...TABLE_IMPORTS],
  templateUrl: './admin-workshops.html',
})
export class AdminWorkshops {
  protected readonly demo = inject(DemoState).enabled;
  protected readonly ready = signal(false);
  private readonly demoState = inject(DemoState);
  private readonly now = Date.now();

  protected readonly workshops = computed<DemoWorkshop[]>(() => demoWorkshops(this.now));

  protected readonly summary = computed(() => {
    const workshops = this.workshops();
    const upcoming = workshops.filter((workshop) => Date.parse(workshop.startsAt) > this.now);
    const rated = workshops.filter((workshop) => workshop.satisfaction !== null);
    return {
      total: workshops.length,
      registered: workshops.reduce((sum, workshop) => sum + workshop.registered, 0),
      upcoming: upcoming.length,
      satisfaction:
        rated.length === 0
          ? null
          : Math.round(rated.reduce((sum, workshop) => sum + (workshop.satisfaction ?? 0), 0) / rated.length),
    };
  });

  constructor() {
    if (!isPlatformServer(inject(PLATFORM_ID))) this.ready.set(true);
  }

  protected previewDemo(): void {
    this.demoState.enable();
  }

  protected isPast(workshop: DemoWorkshop): boolean {
    return Date.parse(workshop.startsAt) <= this.now;
  }

  protected capacityPct(workshop: DemoWorkshop): number {
    return Math.round((workshop.registered / workshop.capacity) * 100);
  }

  protected fullDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? iso
      : date.toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
