import { createHash, randomUUID } from 'node:crypto';
import type { Context } from '@netlify/functions';

export const OUTPUT_TOKEN_CAP = 400;
export const MODELS = { tutor: 'muse-spark-1.3-contributor', triage: 'muse-spark-1.3' } as const;
export const LIMITS = { perMinute: 20, perDay: 100, concurrent: 3, perIPConcurrent: 1 } as const;
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
  return production(context) && !!env('META_MUSE_API_KEY').trim();
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
export interface LiveControl { read(): Promise<boolean>; write(enabled: boolean): Promise<void> }
// Blobs stores only the switch, never counters or balances. Strong reads make a
// completed admin pause visible to the next request across function instances.
export const liveControl: LiveControl = {
  async read() {
    const { getStore } = await import('@netlify/blobs');
    const value = await getStore({ name: 'ai-live-control-production', consistency: 'strong' }).get('state', { type: 'json' }) as { enabled?: unknown } | null;
    return value?.enabled === true;
  },
  async write(enabled) {
    const { getStore } = await import('@netlify/blobs');
    await getStore({ name: 'ai-live-control-production', consistency: 'strong' }).setJSON('state', { enabled });
  },
};
interface Counter { minute: number[]; day: string; count: number; active: number; lastSeen: number }
export class LocalLimits {
  private readonly clients = new Map<string, Counter>();
  private active = 0;
  admit(ip: string, now: number): { allowed: boolean; reason?: string; remaining?: number; retryAt?: string; release?: () => void } {
    if (!ip) return { allowed: false, reason: 'unavailable' };
    const key = createHash('sha256').update(ip).digest('hex');
    const { day, retryAt } = periods(now);
    for (const [id, counter] of this.clients) if (counter.active === 0 && now - counter.lastSeen > 26 * 3600000) this.clients.delete(id);
    let counter = this.clients.get(key);
    if (!counter) {
      if (this.clients.size >= 10000) return { allowed: false, reason: 'busy', retryAt: new Date(now + 60000).toISOString() };
      counter = { minute: [], day, count: 0, active: 0, lastSeen: now };
      this.clients.set(key, counter);
    }
    counter.lastSeen = now;
    counter.minute = counter.minute.filter(hit => hit > now - 60000);
    if (counter.day !== day) { counter.day = day; counter.count = 0; }
    if (counter.count >= LIMITS.perDay) return { allowed: false, reason: 'allowance_exhausted', retryAt };
    if (counter.minute.length >= LIMITS.perMinute) return { allowed: false, reason: 'cooldown', retryAt: new Date(counter.minute[0] + 60000).toISOString() };
    if (this.active >= LIMITS.concurrent || counter.active >= LIMITS.perIPConcurrent) return { allowed: false, reason: 'busy', retryAt: new Date(now + 20000).toISOString() };
    counter.minute.push(now); counter.count++; counter.active++; this.active++;
    let released = false;
    return { allowed: true, remaining: LIMITS.perDay - counter.count, release: () => {
      if (released) return; released = true; counter!.active--; this.active--;
    } };
  }
}
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
export const requestId = (): string => randomUUID();
export function audit(context: Context, fields: Record<string, string | number | boolean>): void {
  console.log(JSON.stringify({ event: 'ai', requestId: context.requestId ?? requestId(), ...fields }));
}
