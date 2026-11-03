import pg from 'pg';
import { env } from './ai-security.mts';

export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, any>[]; rowCount?: number | null }>;
}
export interface PortalPool extends Queryable {
  connect(): Promise<Queryable & { release(): void }>;
}
export function createPortalPool(connectionString: string, max = 5): pg.Pool {
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('INVALID_DATABASE_URL');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  // Keep TLS validation explicit: connection-string sslmode must not replace it.
  for (const key of ['sslmode','sslcert','sslkey','sslrootcert']) url.searchParams.delete(key);
  const result = new pg.Pool({ connectionString: url.toString(), max, idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000, allowExitOnIdle: true,
    ssl: local ? false : { rejectUnauthorized: true }, enableChannelBinding: !local });
  result.on('error', () => console.error('portal_database_connection_error'));
  return result;
}
let pool: PortalPool | undefined;
export function portalPool(): PortalPool {
  const url = env('PORTAL_DATABASE_URL');
  if (!url) throw new Error('PORTAL_DATABASE_URL_NOT_CONFIGURED');
  return pool ??= createPortalPool(url) as unknown as PortalPool;
}
export async function transaction<T>(pool: PortalPool, action: (db: Queryable) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const value = await action(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
