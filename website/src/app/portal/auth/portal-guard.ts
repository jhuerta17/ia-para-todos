import { portalReturn } from './portal-return';
import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { UserSession } from '../session/user-session';

const checkPortal = (portalAuth: boolean, returnParam: string | undefined, url: string, fragment: string | null) => {
  const session = inject(UserSession);
  const router = inject(Router);
  // Email links may replace an existing session; let the access page consume them.
  if (portalAuth && /(?:^|&)(?:recovery|confirmation|email_change|invite)_token=/.test(fragment ?? '')) return true;
  if (portalAuth) {
    return session.restore().then((signedIn) => {
      if (!signedIn) return true;
      const target = typeof returnParam === 'string' ? returnParam : '/portal';
      return router.createUrlTree([portalReturn(target)]);
    });
  }
  return session.restore().then((signedIn) => {
    if (signedIn) return true;
    const queryParams: Record<string, string> = {};
    const clean = url.split(/[?#]/)[0];
    if (clean !== '/portal') queryParams['return'] = clean;
    return router.createUrlTree(['/portal/sign-in'], { queryParams });
  });
};

/**
 * Portal gate (see checkPortal). Prerendering always passes (the shell
 * holds no data); in the browser any Identity user continues, while
 * logged-out visitors go to sign-in. Reads the leaf route: the guard
 * sits on the parent, so its own snapshot never carries the child flags.
 */
export const portalGuard: CanActivateFn = (route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  let leaf = route;
  while (leaf.firstChild) leaf = leaf.firstChild;
  return checkPortal(leaf.data['portalAuth'] === true, leaf.queryParams['return'], state.url, leaf.fragment);
};

export const portalGuardChild: CanActivateChildFn = (route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  let leaf = route;
  while (leaf.firstChild) leaf = leaf.firstChild;
  return checkPortal(leaf.data['portalAuth'] === true, leaf.queryParams['return'], state.url, leaf.fragment);
};
