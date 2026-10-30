import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminSidebarService } from '../../core/sidebar.service';
import { AdminUserDropdown } from '../admin-user-dropdown/admin-user-dropdown';
import { BrandMark } from '../../../shared/brand-mark';

// Adapted from TailAdmin's AppHeader (see THIRD_PARTY_NOTICES.md):
// sidebar toggle and user menu kept; decorative search, theme toggle,
// and notifications removed (light-only admin, no fake controls).
@Component({
  selector: 'app-admin-header',
  imports: [BrandMark, CommonModule, RouterModule, AdminUserDropdown],
  templateUrl: './admin-header.html',
})
export class AdminHeader {
  isApplicationMenuOpen = false;
  readonly isMobileOpen$;

  constructor(public sidebar: AdminSidebarService) {
    this.isMobileOpen$ = this.sidebar.isMobileOpen$;
  }

  handleToggle(): void {
    if (window.innerWidth >= 1280) {
      this.sidebar.toggleExpanded();
    } else {
      this.sidebar.toggleMobileOpen();
    }
  }

  toggleApplicationMenu(): void {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }
}
