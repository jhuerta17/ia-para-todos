import { COURSE_CATALOG, type CourseId } from '../../src/app/portal/courses/course-paths.ts';
import type { Config } from '@netlify/functions';
import { HttpError, json, readJSON } from '../lib/ai-security.mts';
import { PortalRepository, PRIVACY_VERSION, type Student } from '../lib/portal-repository.mts';
import { portalPool } from '../lib/portal-db.mts';
import { portalUser } from '../lib/portal-user.mts';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const validUUID = (id: string) => UUID.test(id);
export interface PortalDependencies {
  repository: () => PortalRepository;
  user: () => Promise<Student | null>;
}
export const defaultPortalDependencies: PortalDependencies = {
  repository: () => new PortalRepository(portalPool()),
  user: portalUser,
};
export function createPortalHandler(deps = defaultPortalDependencies) {
  return async (req: Request): Promise<Response> => {
    try {
      const user = await deps.user();
      if (!user) throw new HttpError(401, 'unauthorized');
      if (!['GET','POST','DELETE'].includes(req.method)) throw new HttpError(405, 'method_not_allowed');
      if (req.method !== 'GET' && req.headers.get('origin') !== new URL(req.url).origin) throw new HttpError(403, 'origin_not_allowed');
      const path = new URL(req.url).pathname.replace(/\/$/, '');
      const repo = deps.repository();
      if (path === '/api/portal/profile' && req.method === 'GET') return json(await repo.profile(user));
      if (path === '/api/portal/profile' && req.method === 'POST') {
        const body = await readJSON(req);
        if (body['adult'] !== true || body['privacyVersion'] !== PRIVACY_VERSION || Object.keys(body).some(k => !['adult','privacyVersion'].includes(k))) throw new HttpError(400, 'adult_consent_required');
        return json(await repo.consent(user));
      }
      if (path === '/api/portal/account' && req.method === 'DELETE') return json(await repo.requestDeletion(user), 202);
      if (path === '/api/portal/progress' && req.method === 'GET') return json(await repo.progress(user, 'read', undefined, (new URL(req.url).searchParams.get('courseId') ?? 'first-prompt') as CourseId));
      if (path === '/api/portal/progress' && req.method === 'POST') {
        const body = await readJSON(req);
        if (Object.keys(body).some(k => !['action','lessonId','courseId'].includes(k))) throw new HttpError(400, 'unsupported_field');
        const courseId = (body['courseId'] ?? 'first-prompt') as CourseId;
        if (typeof courseId !== 'string' || !Object.hasOwn(COURSE_CATALOG, courseId)) throw new HttpError(400, 'invalid_course');
        if (body['action'] === 'enroll' && body['lessonId'] === undefined) return json(await repo.progress(user, 'enroll', undefined, courseId));
        if (body['action'] === 'complete' && (COURSE_CATALOG[courseId] as readonly string[]).includes(body['lessonId'] as string)) return json(await repo.progress(user, 'complete', body['lessonId'] as string, courseId));
        throw new HttpError(400, 'invalid_progress');
      }
      if (path === '/api/portal/chats' && req.method === 'GET') return json({ chats: await repo.chats(user) });
      if (path === '/api/portal/chats' && req.method === 'POST') return json(await repo.createChat(user), 201);
      const match = path.match(/^\/api\/portal\/chats\/([^/]+)$/);
      if (match && validUUID(match[1]) && (req.method === 'GET' || req.method === 'DELETE')) return json(await repo.chat(user, match[1], req.method === 'DELETE'));
      throw new HttpError(404, 'not_found');
    } catch (error) { return json({ reason: error instanceof HttpError ? error.message : 'portal_unavailable' }, error instanceof HttpError ? error.status : 503); }
  };
}
export default createPortalHandler();
export const config: Config = { path: ['/api/portal/profile','/api/portal/account','/api/portal/progress','/api/portal/chats','/api/portal/chats/:id'], rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip','domain'], action: 'rate_limit' } };
