import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import type { Context } from '@netlify/functions';

export const COOKIE = '__Host-ai-trial';
export const PREFIX = 'ai:v1:';
export const DAY_BUDGET = 1_000_000_000; // Integer nanodollars: $1.
export const MONTH_BUDGET = 10_000_000_000;
export const INPUT_TOKEN_CAP = 16_384;
export const OUTPUT_TOKEN_CAP = 400;
export const MODELS = {
  tutor: { name: 'muse-spark-1.3-contributor', input: 100, output: 200 },
  triage: { name: 'muse-spark-1.3', input: 1250, output: 4250 },
} as const;
// Rates in nanodollars/token. Official source and activation checks: docs/demo/ai-setup.md.
export const env = (name: string): string => {
  const runtime = globalThis as typeof globalThis & { Netlify?: { env: { get(name: string): string | undefined } } };
  return runtime.Netlify?.env.get(name) ?? process.env[name] ?? '';
};
export const json = (body: unknown, status = 200, headers: Record<string, string> = {}): Response =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
export class HttpError extends Error {
  status: number;
  constructor(status: number, reason: string) { super(reason); this.status = status; }
}
export async function readJSON(req: Request): Promise<Record<string, unknown>> {
  if (req.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') throw new HttpError(415, 'json_required');
  if (req.headers.has('content-encoding') && req.headers.get('content-encoding') !== 'identity') throw new HttpError(415, 'encoding_not_supported');
  const length = Number(req.headers.get('content-length'));
  if (length > 32768) throw new HttpError(413, 'body_too_large');
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, 'invalid_body');
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 32768) { await reader.cancel(); throw new HttpError(413, 'body_too_large'); }
      chunks.push(value);
    }
    const body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, 'invalid_body');
  } finally { reader.releaseLock(); }
}
export function allowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const configured = env('AI_ALLOWED_ORIGINS').split(',').map(s => s.trim()).filter(Boolean);
  // Explicit configuration avoids trusting Host, preview URLs, or forwarding headers.
  return configured.includes(origin) && new URL(origin).protocol === 'https:';
}
export function production(context: Context): boolean {
  return context.deploy?.context === 'production';
}
export function liveConfigured(context: Context): boolean {
  const verified = Date.parse(env('AI_PRICING_VERIFIED_AT'));
  const age = Date.now() - verified;
  return production(context) && env('AI_LIVE_ENABLED') === 'true'
    && age >= 0 && age < 30 * 86400000
    && !!env('META_MUSE_API_KEY') && env('AI_IP_HASH_SECRET').length >= 32
    && !!env('UPSTASH_REDIS_REST_URL') && !!env('UPSTASH_REDIS_REST_TOKEN')
    && !!env('TURNSTILE_SITE_KEY') && !!env('TURNSTILE_SECRET_KEY');
}
export function ipHash(context: Context): string {
  if (!context.ip || env('AI_IP_HASH_SECRET').length < 32) throw new Error('missing_trusted_ip');
  return createHmac('sha256', env('AI_IP_HASH_SECRET')).update(context.ip).digest('hex');
}
export function sessionId(req: Request): string | null {
  const matches = (req.headers.get('cookie') ?? '').split(';').map(s => s.trim()).filter(s => s.startsWith(`${COOKIE}=`));
  if (matches.length !== 1) return null;
  const value = matches[0].slice(COOKIE.length + 1);
  return /^[a-f0-9]{64}$/.test(value) ? value : null;
}
export function periods(now = Date.now()): { day: string; month: string; retryAt: string } {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
  // Find the next local midnight without assuming a fixed UTC offset (DST).
  let low = now, high = now + 26 * 3600000;
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(mid));
    if (day === date) low = mid; else high = mid;
  }
  return { day: date, month: date.slice(0, 7), retryAt: new Date(high).toISOString() };
}
export type Redis = (command: (string | number)[]) => Promise<unknown>;
export const redis: Redis = async command => {
  const url = env('UPSTASH_REDIS_REST_URL');
  if (!/^https:\/\/[a-zA-Z0-9-]+\.upstash\.io\/?$/.test(url) || !env('UPSTASH_REDIS_REST_TOKEN')) throw new Error('redis_not_configured');
  const response = await fetch(url, {
    method: 'POST', headers: { Authorization: `Bearer ${env('UPSTASH_REDIS_REST_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command), signal: AbortSignal.timeout(3000), redirect: 'error',
  });
  if (!response.ok) throw new Error('redis_unavailable');
  const payload = await response.json() as { result?: unknown; error?: unknown };
  if (payload.error || !Object.hasOwn(payload, 'result')) throw new Error('redis_unavailable');
  return payload.result;
};
export const evalScript = (db: Redis, script: string, keys: string[], args: (string | number)[] = []): Promise<unknown> =>
  db(['EVAL', script, keys.length, ...keys, ...args]);

// Every admission is serialized in Redis, including the budget reservation.
// Ledger and control have no TTL. Missing/malformed state always closes live access.
export const ADMIT = `
local ledger, control, leases, session, sm, sd, im, id, reservation = unpack(KEYS)
local now, day, month, amount, rid, ip, isTutor = tonumber(ARGV[1]), ARGV[2], ARGV[3], tonumber(ARGV[4]), ARGV[5], ARGV[6], ARGV[7]=='1'
if redis.call('HGET',control,'schema')~='1' or redis.call('HGET',control,'enabled')~='1' or redis.call('PTTL',control)~=-1 or redis.call('PTTL',ledger)~=-1 then return {'unavailable'} end
if isTutor and redis.call('GET',session)~=ip then return {'verification_required'} end
local lastDay, lastMonth = redis.call('HGET',ledger,'day'), redis.call('HGET',ledger,'month')
if redis.call('HGET',ledger,'schema')~='1' or not lastDay or not lastMonth or lastDay>day or lastMonth>month then return {'unavailable'} end
local rawD,rawM=redis.call('HGET',ledger,'day:'..lastDay),redis.call('HGET',ledger,'month:'..lastMonth)
if not rawD or not rawM or not string.match(rawD,'^%d+$') or not string.match(rawM,'^%d+$') then return {'unavailable'} end
local oldD,oldM=tonumber(rawD),tonumber(rawM)
if not oldD or not oldM or oldD>1000000000000 or oldM>1000000000000 then return {'unavailable'} end
local usedD, usedM = oldD, oldM
if lastDay~=day then usedD=0 end
if lastMonth~=month then usedM=0 end
if usedD+amount>1000000000 or usedM+amount>10000000000 then return {'budget_exhausted'} end
redis.call('ZREMRANGEBYSCORE',leases,'-inf',now)
if redis.call('ZSCORE',leases,session) then return {'busy'} end
if redis.call('ZCARD',leases)>=3 then return {'busy'} end
redis.call('ZREMRANGEBYSCORE',im,'-inf',now-60000)
if isTutor then redis.call('ZREMRANGEBYSCORE',sm,'-inf',now-60000) end
if redis.call('ZCARD',im)>=20 or (isTutor and redis.call('ZCARD',sm)>=3) then return {'cooldown'} end
if tonumber(redis.call('GET',id) or '0')>=100 or (isTutor and tonumber(redis.call('GET',sd) or '0')>=10) then return {'allowance_exhausted'} end
if redis.call('EXISTS',reservation)==1 then return {'unavailable'} end
redis.call('HSET',ledger,'day',day,'month',month,'day:'..day,usedD+amount,'month:'..month,usedM+amount)
redis.call('ZADD',leases,now+90000,session)
redis.call('ZADD',im,now,rid); redis.call('PEXPIRE',im,120000)
redis.call('INCR',id); redis.call('EXPIRE',id,172800)
local remaining=0
if isTutor then
 redis.call('ZADD',sm,now,rid); redis.call('PEXPIRE',sm,120000)
 remaining=10-redis.call('INCR',sd); redis.call('EXPIRE',sd,172800)
end
redis.call('HSET',reservation,'amount',amount,'day',day,'month',month,'session',session,'rid',rid,'done','0')
redis.call('EXPIRE',reservation,3456000)
return {'ok',remaining}
`;
// Refund exactly once; never refund an uncertain call, even after leases expire.
export const SETTLE = `
local amount=tonumber(redis.call('HGET',KEYS[2],'amount'))
if not amount or redis.call('HGET',KEYS[2],'done')~='0' then return 0 end
local day,month=redis.call('HGET',KEYS[2],'day'),redis.call('HGET',KEYS[2],'month')
local usedD,usedM=tonumber(redis.call('HGET',KEYS[1],'day:'..day)),tonumber(redis.call('HGET',KEYS[1],'month:'..month))
local actual=tonumber(ARGV[1])
if not usedD or not usedM or usedD<amount or usedM<amount or redis.call('HGET',KEYS[1],'schema')~='1' then return -1 end
if actual<0 then actual=amount end
if actual>amount then
 redis.call('HSET',KEYS[4],'enabled','0')
 redis.call('HSET',KEYS[2],'done','1')
 return -1
end
redis.call('HINCRBY',KEYS[1],'day:'..day,actual-amount)
redis.call('HINCRBY',KEYS[1],'month:'..month,actual-amount)
redis.call('HSET',KEYS[2],'done','1','charged',actual)
local session=redis.call('HGET',KEYS[2],'session')
-- Only remove our own lease; a later call might hold the same session.
if tonumber(redis.call('ZSCORE',KEYS[3],session) or '0')==tonumber(ARGV[2]) then redis.call('ZREM',KEYS[3],session) end
return 1
`;
export const ISSUE = `
if redis.call('HGET',KEYS[1],'schema')~='1' or redis.call('HGET',KEYS[1],'enabled')~='1' then return 0 end
redis.call('ZREMRANGEBYSCORE',KEYS[2],'-inf',ARGV[1]-3600000)
if redis.call('ZCARD',KEYS[2])>=10 then return 0 end
redis.call('ZADD',KEYS[2],ARGV[1],ARGV[2]); redis.call('EXPIRE',KEYS[2],7200)
return 1
`;
export const INITIALIZE = `
if redis.call('EXISTS',KEYS[1])==1 or redis.call('EXISTS',KEYS[2])==1 then return 0 end
redis.call('HSET',KEYS[1],'schema','1','day',ARGV[1],'month',ARGV[2],'day:'..ARGV[1],ARGV[3],'month:'..ARGV[2],ARGV[4])
redis.call('HSET',KEYS[2],'schema','1','enabled','0')
return 1
`;
export const CONTROL = `
if redis.call('HGET',KEYS[1],'schema')~='1' or redis.call('HGET',KEYS[2],'schema')~='1' then return 0 end
local day,month=redis.call('HGET',KEYS[1],'day'),redis.call('HGET',KEYS[1],'month')
if not day or not month or not tonumber(redis.call('HGET',KEYS[1],'day:'..day)) or not tonumber(redis.call('HGET',KEYS[1],'month:'..month)) then return 0 end
redis.call('HSET',KEYS[2],'enabled',ARGV[1]); return 1
`;
export async function adminUser(): Promise<{ id: string; roles: string[] } | null> {
  // Dynamic import keeps the pure security module usable in offline tests.
  try {
    const { getUser } = await import('@netlify/identity');
    const user = await getUser();
    return user ? { id: user.id, roles: user.roles ?? [] } : null;
  } catch { return null; }
}
export async function requireAdmin(getUser = adminUser): Promise<{ id: string }> {
  const user = await getUser();
  if (!user) throw new HttpError(401, 'unauthorized');
  if (!user.roles.includes('admin')) throw new HttpError(403, 'forbidden');
  return user;
}
export const randomSession = (): string => randomBytes(32).toString('hex');
export const requestId = (): string => randomUUID();
export function audit(context: Context, fields: Record<string, string | number | boolean>): void {
  console.log(JSON.stringify({ event: 'ai', requestId: context.requestId ?? requestId(), ...fields }));
}
