import type { Config, Context } from '@netlify/functions';
import * as s from '../lib/ai-security.mts';

export function createSessionHandler(db: s.Redis = s.redis, fetcher: typeof fetch = (...args) => fetch(...args)) {
  return async (req: Request, context: Context): Promise<Response> => {
    try {
      if (!['GET', 'POST'].includes(req.method)) return s.json({ reason: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
      if (req.method === 'POST' && !s.allowedOrigin(req)) throw new s.HttpError(403, 'origin_not_allowed');
      if (!s.liveConfigured(context)) return s.json({ live: false, reason: 'unavailable' });
      const enabled = await db(['HMGET', s.PREFIX + 'control', 'schema', 'enabled']);
      if (!Array.isArray(enabled) || enabled[0] !== '1' || enabled[1] !== '1') return s.json({ live: false, reason: 'unavailable' });
      const ip = s.ipHash(context);
      const existing = s.sessionId(req);
      if (req.method === 'GET') {
        const verified = existing && await db(['GET', s.PREFIX + 'session:' + existing]) === ip;
        return s.json({ live: true, verified: !!verified, siteKey: s.env('TURNSTILE_SITE_KEY') });
      }
      const body = await s.readJSON(req);
      if (Object.keys(body).some(k => !['token', 'acknowledged'].includes(k)) || body['acknowledged'] !== true
        || typeof body['token'] !== 'string' || !body['token'] || body['token'].length > 2048) throw new s.HttpError(400, 'verification_required');
      // Count attempts before external verification, including failed/replayed challenges.
      if (await s.evalScript(db, s.ISSUE, [s.PREFIX + 'control', s.PREFIX + 'issuance:' + ip], [Date.now(), s.requestId()]) !== 1)
        return s.json({ reason: 'cooldown' }, 429, { 'Retry-After': '3600' });
      const result = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: s.env('TURNSTILE_SECRET_KEY'), response: body['token'], remoteip: context.ip }),
        signal: AbortSignal.timeout(5000), redirect: 'error',
      });
      if (!result.ok) throw new s.HttpError(403, 'verification_failed');
      const verification = await result.json() as { success?: boolean; hostname?: string; action?: string; challenge_ts?: string };
      const origin = new URL(req.headers.get('origin')!);
      const age = Date.now() - Date.parse(verification.challenge_ts ?? '');
      if (verification.success !== true || verification.hostname !== origin.hostname || verification.action !== 'ai_trial'
        || !Number.isFinite(age) || age < -10000 || age > 300000) throw new s.HttpError(403, 'verification_failed');
      const replayHash = (await import('node:crypto')).createHash('sha256').update(body['token']).digest('hex');
      if (await db(['SET', s.PREFIX + 'challenge:' + replayHash, 'used', 'NX', 'EX', 600]) !== 'OK') throw new s.HttpError(403, 'verification_failed');
      const sid = s.randomSession();
      if (await db(['SET', s.PREFIX + 'session:' + sid, ip, 'NX', 'EX', 86400]) !== 'OK') throw new Error();
      s.audit(context, { reason: 'session_issued' });
      return s.json({ live: true, verified: true }, 200,
        { 'Set-Cookie': `${s.COOKIE}=${sid}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=86400` });
    } catch (error) {
      if (error instanceof s.HttpError) { s.audit(context, { reason: error.message, status: error.status }); return s.json({ reason: error.message }, error.status); }
      return s.json({ live: false, reason: 'unavailable' }, 503);
    }
  };
}
export default createSessionHandler();
// Keep a plain object initializer: Netlify's static parser ignores named exports wrapped in `satisfies`.
export const config: Config = {
  path: '/api/ai-session',
  rateLimit: { action: 'rate_limit', windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
