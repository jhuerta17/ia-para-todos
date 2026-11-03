import type { Config } from '@netlify/functions';
import { HttpError, json, readJSON } from '../lib/ai-security.mts';
import { portalPool } from '../lib/portal-db.mts';
import { portalUser } from '../lib/portal-user.mts';
import { WorkshopRepository, bookingInput } from '../lib/workshop-repository.mts';
import type { Student } from '../lib/portal-repository.mts';
export interface WorkshopDependencies { repository: () => WorkshopRepository; user: () => Promise<Student | null> }
export function createWorkshopHandler(deps: WorkshopDependencies = {repository:()=>new WorkshopRepository(portalPool()),user:portalUser}) {
  return async (req: Request): Promise<Response> => {
    try {
      const path = new URL(req.url).pathname.replace(/\/$/,'').replace(/^\/api\/workshops\/?/,'');
      const method = req.method;
      if (!['GET','POST'].includes(method)) throw new HttpError(405,'method_not_allowed');
      if (method !== 'GET' && req.headers.get('origin') !== new URL(req.url).origin) throw new HttpError(403,'origin_not_allowed');
      const repo = deps.repository();
      if (path === 'sessions' && method === 'GET') return json({sessions:await repo.schedule()});
      // Public guests do not need an Identity lookup. Invalid supplied credentials
      // fail closed rather than silently changing an authenticated booking to guest.
      const user = req.headers.has('authorization') ? await deps.user() : null;
      if (req.headers.has('authorization') && (!user || !user.confirmedAt)) throw new HttpError(401,'unauthorized');
      if (path.startsWith('admin/')) {
        if (!user?.roles?.includes('admin')) throw new HttpError(user ? 403 : 401,'unauthorized');
        if (path === 'admin/sessions' && method === 'GET') return json({sessions:await repo.schedule(true)});
        if (path === 'admin/sessions' && method === 'POST') { const b = await readJSON(req); return json(await repo.save(b,typeof b['id'] === 'string' ? b['id'] : undefined)); }
        if (path === 'admin/reservations' && method === 'GET') return json({reservations:await repo.adminReservations(new URL(req.url).searchParams.get('session') ?? '')});
        if (path === 'admin/book' && method === 'POST') return json(await repo.book(bookingInput(await readJSON(req)),user,true),201);
        if (path === 'admin/reservations' && method === 'POST') { const b=await readJSON(req); return json(await repo.adminAction(String(b['id'] ?? ''),String(b['action'] ?? ''))); }
      }
      if (path === 'book' && method === 'POST') return json(await repo.book(bookingInput(await readJSON(req)),user),201);
      if (path === 'manage' && method === 'POST') { const b=await readJSON(req); return json(await repo.manage(String(b['token'] ?? ''),String(b['action'] ?? 'read'),user)); }
      if (path === 'mine' && method === 'GET') { if (!user) throw new HttpError(401,'unauthorized'); return json({reservations:await repo.mine(user)}); }
      if (path === 'mine' && method === 'POST') { if (!user) throw new HttpError(401,'unauthorized'); const b=await readJSON(req); if (b['action'] !== 'cancel') throw new HttpError(400,'invalid_action'); return json(await repo.cancelOwned(user,String(b['id'] ?? ''))); }
      if (path === 'preparation') { if (!user) throw new HttpError(401,'unauthorized'); return json(await repo.preparation(user,method==='POST')); }
      throw new HttpError(404,'not_found');
    } catch (error) {
      const conflict = (error as {code?: string}).code === '23505';
      return json({reason:error instanceof HttpError ? error.message : conflict ? 'booking_conflict' : 'workshops_unavailable'},error instanceof HttpError ? error.status : conflict ? 409 : 503);
    }
  };
}
export default createWorkshopHandler();
export const config: Config = {path:'/api/workshops/*',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain'],action:'rate_limit'}};
