import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSidebarService } from '../../core/sidebar.service';

// Vendored from TailAdmin (see THIRD_PARTY_NOTICES.md).
@Component({
  selector: 'app-admin-backdrop',
  imports: [CommonModule],
  templateUrl: './admin-backdrop.html',
})
export class AdminBackdrop {
  readonly isMobileOpen$;

  constructor(private readonly sidebar: AdminSidebarService) {
    this.isMobileOpen$ = this.sidebar.isMobileOpen$;
  }

  closeSidebar(): void {
    this.sidebar.setMobileOpen(false);
  }
}
