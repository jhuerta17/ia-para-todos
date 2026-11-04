import { Icon, IconName } from '../../../shared/icon';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminSidebarService } from '../../core/sidebar.service';
import { BRAND_NAME } from '../../../i18n/lang';
import { BrandMark } from '../../../shared/brand-mark';

type AdminNavItem = { name: string; icon: IconName; path: string; external?: boolean };
type AdminNavSection = { heading: string; items: AdminNavItem[] };

// Adapted from TailAdmin's AppSidebar (see THIRD_PARTY_NOTICES.md):
// same collapsible shell, flat Spanish navigation, site brand,
// upsell widget and demo submenus removed.
@Component({
  selector: 'app-admin-sidebar',
  imports: [Icon, BrandMark, CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
})
export class AdminSidebar {
  protected readonly brand = BRAND_NAME.en;

  readonly sections: AdminNavSection[] = [
    {
      heading: 'Menu',
      items: [
        { name: 'Dashboard', path: '/admin', icon: 'book' },
        { name: 'Requests', path: '/admin/requests', icon: 'mail' },
        { name: 'Workshops', path: '/admin/workshops', icon: 'calendar-event' },
        { name: 'Outreach kit', path: '/admin/outreach', icon: 'sparkles' },
        { name: 'Impact', path: '/admin/impact', icon: 'arrow-up-right' },
        { name: 'Supporters', path: '/admin/supporters', icon: 'users' },
        { name: 'Plans', path: '/admin/plans', icon: 'clipboard-check' },
      ],
    },
    {
      heading: 'Site',
      items: [{ name: 'Back to site', path: '/', external: true, icon: 'arrow-up-right' }],
    },
  ];

  readonly isExpanded$;
  readonly isMobileOpen$;
  readonly isHovered$;

  constructor(
    public sidebar: AdminSidebarService,
    private readonly router: Router,
  ) {
    this.isExpanded$ = this.sidebar.isExpanded$;
    this.isMobileOpen$ = this.sidebar.isMobileOpen$;
    this.isHovered$ = this.sidebar.isHovered$;
  }

  isActive(path: string): boolean {
    return this.router.url.split(/[?#]/)[0] === path;
  }

  onMenuClick(): void {
    this.isMobileOpen$.subscribe((isMobile) => {
      if (isMobile) this.sidebar.setMobileOpen(false);
    }).unsubscribe();
  }

  onSidebarMouseEnter(): void {
    this.isExpanded$.subscribe((expanded) => {
      if (!expanded) this.sidebar.setHovered(true);
    }).unsubscribe();
  }
}
