import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AdminSession } from '../session/admin-session';

const checkAdmin = (adminLogin: boolean, returnParam: string | undefined, url: string) => {
  const session = inject(AdminSession);
  const router = inject(Router);
  if (adminLogin) {
    return session.restore().then((admin) => {
      if (!admin) return true;
      const target = typeof returnParam === 'string' ? returnParam : '/admin';
      return router.createUrlTree([target.startsWith('/admin') ? target : '/admin']);
    });
  }
  return session.restore().then((admin) => {
    if (admin) return true;
    const queryParams: Record<string, string> = {};
    const clean = url.split(/[?#]/)[0];
    if (clean !== '/admin') queryParams['return'] = clean;
    if (session.user()) queryParams['denied'] = '1';
    return router.createUrlTree(['/admin/acceso'], { queryParams });
  });
};

/**
 * Admin gate (see checkAdmin). Prerendering always passes (the shell
 * holds no data); in the browser only Identity users with the `admin`
 * role continue. The edge role rules in netlify.toml enforce the
 * same boundary. Reads the leaf route: the guard sits on the parent,
 * so its own snapshot never carries the child data flags.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  let leaf = route;
  while (leaf.firstChild) leaf = leaf.firstChild;
  return checkAdmin(leaf.data['adminLogin'] === true, leaf.queryParams['return'], state.url);
};

export const adminGuardChild: CanActivateChildFn = (route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) return true;
  let leaf = route;
  while (leaf.firstChild) leaf = leaf.firstChild;
  return checkAdmin(leaf.data['adminLogin'] === true, leaf.queryParams['return'], state.url);
};
