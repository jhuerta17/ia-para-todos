import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

/** Shared TailAdmin stylesheet for both app surfaces; safe during SSR. */
export function ensureDashboardTheme(): void {
  const document = inject(DOCUMENT);
  const existing = document.querySelectorAll('link#admin-theme');
  if (existing.length) {
    existing.forEach((link, index) => { if (index > 0) link.remove(); });
    return;
  }
  const link = document.createElement('link');
  link.id = 'admin-theme'; link.rel = 'stylesheet'; link.href = '/admin-theme.css';
  document.head.appendChild(link);
}
