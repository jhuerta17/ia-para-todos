import type { Config, Context } from '@netlify/functions';
import * as s from '../lib/ai-security.mts';
export function createStatusHandler(control: s.LiveControl = s.liveControl) {
  return async (req: Request, context: Context): Promise<Response> => {
    if (req.method !== 'GET') return s.json({ reason: 'method_not_allowed' }, 405, { Allow: 'GET' });
    if (!s.liveConfigured(context)) return s.json({ live: false, reason: 'unavailable' });
    try { const live = await control.read(); return s.json({ live, reason: live ? 'ok' : 'paused' }); }
    catch { return s.json({ live: false, reason: 'unavailable' }); }
  };
}
export default createStatusHandler();
export const config: Config = {
  path: '/api/ai-status',
  rateLimit: { action: 'rate_limit', windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
