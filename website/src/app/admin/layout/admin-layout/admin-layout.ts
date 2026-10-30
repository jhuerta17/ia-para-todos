import { CommonModule, DOCUMENT } from '@angular/common';
import { afterNextRender, Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminSidebarService } from '../../core/sidebar.service';
import { AdminBackdrop } from '../admin-backdrop/admin-backdrop';
import { AdminHeader } from '../admin-header/admin-header';
import { AdminSidebar } from '../admin-sidebar/admin-sidebar';

// Adapted from TailAdmin's AppLayout (see THIRD_PARTY_NOTICES.md):
// same responsive shell, content wrapped in <main> for the app's
// focus management, admin scope class for the vendored base styles.
@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterModule, AdminHeader, AdminSidebar, AdminBackdrop],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  readonly isExpanded$;
  readonly isHovered$;
  readonly isMobileOpen$;

  constructor(
    public sidebar: AdminSidebarService,
    private readonly router: Router,
  ) {
    this.isExpanded$ = this.sidebar.isExpanded$;
    this.isHovered$ = this.sidebar.isHovered$;
    this.isMobileOpen$ = this.sidebar.isMobileOpen$;
    const document = inject(DOCUMENT);
    // Admin Tailwind is a lazily loaded side-built asset (see
    // build:admin-css), so public visitors never download it.
    afterNextRender(() => {
      if (document.getElementById('admin-theme')) return;
      const link = document.createElement('link');
      link.id = 'admin-theme';
      link.rel = 'stylesheet';
      link.href = '/admin-theme.css';
      document.head.appendChild(link);
    });
  }

  /** Bare pages (sign-in) render without the sidebar/header shell. */
  protected isBare(): boolean {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route.data['bare'] === true;
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 1280) {
      this.sidebar.setMobileOpen(false);
    }
  }
}
