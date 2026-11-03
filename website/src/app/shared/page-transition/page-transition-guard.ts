import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PageTransition } from './page-transition.service';

/**
 * Holds activation until the wipe panel covers the viewport, so the old
 * page stays mounted under the rising panel and the route swap stays
 * hidden. Wired onto public routes only; admin routes stay instant.
 * The initial navigation never wipes: its guards run before the router
 * marks any navigation complete, regardless of render timing. Same-path
 * navigations (fragments, search and filter query params) skip too.
 * Reduced-motion and server renders resolve at once: the service
 * no-ops there.
 */
export const pageTransitionGuard: CanActivateFn = (_route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  const router = inject(Router);
  if (!router.navigated) return true;
  const current = router.url.split(/[?#]/)[0];
  const target = state.url.split(/[?#]/)[0];
  if (current === target) return true;
  return inject(PageTransition).beginCover().then(() => true);
};
