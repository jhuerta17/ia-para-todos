import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminSafeHtmlPipe } from '../../shared/safe-html.pipe';
import { AdminSidebarService } from '../../core/sidebar.service';
import { BRAND_NAME } from '../../../i18n/lang';
import { BrandMark } from '../../../shared/brand-mark';

type AdminNavItem = { name: string; icon: string; path: string; external?: boolean };
type AdminNavSection = { heading: string; items: AdminNavItem[] };

// Adapted from TailAdmin's AppSidebar (see THIRD_PARTY_NOTICES.md):
// same collapsible shell, flat Spanish navigation, site brand,
// upsell widget and demo submenus removed.
@Component({
  selector: 'app-admin-sidebar',
  imports: [BrandMark, CommonModule, RouterModule, AdminSafeHtmlPipe],
  templateUrl: './admin-sidebar.html',
})
export class AdminSidebar {
  protected readonly brand = BRAND_NAME.en;

  readonly sections: AdminNavSection[] = [
    {
      heading: 'Menu',
      items: [
        { name: 'Dashboard', path: '/admin', icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z" fill="currentColor"></path></svg>` },
        { name: 'Requests', path: '/admin/requests', icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Z" stroke="currentColor" stroke-width="1.5"/><path d="m3.5 7 8.5 6 8.5-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
        { name: 'Workshops', path: '/admin/workshops', icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 3.5V6M16 3.5V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5 6.5h14a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.5"/><path d="M4 11h16" stroke="currentColor" stroke-width="1.5"/></svg>` },
        { name: 'Impact', path: '/admin/impact', icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m3 17 6-6 4 4 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
        { name: 'Supporters', path: '/admin/supporters', icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 19.5c.6-3.2 2.8-4.8 5.5-4.8s4.9 1.6 5.5 4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="16.8" cy="9" r="2.6" stroke="currentColor" stroke-width="1.5"/><path d="M16.2 14.9c2.3.2 4 1.7 4.5 4.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>` },
      ],
    },
    {
      heading: 'Site',
      items: [{ name: 'Back to site', path: '/', external: true, icon: `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4h6v6M20 4 11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 14v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>` }],
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
