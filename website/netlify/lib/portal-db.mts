import { getDatabase } from '@netlify/database';

export interface Queryable {
  query(text: string, values?: unknown[]): Promise<{ rows: Record<string, any>[]; rowCount?: number | null }>;
}
export interface PortalPool extends Queryable {
  connect(): Promise<Queryable & { release(): void }>;
}
let pool: PortalPool | undefined;
export function portalPool(): PortalPool {
  return pool ??= getDatabase().pool as unknown as PortalPool;
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
