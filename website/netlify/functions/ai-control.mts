import type { Context } from '@netlify/functions';
import * as s from '../lib/ai-security.mts';

export function createControlHandler(db: s.Redis = s.redis, getUser = s.adminUser) {
  return async (req: Request, context: Context): Promise<Response> => {
    try {
      if (!['GET', 'POST'].includes(req.method)) return s.json({ reason: 'method_not_allowed' }, 405, { Allow: 'GET, POST' });
      await s.requireAdmin(getUser);
      if (req.method === 'POST' && !s.allowedOrigin(req)) throw new s.HttpError(403, 'origin_not_allowed');
      if (!s.production(context)) return s.json({ reason: 'production_only' }, 403);
      const ledger = s.PREFIX + 'ledger', control = s.PREFIX + 'control';
      const { day, month } = s.periods();
      if (req.method === 'POST') {
        const body = await s.readJSON(req);
        if (body['action'] === 'initialize') {
          const daily = body['dailyUsedNano'], monthly = body['monthlyUsedNano'];
          if (body['confirmedProviderUsage'] !== true || !Number.isSafeInteger(daily) || !Number.isSafeInteger(monthly)
            || (daily as number) < 0 || (monthly as number) < (daily as number) || (monthly as number) > 1_000_000_000_000)
            throw new s.HttpError(400, 'confirmed_usage_required');
          if (await s.evalScript(db, s.INITIALIZE, [ledger, control], [day, month, daily as number, monthly as number]) !== 1)
            throw new s.HttpError(409, 'already_initialized_or_partial_state');
        } else if (body['action'] === 'pause' || body['action'] === 'enable') {
          if (body['action'] === 'enable' && !s.liveConfigured(context)) throw new s.HttpError(409, 'configuration_incomplete');
          if (await s.evalScript(db, s.CONTROL, [ledger, control], [body['action'] === 'enable' ? '1' : '0']) !== 1)
            throw new s.HttpError(409, 'budget_unavailable');
        } else throw new s.HttpError(400, 'invalid_action');
        s.audit(context, { reason: `admin_${body['action']}` });
      }
      const raw = await db(['HGETALL', ledger]);
      const state = await db(['HMGET', control, 'schema', 'enabled']);
      if (!Array.isArray(raw) || raw.length % 2 !== 0 || raw.some(v => typeof v !== 'string')) throw new Error();
      const fields: Record<string, string> = {};
      for (let i = 0; i < raw.length; i += 2) fields[raw[i]] = raw[i + 1];
      const valid = fields['schema'] === '1' && !!fields['day'] && !!fields['month']
        && /^\d+$/.test(fields['day:' + fields['day']] ?? '') && /^\d+$/.test(fields['month:' + fields['month']] ?? '')
        && fields['day'] <= day && fields['month'] <= month && Array.isArray(state) && state[0] === '1';
      const daily = valid ? Number(fields['day'] === day ? fields['day:' + day] : 0) : null;
      const monthly = valid ? Number(fields['month'] === month ? fields['month:' + month] : 0) : null;
      const threshold = (used: number | null, cap: number) => used === null ? 'unavailable' : used >= cap ? 'exhausted' : used >= cap * .8 ? 'warning' : 'ok';
      return s.json({ initialized: valid, configured: s.liveConfigured(context), enabled: valid && state[1] === '1',
        day, month, dailyUsedNano: daily, monthlyUsedNano: monthly, dailyLimitNano: s.DAY_BUDGET, monthlyLimitNano: s.MONTH_BUDGET,
        dailyStatus: threshold(daily, s.DAY_BUDGET), monthlyStatus: threshold(monthly, s.MONTH_BUDGET) });
    } catch (error) {
      if (error instanceof s.HttpError) return s.json({ reason: error.message }, error.status);
      return s.json({ reason: 'budget_unavailable' }, 503);
    }
  };
}
export default createControlHandler();
