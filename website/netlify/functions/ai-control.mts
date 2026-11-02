import type { Context } from '@netlify/functions';
import * as s from '../lib/ai-security.mts';

export function createControlHandler(control: s.LiveControl = s.liveControl, getUser = s.adminUser, fetcher: typeof fetch = (...args) => fetch(...args)) {
  return async (req: Request, context: Context): Promise<Response> => {
    try {
      if (!['GET', 'POST'].includes(req.method)) return s.json({ reason: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
      await s.requireAdmin(getUser);
      if (req.method === 'POST' && !s.allowedOrigin(req)) throw new s.HttpError(403, 'origin_not_allowed');
      if (!s.production(context)) return s.json({ reason: 'production_only' }, 403);
      let connection: string | undefined;
      let diagnostics: Record<string, unknown> | undefined;
      if (req.method === 'POST') {
        const body = await s.readJSON(req);
        if (Object.keys(body).some(key => key !== 'action') || !['enable', 'pause', 'check'].includes(String(body['action']))) throw new s.HttpError(400, 'invalid_action');
        if (body['action'] === 'enable' && !s.liveConfigured(context)) throw new s.HttpError(409, 'api_key_missing');
        if (body['action'] === 'check') {
          diagnostics = { checkedAt: new Date().toISOString(), requestId: context.requestId ?? null,
            endpoint: 'https://api.meta.ai/v1/models', models: s.MODELS, keyConfigured: s.liveConfigured(context) };

          if (!s.liveConfigured(context)) connection = 'key_missing';
          else {
            try {
              const response = await fetcher('https://api.meta.ai/v1/models', {
                headers: { Authorization: `Bearer ${s.env('META_MUSE_API_KEY').trim()}` },
                signal: AbortSignal.timeout(8000), redirect: 'error',
              });
              diagnostics['httpStatus'] = response.status;
              let payload: { data?: { id?: string }[]; error?: { code?: unknown; type?: unknown; param?: unknown; message?: unknown } } = {};
              try { payload = await response.json(); } catch { diagnostics['responseFormat'] = 'non_json'; }
              if (!response.ok && payload.error) {
                const safe = (value: unknown): string | null => typeof value === 'string'
                  ? value.split(s.env('META_MUSE_API_KEY').trim()).join('[redacted]').slice(0, 500) : null;
                diagnostics['providerError'] = { code: safe(payload.error.code), type: safe(payload.error.type),
                  param: safe(payload.error.param), message: safe(payload.error.message) };
              }
              if (response.status === 401 || response.status === 403) connection = 'authentication_failed';
              else if (!response.ok) connection = 'unavailable';
              else {
                const models = Array.isArray(payload.data) ? payload.data.map(model => model?.id) : [];
                diagnostics['availableModels'] = models.filter(model => typeof model === 'string').slice(0, 100);
                connection = Object.values(s.MODELS).every(model => models.includes(model)) ? 'ok' : 'model_unavailable';
              }
            } catch (error) { connection = 'unavailable'; diagnostics['networkError'] = error instanceof DOMException ? error.name : 'request_failed'; }
          }
        } else await control.write(body['action'] === 'enable');
        s.audit(context, { reason: `admin_${body['action']}` });
      }
      return s.json({ configured: s.liveConfigured(context), enabled: await control.read(), limits: s.LIMITS, hardBudget: false, connection, diagnostics });
    } catch (error) {
      if (error instanceof s.HttpError) return s.json({ reason: error.message }, error.status);
      return s.json({ reason: 'controls_unavailable' }, 503);
    }
  };
}
export default createControlHandler();
