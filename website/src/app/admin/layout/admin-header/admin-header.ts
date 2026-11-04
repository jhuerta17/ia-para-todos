import { Icon } from '../../../shared/icon';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminSidebarService } from '../../core/sidebar.service';
import { AdminUserDropdown } from '../admin-user-dropdown/admin-user-dropdown';
import { BRAND_NAME } from '../../../i18n/lang';
import { BrandMark } from '../../../shared/brand-mark';

// Adapted from TailAdmin's AppHeader (see THIRD_PARTY_NOTICES.md):
// sidebar toggle and user menu kept; decorative search, theme toggle,
// and notifications removed (light-only admin, no fake controls).
@Component({
  selector: 'app-admin-header',
  imports: [Icon, BrandMark, CommonModule, RouterModule, AdminUserDropdown],
  templateUrl: './admin-header.html',
})
export class AdminHeader {
  private readonly document = inject(DOCUMENT);
  protected readonly brand = BRAND_NAME.en;
  isApplicationMenuOpen = false;
  protected mobileViewport = typeof window !== 'undefined' && window.innerWidth < 1280;

  @HostListener('window:resize')
  protected updateViewport(): void { this.mobileViewport = window.innerWidth < 1280; }
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

  @HostListener('document:keydown.escape')
  protected closeMobileMenus(): void {
    if (window.innerWidth >= 1280) return;
    this.isMobileOpen$.subscribe(open => {
      if (open) {
        this.sidebar.setMobileOpen(false);
        this.document.querySelector<HTMLElement>('button[aria-controls="admin-navigation"]')?.focus();
      }
    }).unsubscribe();
    this.isApplicationMenuOpen = false;
  }

  toggleApplicationMenu(): void {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }
}
