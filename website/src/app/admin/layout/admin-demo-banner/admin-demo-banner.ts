import { Component, inject } from '@angular/core';
import { DemoState } from '../../data/demo-state';

// Persistent honesty marker for demo mode. Rendered by the admin
// shell whenever synthetic data replaces live data.
@Component({
  selector: 'app-admin-demo-banner',
  templateUrl: './admin-demo-banner.html',
})
export class AdminDemoBanner {
  protected readonly demo = inject(DemoState);
}
