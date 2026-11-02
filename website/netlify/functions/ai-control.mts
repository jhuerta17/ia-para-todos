import type { Context } from '@netlify/functions';
import * as s from '../lib/ai-security.mts';

export function createControlHandler(control: s.LiveControl = s.liveControl, getUser = s.adminUser) {
  return async (req: Request, context: Context): Promise<Response> => {
    try {
      if (!['GET', 'POST'].includes(req.method)) return s.json({ reason: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
      await s.requireAdmin(getUser);
      if (req.method === 'POST' && !s.allowedOrigin(req)) throw new s.HttpError(403, 'origin_not_allowed');
      if (!s.production(context)) return s.json({ reason: 'production_only' }, 403);
      if (req.method === 'POST') {
        const body = await s.readJSON(req);
        if (Object.keys(body).some(key => key !== 'action') || !['enable', 'pause'].includes(String(body['action']))) throw new s.HttpError(400, 'invalid_action');
        if (body['action'] === 'enable' && !s.liveConfigured(context)) throw new s.HttpError(409, 'api_key_missing');
        await control.write(body['action'] === 'enable');
        s.audit(context, { reason: `admin_${body['action']}` });
      }
      return s.json({ configured: s.liveConfigured(context), enabled: await control.read(), limits: s.LIMITS, hardBudget: false });
    } catch (error) {
      if (error instanceof s.HttpError) return s.json({ reason: error.message }, error.status);
      return s.json({ reason: 'controls_unavailable' }, 503);
    }
  };
}
export default createControlHandler();
